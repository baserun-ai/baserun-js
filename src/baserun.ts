import { v4 } from 'uuid';
import stringify from 'json-stringify-safe';
import { AutoLLMLog, Trace, Log } from './types.js';
// import { getTimestamp } from './utils/helpers.js';
import { Evals } from './evals/evals.js';
import { Eval } from './evals/types.js';
import { OpenAIWrapper } from './patches/openai.js';
import { AnthropicWrapper } from './patches/anthropic.js';
import {
  EndRunRequest,
  Run,
  StartRunRequest,
  Log as ProtoLog,
  SubmitLogRequest,
  SubmitSpanRequest,
  Span,
  Run_RunType,
} from './v1/gen/baserun.js';
import { deleteCurrentRun, getCurrentRun } from './utils/getCurrentRun.js';
import { getOrCreateSubmissionService } from './backend/submissionService.js';
import { logToSpanOrLog } from './utils/logToSpan.js';
import { Timestamp } from './v1/gen/google/protobuf/timestamp.js';

// TODO: clean this up. no need for this
const TraceExecutionIdKey = 'baserun_trace_execution_id';
// const TraceNameKey = 'baserun_trace_name';
// const TraceInputsKey = 'baserun_trace_inputs';
// const TraceStartTimestampKey = 'baserun_trace_start_timestamp';
const TraceBufferKey = 'baserun_trace_buffer';
// const TraceTypeKey = 'baserun_trace_type';
// const TraceMetadataKey = 'baserun_trace_metadata';
const TraceEvalsKey = 'baserun_trace_evals';

