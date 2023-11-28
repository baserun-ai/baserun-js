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
  SubmitEvalRequest,
} from './v1/gen/baserun.js';
import { getOrCreateSubmissionService } from './backend/submissionService.js';
import { logToSpanOrLog } from './utils/logToSpan.js';
import { Timestamp } from './v1/gen/google/protobuf/timestamp.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { isTestEnv } from './utils/isTestEnv.js';
import { sep } from 'node:path';
import getDebug from 'debug';
import { SubmissionServiceClient } from './v1/gen/baserun.grpc-client.js';
import { track } from './utils/track.js';
import pRetry from 'promise-retry';

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

global.baserunTraceLocalStorage =
  global.baserunTraceLocalStorage || new AsyncLocalStorage<TraceStorage>();

global.baserunSessionLocalStorage =
  global.baserunSessionLocalStorage || new AsyncLocalStorage<SessionStorage>();

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

type InitOptions = {
  apiKey?: string;
};

export class Baserun {
  static evals = new Evals(Baserun._appendToEvals);
  private static _apiKey: string | undefined = process.env.BASERUN_API_KEY;

  static monkeyPatch(): Promise<[void, void]> {
    return Promise.all([
      OpenAIWrapper.init(Baserun._handleAutoLLM),
      AnthropicWrapper.init(Baserun._handleAutoLLM),
    ]);
  }

  static forceTestEnv: boolean = false;
  static runQueue: Run[] = [];
  static sessionQueue: Session[] = [];
  static runCreationPromises: Record<string, Promise<Run>> = {};

  static sessionPromises: Promise<unknown>[] = [];

  static startTestSuitePromise: Promise<unknown> | undefined;
  static endTestSuitePromise: Promise<void> | undefined;

  static submitEvalPromises: Promise<void>[] = [];

  static get submissionService(): SubmissionServiceClient {
    return global.baserunSubmissionService;
  }

  static get testSuite(): TestSuite | undefined {
    return global.baserunTestSuite;
  }

  static get traceLocalStorage(): AsyncLocalStorage<TraceStorage> {
    return global.baserunTraceLocalStorage;
  }

  static get sessionLocalStorage(): AsyncLocalStorage<SessionStorage> {
    return global.baserunSessionLocalStorage;
  }

