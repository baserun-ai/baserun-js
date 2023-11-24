// process.env.BASERUN_API_KEY = 'test-key';

import {
  SpyInstance,
  expect,
  test,
  vi,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import pick from 'lodash.pick';
import { Log, Run, Span } from '../v1/gen/baserun.js';

describe('Baserun trace', () => {
  let storeTestSpy: SpyInstance<
    [logOrSpan: Log | Span, run: Run, submitRun?: boolean],
    Promise<void>
  >;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    storeTestSpy = vi.spyOn(Baserun, 'submitLogOrSpan');
  });

  afterEach(() => {
    storeTestSpy.mockRestore();
  });

  test('test_explicit_log', async () => {
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
    const expectedRun = pick(run, ['metadata', 'name', 'result']);

    expect(expectedLog).toMatchInlineSnapshot(`
      {
        "name": "TestEvent",
        "payload": "\\"whatever\\"",
      }
    `);
    expect(expectedRun).toMatchInlineSnapshot(`
      {
        "metadata": "{\\"environment\\":\\"test\\",\\"userId\\":123}",
        "name": "entrypoint",
        "result": "\\"AI Hello, world!\\"",
      }
    `);
  });

  test('test_explicit_log_with_payload', async () => {
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
        "payload": "{\\"action\\":\\"called_api\\",\\"value\\":42}",
      }
    `);
  });

  test('handles exception', async () => {
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
        "payload": "\\"whatever\\"",
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
