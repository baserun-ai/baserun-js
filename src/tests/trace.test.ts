// process.env.BASERUN_API_KEY = 'test-key';

import { Baserun } from '../../dist/commonjs/baserun.js';
import { baserun } from '../../dist/commonjs/index.js';
import pick from 'lodash.pick';

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

  it('test_explicit_log', async () => {
    const metadata = { environment: 'test', userId: 123 };
    async function entrypoint(arg1: string) {
      baserun.log('TestEvent', 'whatever');
      return `AI ${arg1}`;
    }

    const tracedEntrypoint = baserun.trace(entrypoint, { metadata });
    await tracedEntrypoint('Hello, world!');

    const storedData = storeTestSpy.mock.calls;

    const [log, run] = storedData[0];

    const expectedLog = pick(log, ['name', 'payload']);
    const expectedRun = pick(run, ['metadata', 'runType', 'name', 'result']);

    expect(expectedLog).toMatchInlineSnapshot(`
      {
        "name": "TestEvent",
        "payload": ""whatever"",
      }
    `);
    expect(expectedRun).toMatchInlineSnapshot(`
      {
        "metadata": "{"environment":"test","userId":123}",
        "name": "entrypoint",
        "result": ""AI Hello, world!"",
        "runType": 1,
      }
    `);
  });

  it('test_explicit_log_with_payload', async () => {
    const metadata = { environment: 'test', userId: 123 };
    const logName = 'TestEvent';
    const logPayload = {
      action: 'called_api',
      value: 42,
    };

    async function entrypoint(arg1: string) {
      baserun.log(logName, logPayload);
      return `AI ${arg1}`;
    }

    const tracedEntrypoint = baserun.trace(entrypoint, { metadata });
    await tracedEntrypoint('Hello, world!');

    const run = storeTestSpy.mock.calls[0][0];
    const expectedRun = pick(run, ['name', 'payload']);

    expect(expectedRun).toMatchInlineSnapshot(`
      {
        "name": "TestEvent",
        "payload": "{"action":"called_api","value":42}",
      }
    `);
  });

  it('handles exception', async () => {
    async function entrypoint() {
      baserun.log('TestEvent', 'whatever');
      throw new Error('Failed');
    }

    try {
      const tracedEntrypoint = baserun.trace(entrypoint);
      await tracedEntrypoint();
    } catch {
      // Do nothing
    }

    const run = storeTestSpy.mock.calls[0][0];
    const trace = storeTestSpy.mock.calls[0][1];

    const expectedRun = pick(run, ['name', 'payload']);
    const expectedTrace = pick(trace, ['name', 'metadata', 'result']);

    expect(expectedRun).toMatchInlineSnapshot(`
      {
        "name": "TestEvent",
        "payload": ""whatever"",
      }
    `);
    expect(expectedTrace).toMatchInlineSnapshot(`
      {
        "metadata": "{}",
        "name": "entrypoint",
        "result": "",
      }
    `);
  });
});
