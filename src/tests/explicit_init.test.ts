process.env.BASERUN_API_KEY = 'test-key';

import { Baserun } from '../baserun';
import * as baserun from '../index';

jest.mock('axios');

/*
 * npx jest src/tests/explicit_init.test.ts
 */
describe('BaserunExplicitInit', () => {
  let storeTestSpy: jest.SpyInstance;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    storeTestSpy = jest.spyOn(Baserun, '_storeTest');
  });

  afterEach(() => {
    storeTestSpy.mockRestore();
  });

  it('test_explicit_log', () => {
    class Test {
      @baserun.test
      static sample() {
        baserun.log('TestEvent', 'whatever');
      }
    }

    Test.sample();
    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe('TestEvent');
    expect(storedData['steps'][0]['payload']).toBe('whatever');
  });

  it('test_explicit_log_with_payload', () => {
    const logName = 'TestEvent';
    const logPayload = {
      action: 'called_api',
      value: 42,
    };

    class Test {
      @baserun.test
      static sample() {
        baserun.log(logName, logPayload);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe(logName);
    expect(storedData['steps'][0]['payload']).toEqual(logPayload);
  });
});
