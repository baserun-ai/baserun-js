process.env.BASERUN_API_KEY = 'test-key';

import { Baserun } from '../baserun';
import { baserun } from '../index';

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
    storeTestSpy = jest.spyOn(Baserun, '_storeTrace');
  });

  afterEach(() => {
    storeTestSpy.mockRestore();
  });

  it('test_explicit_log', () => {
    class Test {
      @Baserun.test
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
      @Baserun.test
      static sample() {
        baserun.log(logName, logPayload);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    expect(storedData['steps'][0]['name']).toBe(logName);
    expect(storedData['steps'][0]['payload']).toEqual(logPayload);
  });

  it('test_eval_equals', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.equals(
          'Hello world equals',
          'Hello World',
          'Hello World',
        );
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world equals');
    expect(evalData['type']).toBe('equals');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
    expect(evalData['payload']['expected']).toBe('Hello World');
  });

  it('test_eval_match', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.match('Hello world match', 'Hello World', [
          'Hello',
          'Hey',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world match');
    expect(evalData['type']).toBe('match');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
    expect(evalData['payload']['expected']).toEqual(['Hello', 'Hey']);
  });

  it('test_eval_includes', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.includes('Hello world includes', 'Hello World', [
          'lo W',
          'Goodbye',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world includes');
    expect(evalData['type']).toBe('includes');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
    expect(evalData['payload']['expected']).toEqual(['lo W', 'Goodbye']);
  });

  it('test_eval_fuzzy_match', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.fuzzyMatch('Hello world fuzzy', 'World', [
          'Hello World',
          'Goodbye',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world fuzzy');
    expect(evalData['type']).toBe('fuzzy_match');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('World');
    expect(evalData['payload']['expected']).toEqual(['Hello World', 'Goodbye']);
  });

  it('test_eval_not_match', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.notMatch('Hello world not match', 'Hello World', [
          'Hey',
          'Hi',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world not match');
    expect(evalData['type']).toBe('not_match');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
    expect(evalData['payload']['expected']).toEqual(['Hey', 'Hi']);
  });

  it('test_eval_not_includes', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.notIncludes('Hello world not includes', 'Hello World', [
          'Bonjour',
          'Goodbye',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world not includes');
    expect(evalData['type']).toBe('not_includes');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
    expect(evalData['payload']['expected']).toEqual(['Bonjour', 'Goodbye']);
  });

  it('test_eval_not_fuzzy_match', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.notFuzzyMatch('Hello world not fuzzy', 'World', [
          'Hi Monde',
          'Bonjour',
        ]);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world not fuzzy');
    expect(evalData['type']).toBe('not_fuzzy_match');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('World');
    expect(evalData['payload']['expected']).toEqual(['Hi Monde', 'Bonjour']);
  });

  it('test_eval_valid_json', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.validJson('Hello world valid json', '{"hello": "world"}');
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world valid json');
    expect(evalData['type']).toBe('valid_json');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('{"hello": "world"}');
  });

  it('test_eval_valid_json_fail', () => {
    class Test {
      @Baserun.test
      static sample() {
        baserun.evals.validJson('Hello world valid json', '{"hello": "world');
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('Hello world valid json');
    expect(evalData['type']).toBe('valid_json');
    expect(evalData['eval']).toBe('False');
    expect(evalData['payload']['output']).toBe('{"hello": "world');
  });

  it('test_eval_custom', () => {
    class Test {
      @Baserun.test
      static sample() {
        function customEval(x: string) {
          return x.length > 5;
        }
        baserun.evals.custom('custom_length_check', 'Hello World', customEval);
      }
    }

    Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('custom_length_check');
    expect(evalData['type']).toBe('custom');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
  });

  it('test_eval_custom_async', async () => {
    class Test {
      @Baserun.test
      static async sample() {
        const customEval = async (x: string) => {
          return x.length > 5;
        };

        await baserun.evals.customAsync(
          'custom_length_check_async',
          'Hello World',
          customEval,
        );
      }
    }

    await Test.sample();

    const storedData = storeTestSpy.mock.calls[0][0];
    const evalData = storedData['evals'][0];

    expect(evalData['name']).toBe('custom_length_check_async');
    expect(evalData['type']).toBe('custom_async');
    expect(evalData['eval']).toBe('True');
    expect(evalData['payload']['output']).toBe('Hello World');
  });
});
