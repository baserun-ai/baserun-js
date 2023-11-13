import { v4 } from 'uuid';
import stringify from 'json-stringify-safe';
import { AutoLLMLog, Trace, TraceType, Log } from './types';
import { getTimestamp } from './utils/helpers';
import { Evals } from './evals/evals';
import { Eval } from './evals/types';
import { OpenAIWrapper } from './patches/openai';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb.js';
import { AnthropicWrapper } from './patches/anthropic';
import {
  EndRunRequest,
  Run,
  StartRunRequest,
  Log as ProtoLog,
  SubmitLogRequest,
  SubmitSpanRequest,
  Span,
} from './v1/generated/baserun_pb';
import { getCurrentRun } from './utils/getCurrentRun';
import { getOrCreateSubmissionService } from './backend/submissionService';
import { logToSpanOrLog } from './utils/logToSpan';

const TraceExecutionIdKey = 'baserun_trace_execution_id';
const TraceNameKey = 'baserun_trace_name';
const TraceInputsKey = 'baserun_trace_inputs';
const TraceStartTimestampKey = 'baserun_trace_start_timestamp';
const TraceBufferKey = 'baserun_trace_buffer';
const TraceTypeKey = 'baserun_trace_type';
const TraceMetadataKey = 'baserun_trace_metadata';
const TraceEvalsKey = 'baserun_trace_evals';

export class Baserun {
  static evals = new Evals(Baserun._appendToEvals);
  private static _apiKey: string | undefined = process.env.BASERUN_API_KEY;
  private static _apiUrl: string =
    process.env.BASERUN_API_URL ?? 'https://baserun.ai/api/v1';

  static monkeyPatch(): void {
    OpenAIWrapper.init(Baserun._handleAutoLLM);
    AnthropicWrapper.init(Baserun._handleAutoLLM);
  }

  static init(): void {
    if (!Baserun._apiKey) {
      throw new Error(
        'Baserun API key is missing. Ensure the BASERUN_API_KEY environment variable is set.',
      );
    }

    if (global.baserunInitialized) {
      return;
    }

    global.baserunInitialized = true;
    global.baserunTraces = [];

    Baserun.monkeyPatch();
  }

  static markTraceStart(
    type: TraceType,
    name: string,
    inputs: string[] = [],
    metadata?: object,
  ): Map<string, any> | undefined {
    if (!global.baserunInitialized) {
      return;
    }

    const traceStore = new Map();
    traceStore.set(TraceExecutionIdKey, v4());
    traceStore.set(TraceNameKey, name);
    traceStore.set(
      TraceInputsKey,
      inputs.map((input) => stringify(input)),
    );
    traceStore.set(TraceStartTimestampKey, getTimestamp());
    traceStore.set(TraceTypeKey, type);
    traceStore.set(TraceBufferKey, []);
    traceStore.set(TraceMetadataKey, metadata);
    return traceStore;
  }

  static markTraceEnd(
    {
      error,
      result,
    }: {
      error?: Error;
      result?: string | null;
    },
    traceStore?: Map<string, any>,
  ): void {
    if (!global.baserunInitialized) {
      return;
    }

    if (!traceStore) {
      return;
    }

    const traceExecutionId = traceStore.get(TraceExecutionIdKey);
    const name = traceStore.get(TraceNameKey);
    const inputs = traceStore.get(TraceInputsKey);
    const startTimestamp = traceStore.get(TraceStartTimestampKey);
    const buffer = traceStore.get(TraceBufferKey);
    const type = traceStore.get(TraceTypeKey);
    const metadata = traceStore.get(TraceMetadataKey);
    const evals = traceStore.get(TraceEvalsKey);
    const completionTimestamp = getTimestamp();
    if (error) {
      Baserun._storeTrace({
        type,
        testName: name,
        testInputs: inputs,
        id: traceExecutionId,
        error: String(error),
        startTimestamp,
        completionTimestamp,
        steps: buffer || [],
        metadata,
        evals,
      });
    } else {
      Baserun._storeTrace({
        type,
        testName: name,
        testInputs: inputs,
        id: traceExecutionId,
        result: result ?? '',
        startTimestamp,
        completionTimestamp,
        steps: buffer || [],
        metadata,
        evals,
      });
    }
  }

