import { baserun } from '../../../src/index';

baserun.init();

const main = async () => {
  const metadata = { environment: 'test', userId: 123 };
  async function entrypoint(arg1: string) {
    baserun.log('TestEvent', 'whatever');
    return `AI ${arg1}`;
  }

  const tracedEntrypoint = baserun.trace(entrypoint, { metadata });
  await tracedEntrypoint('Hello, world!');
};

main();
