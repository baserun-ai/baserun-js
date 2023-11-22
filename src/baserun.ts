import { v4 } from 'uuid';
import stringify from 'json-stringify-safe';
import { AutoLLMLog } from './types.js';
import { Evals } from './evals/evals.js';
import { Eval } from './evals/types.js';
import { OpenAIWrapper } from './patches/vendors/openai.js';
import { AnthropicWrapper } from './patches/vendors/anthropic.js';
import {
  EndRunRequest,
  Run,
  StartRunRequest,
  Log as ProtoLog,
  SubmitLogRequest,
  SubmitSpanRequest,
  Span,
  Run_RunType,
  Session,
  StartSessionRequest,
  EndUser,
  SubmitUserRequest,
  StartTestSuiteRequest,
  TestSuite,
} from './v1/gen/baserun.js';
import { getOrCreateSubmissionService } from './backend/submissionService.js';
import { logToSpanOrLog } from './utils/logToSpan.js';
import { Timestamp } from './v1/gen/google/protobuf/timestamp.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { isTestEnv } from './utils/isTestEnv.js';
import { sep } from 'node:path';
import getDebug from 'debug';

const debug = getDebug('baserun:baserun');

type TraceStorage = {
  run: Run;
  args: any[];
  evals: Eval<any>[];
};

type SessionStorage = {
  session: Session;
  userIdentifier?: string;
};

const traceLocalStorage = new AsyncLocalStorage<TraceStorage>();
const sessionLocalStorage = new AsyncLocalStorage<SessionStorage>();

export type TraceOptions = {
  metadata?: any;
  name?: string;
};

export type SessionOptions<T extends (...args: any[]) => any> = {
  user: string;
  sessionId?: string;
  session: T;
};

process.on('exit', () => {
  if (!global.baserunInitialized) {
    return;
  }
  // warn if there's an unflushed session or test suite
  if (Baserun.sessionQueue.length > 0) {
    console.warn(
      'Baserun: Exiting with unflushed sessions. This should never happen - please report it at https://github.com/baserun-ai/baserun-js',
    );
  }

  if (Baserun.startTestSuitePromise) {
    console.warn(
      'Baserun: Exiting with unflushed test suite. Ensure you call baserun.flushTestSuite() before exiting.',
    );
  }
});

export class Baserun {
  static evals = new Evals(Baserun._appendToEvals);
  private static _apiKey: string | undefined = process.env.BASERUN_API_KEY;

  static monkeyPatch(): void {
    OpenAIWrapper.init(Baserun._handleAutoLLM);
    AnthropicWrapper.init(Baserun._handleAutoLLM);
  }

  static runQueue: Run[] = [];
  static sessionQueue: Session[] = [];
  static sessionPromises: Promise<unknown>[] = [];

  static startTestSuitePromise: Promise<unknown> | undefined;
  static endTestSuitePromise: Promise<void> | undefined;

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

    const isTest = isTestEnv();

    if (isTest) {
      Baserun.initTestSuite();
    }

