/* Global to all test environments */

// eslint-disable-next-line
declare var baserunInitialized: boolean | undefined;

// eslint-disable-next-line
declare var baserunTraces: any[];

/* Global within a test environment */
// eslint-disable-next-line
declare var baserunTraceStore: Map<string, any> | undefined;

// eslint-disable-next-line
declare var baserunCurrentRun: any | undefined;

// eslint-disable-next-line
declare var baserunTestSuite: any | undefined;

// eslint-disable-next-line
declare var __vitest_worker__: any | undefined;

// eslint-disable-next-line
declare var baserunSubmissionService: any | undefined;

// eslint-disable-next-line
declare var baserunTraceLocalStorage: any | undefined;

// eslint-disable-next-line
declare var baserunSessionLocalStorage: any | undefined;
