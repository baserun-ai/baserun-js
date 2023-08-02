import { flush } from '../index';

export default async function teardown(
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  globalConfig: any,
  projectConfig: { testEnvironmentOptions?: { skipFlush: boolean } },
) {
  if (!projectConfig.testEnvironmentOptions?.skipFlush) {
    await flush();
  }
}
