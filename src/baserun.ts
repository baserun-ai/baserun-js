import { v4 } from 'uuid';
import axios from 'axios';
import { BaserunStepType, Log, Test } from './types';
import { monkeyPatchOpenAI } from './openai';
import { getTimestamp } from './helpers';

export const TestExecutionIdKey = 'baserun_test_execution_id';
export const TestNameKey = 'baserun_test_name';
export const TestStartTimestampKey = 'baserun_test_start_timestamp';
export const TestBufferKey = 'baserun_test_buffer';

export class Baserun {
  static _apiKey: string | undefined = process.env.BASERUN_API_KEY;

  static monkeyPatchOpenAI(): void {
    monkeyPatchOpenAI(Baserun._appendToBuffer);
  }

  static init(): void {
    if (!Baserun._apiKey) {
      throw new Error(
        'Baserun API key is missing. Ensure the BASERUN_API_KEY environment variable is set.',
      );
    }

    if (global.baserunInitialized) {
      console.warn(
        'Baserun has already been initialized. Additional calls to init will be ignored.',
      );
      return;
    }

    global.baserunInitialized = true;
    global.baserunTestExecutions = [];

    Baserun.monkeyPatchOpenAI();
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  static markTestStart(testName: string): Map<string, any> | undefined {
    if (!global.baserunInitialized) {
      return;
    }

    const testStore = new Map();
    testStore.set(TestExecutionIdKey, v4());
    testStore.set(TestNameKey, testName);
    testStore.set(TestStartTimestampKey, getTimestamp());
    testStore.set(TestBufferKey, []);
    return testStore;
  }

  static markTestEnd(
    {
      error,
      result,
    }: {
      error?: Error;
      result?: string | null;
    },
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    testStore?: Map<string, any>,
  ): void {
    if (!global.baserunInitialized) {
      return;
    }

    if (!testStore) {
      return;
    }

    const testExecutionId = testStore.get(TestExecutionIdKey);
    const name = testStore.get(TestNameKey);
    const startTimestamp = testStore.get(TestStartTimestampKey);
    const buffer = testStore.get(TestBufferKey);
    const completionTimestamp = getTimestamp();
    if (error) {
      Baserun._storeTest({
        testName: name,
        testInputs: [],
        id: testExecutionId,
        error: String(error),
        startTimestamp,
        completionTimestamp,
        steps: buffer || [],
      });
    } else {
      Baserun._storeTest({
        testName: name,
        testInputs: [],
        id: testExecutionId,
        result: result ?? '',
        startTimestamp,
        completionTimestamp,
        steps: buffer || [],
      });
    }
  }

  static test(
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    descriptor.value = function (...args: any[]): any {
      if (!global.baserunInitialized) return originalMethod.apply(this, args);

      global.baserunTestStore = Baserun.markTestStart(originalMethod.name);
      try {
        const result = originalMethod.apply(this, args);
        Baserun.markTestEnd({ result }, global.baserunTestStore);
      } catch (e) {
        Baserun.markTestEnd({ error: e as Error }, global.baserunTestStore);
      } finally {
        global.baserunTestStore = undefined;
      }
    };

    return descriptor;
  }

  static log(name: string, payload: object | string): void {
    if (!global.baserunInitialized) return;

    const store = global.baserunTestStore;

    if (!store || !store.has(TestExecutionIdKey)) {
      console.warn(
        'baserun.log was called outside of a Baserun decorated test. The log will be ignored.',
      );
      return;
    }
    const logEntry = {
      stepType: BaserunStepType.Log,
      name,
      payload,
      timestamp: getTimestamp(),
    };

    Baserun._appendToBuffer(logEntry);
  }

  static async flush(): Promise<string | undefined> {
    if (!global.baserunInitialized) {
      console.warn(
        'Baserun has not been initialized. No data will be flushed.',
      );
      return;
    }

    if (global.baserunTestExecutions.length === 0) return;

    const apiUrl = 'https://baserun.ai/api/v1/runs';

    try {
      const response = await axios.post(
        apiUrl,
        { testExecutions: global.baserunTestExecutions },
        {
          headers: {
            Authorization: `Bearer ${Baserun._apiKey}`,
          },
        },
      );

      const testRunId = response.data.id;
      const url = new URL(apiUrl);
      return `${url.protocol}//${url.host}/runs/${testRunId}`;
    } catch (error) {
      console.warn(`Failed to upload results to Baserun: `, error);
    }

    global.baserunTestExecutions = [];
  }

  static _storeTest(testData: Test): void {
    global.baserunTestExecutions.push(testData);
  }

  static _appendToBuffer(logEntry: Log): void {
    const store = global.baserunTestStore;
    if (!store) {
      return;
    }

    const buffer = store.get(TestBufferKey) || [];
    buffer.push(logEntry);
    store.set(TestBufferKey, buffer);
  }
}
