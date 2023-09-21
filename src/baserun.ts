import { v4 } from 'uuid';
import stringify from 'json-stringify-safe';
import { OpenAIInstrumentor } from './instrumentation/openai';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { context, SpanKind, trace } from '@opentelemetry/api';
import {
  SimpleSpanProcessor,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import { BaserunExporter } from './exporter';
import {
  EndRunRequest,
  Log,
  Run,
  StartRunRequest,
  SubmitLogRequest,
} from './v1/generated/baserun_pb';
import { BASERUN_RUN_KEY } from './instrumentation/span_attributes';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { Evals } from './evals/evals';
import { getOrCreateSubmissionService } from './grpc';
import { getCurrentRun } from './current_run';
import { AnthropicInstrumentor } from './instrumentation/anthropic';

export class Baserun {
  static _apiUrl: string =
    process.env.BASERUN_API_URL ?? 'https://baserun.ai/api/v1';
  static evals = new Evals();

  static instrument(): void {
    registerInstrumentations({
      instrumentations: [new OpenAIInstrumentor(), new AnthropicInstrumentor()],
    });
  }

  static init(): void {
    if (global.baserunInitialized) {
      return;
    }

    global.baserunInitialized = true;

    let tracerProvider = trace.getTracerProvider();
    if (!(tracerProvider instanceof NodeTracerProvider)) {
      tracerProvider = new NodeTracerProvider();
      trace.setGlobalTracerProvider(tracerProvider);
    }

    const nodeTraceProvider = tracerProvider as NodeTracerProvider;
    nodeTraceProvider.getTracer('baserun');

    // TODO (Adam) why isn't BatchSpanProcessor working???
    const processor = new SimpleSpanProcessor(new BaserunExporter());
    nodeTraceProvider.addSpanProcessor(processor);
    nodeTraceProvider.register();

    Baserun.instrument();
  }

  static getOrCreateCurrentRun({
    name,
    suiteId,
    startTimestamp,
    completionTimestamp,
    traceType,
    metadata,
  }: {
    name: string;
    suiteId?: string;
    startTimestamp?: Date;
    completionTimestamp?: Date;
    traceType?: Run.RunType;
    metadata?: object;
  }) {
    const currentRun = getCurrentRun();
    if (currentRun) {
      return currentRun;
    }

    const runId = v4();
    if (!traceType) {
      traceType = global.baserunTestSuite
        ? Run.RunType.RUN_TYPE_TEST
        : Run.RunType.RUN_TYPE_PRODUCTION;
    }

    const run = new Run()
      .setRunId(runId)
      .setRunType(traceType)
      .setName(name)
      .setMetadata(stringify(metadata ?? {}));
    if (suiteId ?? global.baserunTestSuite) {
      run.setSuiteId(suiteId ?? global.baserunTestSuite.getId());
    }

    run.setStartTimestamp(Timestamp.fromDate(startTimestamp ?? new Date()));
    if (completionTimestamp) {
      run.setCompletionTimestamp(Timestamp.fromDate(completionTimestamp));
    }

    const startRunRequest = new StartRunRequest().setRun(run);

    getOrCreateSubmissionService().startRun(
      startRunRequest,
      (error, _response) => {
        if (error) {
          console.error('Failed to submit run start to Baserun: ', error);
        }
      },
    );

    return run;
  }

  static finishRun(run: Run): void {
    run.setCompletionTimestamp(Timestamp.fromDate(new Date()));

    const endRunRequest = new EndRunRequest().setRun(run);
    getOrCreateSubmissionService().endRun(endRunRequest, (error, _response) => {
      if (error) {
        console.error('Failed to submit run end to Baserun: ', error);
      }
    });
  }

  static log(name: string, payload: object | string): void {
    if (!global.baserunInitialized) return;

    const run = getCurrentRun();
    if (!run) {
      console.info(
        'baserun.log was called outside of a Baserun decorated trace. The log will be ignored.',
      );
      return;
    }

    const log = new Log()
      .setRunId(run.getRunId())
      .setName(name)
      .setPayload(stringify(payload))
      .setTimestamp(Timestamp.fromDate(new Date()));
    const submitLogRequest = new SubmitLogRequest().setRun(run).setLog(log);

    getOrCreateSubmissionService().submitLog(
      submitLogRequest,
      (error, _response) => {
        if (error) {
          console.error('Failed to submit log to Baserun: ', error);
        }
      },
    );
  }

  static trace<T extends (...args: any[]) => any>(
    fn: T,
    metadata?: object,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    if (!global.baserunInitialized) return fn;

    const tracerProvider = trace.getTracerProvider();
    const tracer = tracerProvider.getTracer('baserun');

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const run = Baserun.getOrCreateCurrentRun({
        name: fn.name,
        traceType: Run.RunType.RUN_TYPE_PRODUCTION,
        metadata,
      });

      // TODO (Adam) delete this??
      const span = tracer.startSpan(`baserun.parent.${fn.name}`, {
        kind: SpanKind.CLIENT,
      });

      return context.with(
        context.active().setValue(BASERUN_RUN_KEY, run),
        async () => {
          try {
            const result = await fn(...args);
            run.setResult(result ? stringify(result) : '');
            return result;
          } catch (err) {
            run.setError(String(err));
            throw err;
          } finally {
            Baserun.finishRun(run);
            span.end();
          }
        },
      );
    };
  }
}