  static test(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      if (!global.baserunInitialized) return originalMethod.apply(this, args);

      global.baserunTraceStore = Baserun.markTraceStart(
        TraceType.Test,
        originalMethod.name,
      );
      try {
        let result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          result = await result;
        }
        Baserun.markTraceEnd({ result }, global.baserunTraceStore);
      } catch (e) {
        Baserun.markTraceEnd({ error: e as Error }, global.baserunTraceStore);
      } finally {
        global.baserunTraceStore = undefined;
      }
    };

    return descriptor;
  }

  static trace<T extends (...args: any[]) => any>(
    fn: T,
    metadata?: object,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    if (!global.baserunInitialized) return fn;

    const store = global.baserunTraceStore;
    if (store && store.has(TraceExecutionIdKey)) {
      console.info(
        'baserun.trace was called inside of an existing Baserun decorated trace. The new trace will be ignored.',
      );
      return fn;
    }

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      await Baserun.getOrCreateCurrentRun({
        name: fn.name,
        traceType: Run.RunType.RUN_TYPE_PRODUCTION,
        metadata,
      });

      // this is sth we might have to clean up, as we probably don't want run and store to exist at the same time
      global.baserunTraceStore = Baserun.markTraceStart(
        TraceType.Production,
        fn.name,
        args,
        metadata,
      );

      try {
        const result = await fn(...args);
        Baserun.markTraceEnd(
          { result: result != null ? stringify(result) : '' },
          global.baserunTraceStore,
        );
        return result;
      } catch (err) {
        Baserun.markTraceEnd({ error: err as Error }, global.baserunTraceStore);
        throw err;
      } finally {
        global.baserunTraceStore = undefined;
        /* Already silently catches all errors and warns */
        await Baserun.flush();
      }
    };
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
  }): Promise<Run> {
    const currentRun = getCurrentRun();
    if (currentRun) {
      return Promise.resolve(currentRun);
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

    global.baserunCurrentRun = run;

    if (suiteId ?? global.baserunTestSuite) {
      run.setSuiteId(suiteId ?? global.baserunTestSuite.getId());
    }

    run.setStartTimestamp(Timestamp.fromDate(startTimestamp ?? new Date()));
    if (completionTimestamp) {
      run.setCompletionTimestamp(Timestamp.fromDate(completionTimestamp));
    }

    const startRunRequest = new StartRunRequest().setRun(run);

    return new Promise<Run>((resolve, reject) => {
      getOrCreateSubmissionService().startRun(startRunRequest, (error) => {
        if (error) {
          console.error('Failed to submit run start to Baserun: ', error);
          reject(error);
        } else {
          resolve(run);
        }
      });
    });
  }

  static finishRun(run: Run): void {
    run.setCompletionTimestamp(Timestamp.fromDate(new Date()));

    const endRunRequest = new EndRunRequest().setRun(run);
    getOrCreateSubmissionService().endRun(endRunRequest, (error) => {
      if (error) {
        console.error('Failed to submit run end to Baserun: ', error);
      }
    });

    global.baserunCurrentRun = undefined;
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

    const log = new ProtoLog()
      .setRunId(run.getRunId())
      .setName(name)
      .setPayload(stringify(payload))
      .setTimestamp(Timestamp.fromDate(new Date()));
    const submitLogRequest = new SubmitLogRequest().setRun(run).setLog(log);

    getOrCreateSubmissionService().submitLog(submitLogRequest, (error) => {
      if (error) {
        console.error('Failed to submit log to Baserun: ', error);
      }
    });
  }

  static async flush(): Promise<string | undefined> {
    if (!global.baserunInitialized) {
      console.warn(
        'Baserun has not been initialized. No data will be flushed.',
      );
      return;
    }

    if (global.baserunTraces.length === 0) return;

    try {
      const traces = global.baserunTraces as Trace[];
      for (const trace of traces) {
        const run = await Baserun.getOrCreateCurrentRun({
          name: trace.testName,
          traceType:
            trace.type === TraceType.Production
              ? Run.RunType.RUN_TYPE_PRODUCTION
              : Run.RunType.RUN_TYPE_TEST,
          metadata: trace.metadata,
        });

        await Promise.all(
          trace.steps.map((step) =>
            Baserun.submitLogOrSpan(logToSpanOrLog(step, run.getRunId()), run),
          ),
        );

        // todo: deal with evals
        Baserun.finishRun(run);
      }
    } catch (error) {
      console.warn(`Failed to upload results to Baserun: `, error);
    } finally {
      global.baserunTraces = [];
    }
  }

  static _storeTrace(traceData: Trace): void {
    global.baserunTraces.push(traceData);
  }

  private static submitLogOrSpan(
    logOrSpan: ProtoLog | Span,
    run: Run,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (logOrSpan instanceof ProtoLog) {
        const logRequest = new SubmitLogRequest().setLog(logOrSpan).setRun(run);
        getOrCreateSubmissionService().submitLog(logRequest, (error) => {
          if (error) {
            console.error('Failed to submit log to Baserun: ', error);
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      } else {
        const spanRequest = new SubmitSpanRequest()
          .setSpan(logOrSpan)
          .setRun(run);
        getOrCreateSubmissionService().submitSpan(spanRequest, (error) => {
          if (error) {
            console.error('Failed to submit span to Baserun: ', error);
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      }
    });
  }

  static async _handleAutoLLM(logEntry: AutoLLMLog): Promise<void> {
    const run = await Baserun.getOrCreateCurrentRun({
      name: `${logEntry.provider} ${logEntry.type}`,
      startTimestamp: new Date(logEntry.startTimestamp),
      completionTimestamp: new Date(logEntry.completionTimestamp),
      // todo: add metadata
    });

    const span = logToSpanOrLog(logEntry, run.getRunId());

    return Baserun.submitLogOrSpan(span, run);
  }

  static _appendToBuffer(logEntry: Log): void {
    const store = global.baserunTraceStore;
    if (!store) {
      return;
    }

    const buffer = store.get(TraceBufferKey) || [];
    buffer.push(logEntry);
    store.set(TraceBufferKey, buffer);
  }

  static _appendToEvals(evalEntry: Eval<any>): void {
    const store = global.baserunTraceStore;
    if (!store) {
      return;
    }

    const evals = store.get(TraceEvalsKey) || [];
    evals.push(evalEntry);
    store.set(TraceEvalsKey, evals);
  }
}