  static async init({ apiKey }: InitOptions = {}): Promise<void> {
    debug('initializing Baserun');

    // we're using global as this is the only way to share state
    // when using jest
    if (global.baserunInitialized) {
      debug('already intialized');
      return;
    }

    Baserun._apiKey = apiKey ?? process.env.BASERUN_API_KEY;

    if (!Baserun._apiKey) {
      throw new Error(
        'Baserun API key is missing. Ensure the BASERUN_API_KEY environment variable is set.',
      );
    }

    global.baserunSubmissionService = getOrCreateSubmissionService({
      apiKey: Baserun._apiKey!,
    });

    await track(async () => {
      const isTest = Baserun.forceTestEnv || isTestEnv();

      if (isTest) {
        Baserun.initTestSuite();
      }

      debug('starting monkey patching');
      await Baserun.monkeyPatch();
    }, 'Baserun.init.monkeyPatch');

    debug('done initializing');

    global.baserunInitialized = true;
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
      Baserun.submissionService.startTestSuite(
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

        Baserun.submissionService.endTestSuite(
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

  private static ensureInitialized(): boolean {
    if (!global.baserunInitialized) {
      console.warn(
        'warning: Baserun was not initialized. Ensure you call baserun.init() before using it.',
      );
      return false;
    }

    return true;
  }

  static trace<T extends (...args: any[]) => any>(
    fn: T,
    traceOptions?: TraceOptions | string,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    if (typeof traceOptions === 'string') {
      traceOptions = { name: traceOptions };
    }
    const metadata = traceOptions?.metadata;
    const name = traceOptions?.name ?? (fn.name || 'baserun trace');

    const store = Baserun.traceLocalStorage.getStore();

    if (store?.run) {
      console.warn(
        'baserun.trace was called inside of an existing Baserun decorated trace. The new trace will be ignored.',
      );
      return fn;
    }

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const run = Baserun.getOrCreateCurrentRun({
        name,
        traceType: isTestEnv() ? Run_RunType.TEST : Run_RunType.PRODUCTION,
        metadata,
      });

      debug('starting run', run);

      return Baserun.traceLocalStorage.run(
        { run, args, evals: [] },
        async () => {
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
        },
      );
    };
  }

  static async session<T extends (...args: any[]) => any>({
    session: fn,
    sessionId,
    user,
  }: SessionOptions<T>): Promise<{ sessionId?: string; data: ReturnType<T> }> {
    if (!Baserun.ensureInitialized()) {
      return { data: await fn() };
    }

    const traceStore = Baserun.traceLocalStorage.getStore();

    if (traceStore?.run) {
      console.warn(
        'baserun.session was called inside of an existing Baserun decorated trace. The session will be ignored.',
      );
      return { data: await fn() };
    }

    const sessionStore = Baserun.sessionLocalStorage.getStore();
    if (sessionStore?.session) {
      console.warn(
        `baserun.session can't be nested. Session with id ${sessionStore.session.id} is already active`,
      );
      return { data: await fn() };
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

    const userPromise = new Promise((resolve, reject) => {
      Baserun.submissionService.submitUser(startEndUserRequest, (error) => {
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
        Baserun.submissionService.startSession(startSessionRequest, (error) => {
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

    return Baserun.sessionLocalStorage.run({ session }, async () => {
      try {
        const data = await fn();
        return { sessionId: actualSessionId, data };
      } finally {
        /* Already silently catches all errors and warns */
        await Baserun.flush();
      }
    });
  }

  static getCurrentRun(): Run | undefined {
    const storage = Baserun.traceLocalStorage.getStore();
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
  }): Run {
    if (!global.baserunInitialized) {
      throw new Error(
        'Baserun has not been initialized. Ensure you call baserun.init() before using it.',
      );
    }

    const currentRun = Baserun.getCurrentRun();
    if (currentRun) {
      return currentRun;
    }

    const runId = v4();
    if (!traceType) {
      traceType = isTestEnv() ? Run_RunType.TEST : Run_RunType.PRODUCTION;
    }

    const sessionId = Baserun.sessionLocalStorage.getStore()?.session.id;

    const run: Run = {
      runId,
      runType: traceType,
      name,
      metadata: stringify(metadata ?? {}),
      suiteId: Baserun.testSuite?.id ?? '',
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

    Baserun.runCreationPromises[run.runId] = new Promise<Run>(
      (resolve, reject) => {
        const before = Date.now();
        Baserun.submissionService.startRun(startRunRequest, (error) => {
          debug(`submitted run start in ${Date.now() - before}ms`, run.name);
          delete Baserun.runCreationPromises[run.runId];
          if (error) {
            console.error('Failed to submit run start to Baserun: ', error);
            reject(error);
          } else {
            resolve(run);
          }
        });
      },
    );

    return run;
  }

  static async finishRun(run: Run): Promise<void> {
    const runCreationPromise = Baserun.runCreationPromises[run.runId];

    if (runCreationPromise) {
      await runCreationPromise;
    }

    run.completionTimestamp = Timestamp.fromDate(new Date());
    const endRunRequest: EndRunRequest = { run };

    if (!run.sessionId) {
      run.sessionId = Baserun.sessionLocalStorage.getStore()?.session.id ?? '';
    }

    debug('finishing run', run);
    return new Promise((resolve, reject) => {
      Baserun.submissionService.endRun(endRunRequest, (error) => {
        if (error) {
          console.error('Failed to submit run end to Baserun: ', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  static log(name: string, payload: object | string): void {
    if (!Baserun.ensureInitialized()) {
      return;
    }

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

    Baserun.submitLogOrSpan(log, run, false);
  }

  static async flush(): Promise<void> {
    // todo: flush these all in parallel
    debug('flushing');
    await track(async () => {
      if (!global.baserunInitialized) {
        console.warn(
          'Baserun has not been initialized. No data will be flushed.',
        );
        return;
      }

      const promises: Promise<void | unknown>[] = [];

      // finish all outstanding runs
      let run = Baserun.runQueue.shift();
      while (run) {
        promises.push(Baserun.finishRun(run));
        run = Baserun.runQueue.shift();
      }

      // finish all outstanding session initializations
      let sessionPromise = Baserun.sessionPromises.shift();
      while (sessionPromise) {
        promises.push(sessionPromise);
        sessionPromise = Baserun.sessionPromises.shift();
      }

      // finish all outstanding sessions
      let session = Baserun.sessionQueue.shift();
      while (session) {
        promises.push(Baserun.finishSession(session));
        session = Baserun.sessionQueue.shift();
      }

      // for sure I'd be able to write this in a better way
      let evalPromise = Baserun.submitEvalPromises.shift();
      while (evalPromise) {
        promises.push(evalPromise);
        evalPromise = Baserun.submitEvalPromises.shift();
      }

      await Promise.all(promises);
    }, 'Baserun.flush');
  }

  static async finishSession(session: Session): Promise<void> {
    session.completionTimestamp = Timestamp.fromDate(new Date());
    const endSessionRequest = { session };

    debug('finishing session', session);
    await new Promise((resolve, reject) => {
      Baserun.submissionService.endSession(endSessionRequest, (error) => {
        if (error) {
          console.error('Failed to submit session end to Baserun: ', error);
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  static async submitLogOrSpan(
    logOrSpan: ProtoLog | Span,
    run: Run,
    submitRun?: boolean,
  ): Promise<void> {
    return track(async () => {
      const endUser = Baserun.sessionLocalStorage.getStore()?.session?.endUser;

      const runCreationPromise = Baserun.runCreationPromises[run.runId];
      if (runCreationPromise) {
        await runCreationPromise;
      }

      const promises: Promise<void | unknown>[] = [];

      const spanPromise = pRetry(
        () =>
          new Promise((resolve, reject) => {
            // handle Log
            const before = Date.now();
            if (isSpan(logOrSpan)) {
              const spanRequest: SubmitSpanRequest = {
                run,
                span: logOrSpan,
              };
              logOrSpan.endUser = endUser;
              Baserun.submissionService.submitSpan(spanRequest, (error) => {
                if (error) {
                  reject(error);
                } else {
                  debug(
                    `submitted span in ${Date.now() - before}ms`,
                    logOrSpan.name,
                  );
                  resolve(undefined);
                }
              });
              // otherwise it must be a Span
            } else {
              const logRequest: SubmitLogRequest = {
                log: logOrSpan,
                run,
              };
              Baserun.submissionService.submitLog(logRequest, (error) => {
                if (error) {
                  reject(error);
                } else {
                  debug(
                    `submitted log in ${Date.now() - before}ms`,
                    logOrSpan.name,
                  );
                  resolve(undefined);
                }
              });
            }
          }),
        {
          retries: 4,
        },
      ).catch((e) => {
        console.error('Failed to submit log or span to Baserun: ', e);
      });

      promises.push(spanPromise);

      if (submitRun) {
        promises.push(Baserun.finishRun(run));
      }

      await Promise.all(promises);

      return undefined;
    }, `Baserun.submitLogOrSpan ${logOrSpan.name}`);
  }

  static async _handleAutoLLM(logEntry: AutoLLMLog): Promise<void> {
    return track(async () => {
      // is there a run already? if not we're creating one here
      const autoCreatedRun = !Baserun.getCurrentRun();

      const run = Baserun.getOrCreateCurrentRun({
        name: `${logEntry.provider} ${logEntry.type}`,
        startTimestamp: new Date(logEntry.startTimestamp),
        completionTimestamp: new Date(logEntry.completionTimestamp),
      });

      const span = logToSpanOrLog(logEntry, run.runId);

      return Baserun.submitLogOrSpan(span, run, autoCreatedRun);
    }, 'Baserun._handleAutoLLM');
  }

  static _appendToEvals(evalEntry: Eval<any>): void {
    if (!Baserun.ensureInitialized()) {
      return;
    }

    const store = Baserun.traceLocalStorage.getStore();

    if (!store) {
      console.warn('Warning: Evals can only happen within a trace');
      return;
    }

    const submitEvalRequest: SubmitEvalRequest = {
      eval: {
        name: evalEntry.name,
        payload: stringify(evalEntry.payload),
        result: '{}',
        score: evalEntry.score,
        submission: '{}',
        type: evalEntry.type,
      },
      run: store.run,
    };

    Baserun.submitEvalPromises.push(
      // eslint-disable-next-line no-async-promise-executor
      new Promise(async (resolve, reject) => {
        await Baserun.runCreationPromises[store.run.runId];
        Baserun.submissionService.submitEval(submitEvalRequest, (error) => {
          if (error) {
            debug('Failed to submit eval to Baserun: ', error);
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      }),
    );

    store.evals.push(evalEntry);
  }
}

function isSpan(log: ProtoLog | Span): log is Span {
  return Object.prototype.hasOwnProperty.call(log, 'spanId');
}
