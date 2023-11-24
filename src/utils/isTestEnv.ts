export function isTestEnv() {
  if (process.env.BASERUN_TEST === 'false') {
    return false;
  }

  return Boolean(
    process.env.NODE_ENV === 'test' ||
      process.env.VITEST ||
      process.env.JEST_WORKER_ID ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (global.test && global.describe && global.beforeAll),
  );
}
