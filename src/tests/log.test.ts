// process.env.BASERUN_API_KEY = 'test-key';

import { Baserun } from '../baserun';
import { baserun } from '../index';

jest.mock('node-fetch');

describe('Baserun trace', () => {
  let storeTestSpy: jest.SpyInstance;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    storeTestSpy = jest.spyOn(Baserun, 'submitLogOrSpan');
  });

  afterEach(() => {
    storeTestSpy.mockRestore();
  });

  it.only('test_explicit_log', async () => {
    const metadata = { environment: 'test', userId: 123 };
    async function entrypoint(arg1: string) {
      baserun.log('TestEvent', 'whatever');
      return `AI ${arg1}`;
    }

    const tracedEntrypoint = baserun.trace(entrypoint, { metadata });
    await tracedEntrypoint('Hello, world!');

    const calls = storeTestSpy.mock;

    console.log('calls', calls);
  });
});
