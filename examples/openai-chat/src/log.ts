import { baserun } from '../../../src/index';

baserun.init();

const main = async () => {
  const metadata = { environment: 'test', userId: 123 };
  async function entrypoint(arg1: string) {
    const text = `whatever ${(Math.random() * 1000) | 0}`;
    console.log(text);
    baserun.log('TestEvent', text);
    return `AI ${arg1}`;
  }

  const tracedEntrypoint = baserun.trace(entrypoint, { metadata });
  await tracedEntrypoint('Hello, world!');
};

main();
