import { v4 } from 'uuid';
import {
  AutoLLMLog,
  BaserunStepType,
  Log,
  StandardLog,
  Trace,
  TraceType,
} from './types';
import { OpenAIEdgeWrapper } from './patches/openai_edge';
import { getTimestamp } from './helpers';
import { Evals } from './evals/evals';
import { Eval } from './evals/types';
import { OpenAIWrapper } from './patches/openai';
import { AnthropicWrapper } from './patches/anthropic';
import { loadModule } from './loader';

const TraceExecutionIdKey = 'baserun_trace_execution_id';
const TraceNameKey = 'baserun_trace_name';
const TraceInputsKey = 'baserun_trace_inputs';
const TraceStartTimestampKey = 'baserun_trace_start_timestamp';
const TraceBufferKey = 'baserun_trace_buffer';
const TraceTypeKey = 'baserun_trace_type';
const TraceMetadataKey = 'baserun_trace_metadata';
const TraceEvalsKey = 'baserun_trace_evals';

type FetchInstance = (
  input: URL | RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

let fetch: FetchInstance;
if (typeof globalThis.fetch === 'undefined') {
  fetch = loadModule(module, 'node-fetch');
} else {
  fetch = globalThis.fetch;
}

export class Baserun {
  static evals = new Evals(Baserun._appendToEvals);
  static _apiKey: string | undefined = process.env.BASERUN_API_KEY;
  static _apiUrl: string =
    process.env.BASERUN_API_URL ?? 'https://baserun.ai/api/v1';

  static monkeyPatch(): void {
    OpenAIEdgeWrapper.init(Baserun._handleAutoLLM);
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
      inputs.map((input) => JSON.stringify(input)),
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

  static log(name: string, payload: object | string): void {
    if (!global.baserunInitialized) return;

    const store = global.baserunTraceStore;

    if (!store || !store.has(TraceExecutionIdKey)) {
      console.info(
        'baserun.log was called outside of a Baserun decorated trace. The log will be ignored.',
      );
      return;
    }

    const logEntry: StandardLog = {
      stepType: BaserunStepType.Log,
      name,
      payload,
      timestamp: getTimestamp(),
    };

    Baserun._appendToBuffer(logEntry);
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
      global.baserunTraceStore = Baserun.markTraceStart(
        TraceType.Production,
        fn.name,
        args,
        metadata,
      );
      try {
        const result = await fn(...args);
        Baserun.markTraceEnd(
          { result: result != null ? JSON.stringify(result) : '' },
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

  static async flush(): Promise<string | undefined> {
    if (!global.baserunInitialized) {
      console.warn(
        'Baserun has not been initialized. No data will be flushed.',
      );
      return;
    }

    if (global.baserunTraces.length === 0) return;

    try {
      const headers = {
        Authorization: `Bearer ${Baserun._apiKey}`,
        'Content-Type': 'application/json',
      };

      if (
        global.baserunTraces.every((trace) => trace.type === TraceType.Test)
      ) {
        const apiUrl = `${Baserun._apiUrl}/runs`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ testExecutions: global.baserunTraces }),
        });

        const data = await response.json();
        const testRunId = (data as { id: string }).id;
        const url = new URL(apiUrl);
        return `${url.protocol}//${url.host}/runs/${testRunId}`;
      } else if (
        global.baserunTraces.every(
          (trace) => trace.type === TraceType.Production,
        )
      ) {
        await fetch(`${Baserun._apiUrl}/traces`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ traces: global.baserunTraces }),
        });
      } else {
        console.warn('Inconsistent trace types, skipping Baserun upload');
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

  static async _handleAutoLLM(logEntry: AutoLLMLog): Promise<void> {
    const store = global.baserunTraceStore;
    if (store && store.has(TraceExecutionIdKey)) {
      Baserun._appendToBuffer(logEntry);
      return;
    }

    global.baserunTraces.push({
      type: TraceType.Production,
      testName: `${logEntry.provider} ${logEntry.type}`,
      testInputs: [],
      id: v4(),
      result: String(logEntry.output),
      startTimestamp: logEntry.startTimestamp,
      completionTimestamp: logEntry.completionTimestamp,
      steps: [logEntry],
      evals: [],
    });

    await Baserun.flush();
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
