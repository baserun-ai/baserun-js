// import { Baserun } from '../baserun.js';

export default async function teardown(
  globalConfig: any,
  projectConfig: { testEnvironmentOptions?: { skipFlush: boolean } },
) {
  if (!projectConfig.testEnvironmentOptions?.skipFlush) {
    // const url = await Baserun.flush();
    // if (url) {
    //   const width = process.stdout.columns || 80;
    //   const word = ' Baserun summary ';
    //   const before = Math.floor((width - word.length) / 2);
    //   const after = width - word.length - before;
    //   console.log(
    //     '\x1b[34m' + '='.repeat(before) + word + '='.repeat(after) + '\x1b[0m',
    //   );
    //   console.log(`Test results available at: ${url}`);
    //   console.log('\x1b[34m' + '='.repeat(width) + '\x1b[0m');
    // }
  }
}
