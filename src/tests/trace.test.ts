process.env.BASERUN_API_KEY = 'test-key';

import { Baserun } from '../baserun';
import { baserun } from '../index';

jest.mock('node-fetch');

describe('Baserun trace', () => {
  let storeTestSpy: jest.SpyInstance;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    storeTestSpy = jest.spyOn(Baserun, '_storeTrace');
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

    const tracedEntrypoint = baserun.trace(entrypoint, metadata);
    await tracedEntrypoint('Hello, world!');

    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe('TestEvent');
    expect(storedData['steps'][0]['payload']).toBe('whatever');
    expect(storedData['metadata']).toEqual(metadata);
    expect(storedData['testInputs']).toEqual([JSON.stringify('Hello, world!')]);
    expect(storedData['result']).toBe(JSON.stringify('AI Hello, world!'));
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

    const tracedEntrypoint = baserun.trace(entrypoint, metadata);
    await tracedEntrypoint('Hello, world!');

    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe(logName);
    expect(storedData['steps'][0]['payload']).toEqual(logPayload);
    expect(storedData['metadata']).toEqual(metadata);
    expect(storedData['testInputs']).toEqual([JSON.stringify('Hello, world!')]);
    expect(storedData['result']).toBe(JSON.stringify('AI Hello, world!'));
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

    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe('TestEvent');
    expect(storedData['steps'][0]['payload']).toBe('whatever');
    expect(storedData['error']).toBe('Error: Failed');
  });
});
