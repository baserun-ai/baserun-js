import { flush } from '../index';

export default async function teardown(
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  globalConfig: any,
  projectConfig: { testEnvironmentOptions?: { skipFlush: boolean } },
) {
  if (!projectConfig.testEnvironmentOptions?.skipFlush) {
    const url = await flush();
    if (url) {
      const width = process.stdout.columns || 80;
      const line = '\x1b[34m' + '='.repeat(width) + '\x1b[0m';
      console.log(line);
      console.log(`Test results available at: ${url}`);
    }
  }
}