type TraceOptions = {
  metadata?: any;
  name?: string;
};

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

  // static markTraceStart(
  //   type: TraceType,
  //   name: string,
  //   inputs: string[] = [],
  //   metadata?: object,
  // ): Map<string, any> | undefined {
  //   if (!global.baserunInitialized) {
  //     return;
  //   }

  //   const traceStore = new Map();
  //   traceStore.set(TraceExecutionIdKey, v4());
  //   traceStore.set(TraceNameKey, name);
  //   traceStore.set(
  //     TraceInputsKey,
  //     inputs.map((input) => stringify(input)),
  //   );
  //   traceStore.set(TraceStartTimestampKey, getTimestamp());
  //   traceStore.set(TraceTypeKey, type);
  //   traceStore.set(TraceBufferKey, []);
  //   traceStore.set(TraceMetadataKey, metadata);
  //   return traceStore;
  // }

  // static markTraceEnd(
  //   {
  //     error,
  //     result,
  //   }: {
  //     error?: Error;
  //     result?: string | null;
  //   },
  //   traceStore?: Map<string, any>,
  // ): void {
  //   if (!global.baserunInitialized) {
  //     return;
  //   }

  //   if (!traceStore) {
  //     return;
  //   }

  //   const traceExecutionId = traceStore.get(TraceExecutionIdKey);
  //   const name = traceStore.get(TraceNameKey);
  //   const inputs = traceStore.get(TraceInputsKey);
  //   const startTimestamp = traceStore.get(TraceStartTimestampKey);
  //   const buffer = traceStore.get(TraceBufferKey);
  //   const type = traceStore.get(TraceTypeKey);
  //   const metadata = traceStore.get(TraceMetadataKey);
  //   const evals = traceStore.get(TraceEvalsKey);
  //   const completionTimestamp = getTimestamp();
  //   if (error) {
  //     Baserun._storeTrace({
  //       type,
  //       testName: name,
  //       testInputs: inputs,
  //       id: traceExecutionId,
  //       error: String(error),
  //       startTimestamp,
  //       completionTimestamp,
  //       steps: buffer || [],
  //       metadata,
  //       evals,
  //     });
  //   } else {
  //     Baserun._storeTrace({
  //       type,
  //       testName: name,
  //       testInputs: inputs,
  //       id: traceExecutionId,
  //       result: result ?? '',
  //       startTimestamp,
  //       completionTimestamp,
  //       steps: buffer || [],
  //       metadata,
  //       evals,
  //     });
  //   }
  // }

  static test(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      if (!global.baserunInitialized) return originalMethod.apply(this, args);

      // TODO: implement based on `Run`

      // global.baserunTraceStore = Baserun.markTraceStart(
      //   TraceType.Test,
      //   originalMethod.name,
      // );
      // try {
      //   let result = originalMethod.apply(this, args);
      //   if (result instanceof Promise) {
      //     result = await result;
      //   }
      //   Baserun.markTraceEnd({ result }, global.baserunTraceStore);
      // } catch (e) {
      //   Baserun.markTraceEnd({ error: e as Error }, global.baserunTraceStore);
      // } finally {
      //   global.baserunTraceStore = undefined;
      // }
    };

    return descriptor;
  }

  static trace<T extends (...args: any[]) => any>(
    fn: T,
    traceOptions?: TraceOptions,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    if (!global.baserunInitialized) return fn;

    const metadata = traceOptions?.metadata;
    const name = traceOptions?.name ?? fn.name;

    const store = global.baserunTraceStore;
    if (store && store.has(TraceExecutionIdKey)) {
      console.info(
        'baserun.trace was called inside of an existing Baserun decorated trace. The new trace will be ignored.',
      );
      return fn;
    }

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // todo: check if we need to use the args
      const run = await Baserun.getOrCreateCurrentRun({
        name,
        traceType: Run_RunType.PRODUCTION,
        metadata,
      });

      // this is sth we might have to clean up, as we probably don't want run and store to exist at the same time
      // global.baserunTraceStore = Baserun.markTraceStart(
      //   TraceType.Production,
      //   name,
      //   args,
      //   metadata,
      // );

      try {
        const result = await fn(...args);
        run.result = JSON.stringify(result);
        return result;
      } catch (err) {
        run.error = String((err as Error).stack ?? err);
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
    traceType?: Run_RunType;
    metadata?: object;
  }): Promise<Run> {
    const currentRun = getCurrentRun();
    if (currentRun) {
      return Promise.resolve(currentRun);
    }

    const runId = v4();
    if (!traceType) {
      traceType = global.baserunTestSuite
        ? Run_RunType.TEST
        : Run_RunType.PRODUCTION;
    }

    const run: Run = {
      runId,
      runType: traceType,
      name,
      metadata: stringify(metadata ?? {}),
      suiteId: '',
      sessionId: '',
      inputs: [],
      error: '',
      result: '',
      startTimestamp: Timestamp.fromDate(new Date()),
      completionTimestamp: Timestamp.fromDate(new Date()),
    };

    global.baserunCurrentRun = run;

    if (suiteId ?? global.baserunTestSuite) {
      // todo: make sure getId still works here
      run.suiteId = suiteId ?? global.baserunTestSuite.getId();
    }

    run.startTimestamp = Timestamp.fromDate(startTimestamp ?? new Date());
    if (completionTimestamp) {
      run.startTimestamp = Timestamp.fromDate(completionTimestamp);
    }

    const startRunRequest: StartRunRequest = { run };

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
    run.completionTimestamp = Timestamp.fromDate(new Date());
    const endRunRequest: EndRunRequest = { run };

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

    const log: ProtoLog = {
      name,
      payload: stringify(payload),
      timestamp: Timestamp.fromDate(new Date()),
      runId: run.runId,
    };

    Baserun.submitLogOrSpan(log, run);
  }

  static async flush(): Promise<string | undefined> {
    if (!global.baserunInitialized) {
      console.warn(
        'Baserun has not been initialized. No data will be flushed.',
      );
      return;
    }

    const run = getCurrentRun();

    if (run) {
      await Baserun.finishRun(run);
    }

    deleteCurrentRun();

    return;
  }

  static _storeTrace(traceData: Trace): void {
    global.baserunTraces.push(traceData);
  }

  static submitLogOrSpan(logOrSpan: ProtoLog | Span, run: Run): Promise<void> {
    return new Promise((resolve, reject) => {
      // handle Log
      if (isSpan(logOrSpan)) {
        const spanRequest: SubmitSpanRequest = {
          run,
          span: logOrSpan,
        };
        getOrCreateSubmissionService().submitSpan(spanRequest, (error) => {
          if (error) {
            console.error('Failed to submit span to Baserun: ', error);
            reject(error);
          } else {
            resolve(undefined);
          }
        });
        // otherwise it must be a Span
      } else {
        const logRequest: SubmitLogRequest = {
          log: logOrSpan,
          run,
        };
        getOrCreateSubmissionService().submitLog(logRequest, (error) => {
          if (error) {
            console.error('Failed to submit log to Baserun: ', error);
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

    const span = logToSpanOrLog(logEntry, run.runId);

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

function isSpan(log: ProtoLog | Span): log is Span {
  return Object.prototype.hasOwnProperty.call(log, 'spanId');
}
