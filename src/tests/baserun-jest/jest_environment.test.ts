import { Baserun } from '../../baserun';
import { baserun } from '../../index';

jest.mock('node-fetch');

describe('BaserunJestEnvironment', () => {
  let appendToBufferSpy: jest.SpyInstance;

  beforeEach(() => {
    appendToBufferSpy = jest.spyOn(Baserun, '_appendToBuffer');
  });

  afterEach(() => {
    appendToBufferSpy.mockRestore();
  });

  it('test_explicit_log', () => {
    baserun.log('TestEvent', 'whatever');

    const bufferData = appendToBufferSpy.mock.calls[0][0];
    expect(bufferData['name']).toBe('TestEvent');
    expect(bufferData['payload']).toBe('whatever');
  });

  it('test_explicit_log_with_payload', () => {
    const logName = 'TestEvent';
    const logPayload = {
      action: 'called_api',
      value: 42,
    };

    baserun.log(logName, logPayload);

    const bufferData = appendToBufferSpy.mock.calls[0][0];
    expect(bufferData['name']).toBe(logName);
    expect(bufferData['payload']).toEqual(logPayload);
  });
});