    Baserun.monkeyPatch();
  }

  static getTestSuite(): TestSuite | undefined {
    return global.baserunTestSuite;
  }

  static getTestSuiteName(): string {
    if (global.__vitest_worker__ && global.__vitest_worker__.filepath) {
      const lastTwo = global.__vitest_worker__.filepath
        .split(sep)
        .slice(-2)
        .join(sep);
      return `vitest ${lastTwo}`;
    }

    return 'baserun test';
  }

  static initTestSuite(): void {
    const testSuite: TestSuite = {
      id: v4(),
      name: Baserun.getTestSuiteName(),
      startTimestamp: Timestamp.fromDate(new Date()),
    };

    global.baserunTestSuite = testSuite;

    const startTestSuiteRequest: StartTestSuiteRequest = {
      testSuite,
    };

    Baserun.startTestSuitePromise = new Promise((resolve, reject) => {
      getOrCreateSubmissionService().startTestSuite(
        startTestSuiteRequest,
        (error) => {
          if (error) {
            console.error(
              'Failed to submit test suite start to Baserun: ',
              error,
            );
            reject(error);
          } else {
            resolve(undefined);
          }
        },
      );
    });

    return global.baserunTestSuite;
  }

  static flushTestSuite(): Promise<void> {
    if (!Baserun.startTestSuitePromise) {
      throw new Error('Test suite was not initialized');
    }

    if (!global.baserunTestSuite) {
      throw new Error('Test suite was not initialized');
    }

    if (Baserun.endTestSuitePromise) {
      console.warn('Baserun: Test suite flushing already in progress');
      return Baserun.endTestSuitePromise;
    }

    Baserun.endTestSuitePromise = new Promise<void>((resolve, reject) => {
      Baserun.startTestSuitePromise?.then(() => {
        global.baserunTestSuite.completionTimestamp = Timestamp.fromDate(
          new Date(),
        );

        getOrCreateSubmissionService().endTestSuite(
          { testSuite: global.baserunTestSuite },
          (error) => {
            if (error) {
              console.error(
                'Failed to submit test suite end to Baserun: ',
                error,
              );
              reject(error);
            } else {
              resolve(undefined);
            }
          },
        );
      });
    });

    return Baserun.endTestSuitePromise;
  }

  static trace<T extends (...args: any[]) => any>(
    fn: T,
    traceOptions?: TraceOptions,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    const metadata = traceOptions?.metadata;
    const name = traceOptions?.name ?? fn.name;

    const store = traceLocalStorage.getStore();

    if (store?.run) {
      console.info(
        'baserun.trace was called inside of an existing Baserun decorated trace. The new trace will be ignored.',
      );
      return fn;
    }

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const run = await Baserun.getOrCreateCurrentRun({
        name,
        traceType: isTestEnv() ? Run_RunType.TEST : Run_RunType.PRODUCTION,
        metadata,
      });

      debug('starting run', run);

      return traceLocalStorage.run({ run, args, evals: [] }, async () => {
        try {
          const result = await fn(...args);
          run.result = JSON.stringify(result);
          return result;
        } catch (err) {
          run.error = String((err as Error).stack ?? err);
          throw err;
        } finally {
          /* Already silently catches all errors and warns */
          await Baserun.flush();
        }
      });
    };
  }

  static session<T extends (...args: any[]) => any>({
    session: fn,
    sessionId,
    user,
  }: SessionOptions<T>): Promise<ReturnType<T>> {
    if (!global.baserunInitialized) return fn();

    const traceStore = traceLocalStorage.getStore();

    if (traceStore?.run) {
      console.warn(
        'baserun.session was called inside of an existing Baserun decorated trace. The session will be ignored.',
      );
      return fn();
    }

    const sessionStore = sessionLocalStorage.getStore();
    if (sessionStore?.session) {
      console.warn(
        `baserun.session can't be nested. Session with id ${sessionStore.session.id} is already active`,
      );
      return fn();
    }

    const endUser: EndUser = {
      id: user ?? '',
      identifier: user ?? '',
    };

    const actualSessionId = sessionId ?? v4();

    const session: Session = {
      id: actualSessionId,
      identifier: actualSessionId,
      endUser,
      startTimestamp: Timestamp.fromDate(new Date()),
    };

    Baserun.sessionQueue.push(session);

    const startEndUserRequest: SubmitUserRequest = { user: endUser };

    const submissionService = getOrCreateSubmissionService();

    const userPromise = new Promise((resolve, reject) => {
      submissionService.submitUser(startEndUserRequest, (error) => {
        if (error) {
          console.error('Failed to submit user to Baserun: ', error);
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });

    const startSessionRequest: StartSessionRequest = { session };

    debug('starting session', session);
    const sessionPromise = new Promise((resolve, reject) => {
      userPromise.then(() => {
        submissionService.startSession(startSessionRequest, (error) => {
          if (error) {
            console.error('Failed to submit session start to Baserun: ', error);
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      });
    });

    Baserun.sessionPromises.push(sessionPromise);

    return sessionLocalStorage.run({ session }, async () => {
      try {
        const result = await fn();
        return result;
      } finally {
        /* Already silently catches all errors and warns */
        await Baserun.flush();
      }
    });
  }

  static getCurrentRun(): Run | undefined {
    const storage = traceLocalStorage.getStore();
    if (storage) {
      return storage.run;
    }
  }

  static getOrCreateCurrentRun({
    name,
    startTimestamp,
    completionTimestamp,
    traceType,
    metadata,
  }: {
    name: string;
    startTimestamp?: Date;
    completionTimestamp?: Date;
    traceType?: Run_RunType;
    metadata?: object;
  }): Promise<Run> {
    const currentRun = Baserun.getCurrentRun();
    if (currentRun) {
      return Promise.resolve(currentRun);
    }

    const runId = v4();
    if (!traceType) {
      traceType = isTestEnv() ? Run_RunType.TEST : Run_RunType.PRODUCTION;
    }

    const sessionId = sessionLocalStorage.getStore()?.session.id;

    const run: Run = {
      runId,
      runType: traceType,
      name,
      metadata: stringify(metadata ?? {}),
      suiteId: Baserun.getTestSuite()?.id ?? '',
      sessionId: sessionId ?? '',
      inputs: [],
      error: '',
      result: '',
      startTimestamp: Timestamp.fromDate(new Date()),
      completionTimestamp: Timestamp.fromDate(new Date()),
    };

    Baserun.runQueue.push(run);

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

    if (!run.sessionId) {
      run.sessionId = sessionLocalStorage.getStore()?.session.id ?? '';
    }

    debug('finishing run', run);
    getOrCreateSubmissionService().endRun(endRunRequest, (error) => {
      if (error) {
        console.error('Failed to submit run end to Baserun: ', error);
      }
    });
  }

  static log(name: string, payload: object | string): void {
    if (!global.baserunInitialized) return;

    const run = Baserun.getCurrentRun();
    if (!run) {
      console.warn(
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

    // finish all outstanding runs
    let run = Baserun.runQueue.shift();
    while (run) {
      await Baserun.finishRun(run);
      run = Baserun.runQueue.shift();
    }

    // finish all outstanding session initializations
    let sessionPromise = Baserun.sessionPromises.shift();
    while (sessionPromise) {
      await sessionPromise;
      sessionPromise = Baserun.sessionPromises.shift();
    }

    // finish all outstanding sessions
    let session = Baserun.sessionQueue.shift();
    while (session) {
      await Baserun.finishSession(session);
      session = Baserun.sessionQueue.shift();
    }

    return;
  }

  static async finishSession(session: Session): Promise<void> {
    session.completionTimestamp = Timestamp.fromDate(new Date());
    const endSessionRequest = { session };

    debug('finishing session', session);
    await new Promise((resolve, reject) => {
      getOrCreateSubmissionService().endSession(endSessionRequest, (error) => {
        if (error) {
          console.error('Failed to submit session end to Baserun: ', error);
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  static submitLogOrSpan(logOrSpan: ProtoLog | Span, run: Run): Promise<void> {
    const endUser = sessionLocalStorage.getStore()?.session?.endUser;

    return new Promise((resolve, reject) => {
      // handle Log
      if (isSpan(logOrSpan)) {
        const spanRequest: SubmitSpanRequest = {
          run,
          span: logOrSpan,
        };
        logOrSpan.endUser = endUser;
        debug('submitting span', logOrSpan);
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
        debug('submitting log', logOrSpan);
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

  // todo
  static _appendToEvals(evalEntry: Eval<any>): void {
    const store = traceLocalStorage.getStore();
    if (store) {
      store.evals.push(evalEntry);
    } else {
      throw new Error('Evals can only happens within a trace');
    }
  }
}

function isSpan(log: ProtoLog | Span): log is Span {
  return Object.prototype.hasOwnProperty.call(log, 'spanId');
}
