// process.env.BASERUN_API_KEY = 'test-key';

import {
  test,
  vi,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  expect,
} from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import pick from 'lodash.pick';
import { Eval } from '../v1/gen/baserun.js';
import { EvalPayload, EvalType } from '../evals/types.js';
import { LLMChatLog } from '../types.js';

describe('evals', () => {
  let storeTestSpy: any;

  beforeAll(async () => {
    await baserun.init();
  });

  beforeEach(() => {
    storeTestSpy = vi.spyOn(Baserun.submissionService, 'submitEval');
  });

  afterEach(() => {
    storeTestSpy.mockRestore();
  });

  test('match', async () => {
    await baserun.trace(async () => {
      baserun.evals.match('match', 'lol', 'lol');
    }, 'match run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"lol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot(`"match run"`);
  });

  test('eq', async () => {
    await baserun.trace(async () => {
      baserun.evals.eq('eq', 'lol', 'lol');
    }, 'eq')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"lol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"eq"');
  });

  test('equals', async () => {
    await baserun.trace(async () => {
      baserun.evals.equals('equals', 'lol', 'lol');
    }, 'equals run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"lol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"equals run"');
  });

  test('includes', async () => {
    await baserun.trace(async () => {
      baserun.evals.includes('includes', 'lol', ['lol', 'mol']);
    }, 'match')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"lol\\",\\"mol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"match"');
  });

  test('fuzzyMatch', async () => {
    await baserun.trace(async () => {
      baserun.evals.fuzzyMatch('fuzzyMatch', 'mol', ['lol', 'mol']);
    }, 'fuzzyMatch run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"mol\\",\\"expected\\":[\\"lol\\",\\"mol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"fuzzyMatch run"');
  });

  test('notMatch', async () => {
    await baserun.trace(async () => {
      baserun.evals.notMatch('notMatch', 'lol', ['ol', 'ol']);
    }, 'notMatch run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"ol\\",\\"ol\\"]}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"notMatch run"');
  });

  test('notIncludes', async () => {
    await baserun.trace(async () => {
      baserun.evals.notIncludes('notIncludes', 'lol', ['rol', 'mol']);
    }, 'notIncludes run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"rol\\",\\"mol\\"]}"',
    );

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].run.name).toMatchInlineSnapshot(
      '"notIncludes run"',
    );
  });

  test('notFuzzyMatch', async () => {
    await baserun.trace(async () => {
      baserun.evals.notFuzzyMatch('notFuzzyMatch', 'lol', ['rol', 'mol']);
    }, 'notFuzzyMatch run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"lol\\",\\"expected\\":[\\"rol\\",\\"mol\\"]}"',
    );

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].run.name).toMatchInlineSnapshot(
      '"notFuzzyMatch run"',
    );
  });

  test('validJson', async () => {
    await baserun.trace(async () => {
      baserun.evals.validJson('validJson', '{}');
    }, 'validJson run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"{}\\"}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"validJson run"');
  });

  test('custom', async () => {
    await baserun.trace(async () => {
      baserun.evals.custom('custom', '{}', (v) => (v ? 5 : 6));
    }, 'custom run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"{}\\"}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot('"custom run"');
  });

  test('customAsync', async () => {
    await baserun.trace(async () => {
      baserun.evals.customAsync('customAsync', '{}', async (v) => (v ? 5 : 6));
    }, 'customAsync run')();

    const storedData = storeTestSpy.mock.calls;

    // eslint-disable-next-line prettier/prettier
    expect(storedData[0][0].eval.payload).toMatchInlineSnapshot(
      '"{\\"submission\\":\\"{}\\"}"',
    );

    expect(storedData[0][0].run.name).toMatchInlineSnapshot(
      '"customAsync run"',
    );
  });

  test('modelGradedCustom', async () => {
    const statement = 'ChatGPT will take over the world';
    const evalName = 'modelGradedCustom Test';
    const prompt = `How true is this statement? ${statement}.`;
    const expectedResult = 'Not true'; // : -)
    const score = await baserun.trace(async () => {
      return await baserun.evals.modelGradedCustom(
        evalName,
        prompt,
        { 'Very True': 1, 'Kinda true': 0.5, 'Not true': 0 },
        undefined,
        { aaa: 'bbb', ccc: 6 },
      );
    }, 'modelGradedCustom run')();

    expect(score).toEqual(expectedResult);

    const storedData = storeTestSpy.mock.calls;

    const eval_: Eval = storedData[0][0].eval;
    expect(eval_.name).toEqual(evalName);
    expect(eval_.score).toEqual(0);
    expect(eval_.result).toEqual(expectedResult);
    expect(eval_.type).toEqual(EvalType.ModelGradedCustom);
    const payload: EvalPayload<EvalType.ModelGradedCustom> = JSON.parse(
      eval_.payload,
    );
    expect(payload.aaa).toEqual('bbb');
    expect(payload.ccc).toEqual(6);
    expect(
      (payload.step as LLMChatLog).promptMessages[0].content.includes(prompt),
    ).toEqual(true);
  });

  test('modelGradedFact', async () => {
    const score = await baserun.trace(async () => {
      return await baserun.evals.modelGradedFact(
        'modelGradedFact',
        'Who is the president of the United States?',
        'Donald Trump',
        'Bob the Builder',
      );
    }, 'modelGradedFact run')();

    const storedData = storeTestSpy.mock.calls;

    const payload = JSON.parse(storedData[0][0].eval.payload);
    const pickedPayload = pick(payload, ['question', 'expert']);

    // eslint-disable-next-line prettier/prettier
    expect(pickedPayload).toMatchInlineSnapshot(`
        {
          "expert": "Donald Trump",
          "question": "Who is the president of the United States?",
        }
      `);

    expect(score).toMatchInlineSnapshot('"D"');
  });

  test('modelGradedClosedQA', async () => {
    const score = await baserun.trace(async () => {
      return await baserun.evals.modelGradedClosedQA(
        'modelGradedFact',
        'Who is the president of the United States?',
        'Donald Trump',
        'Could this person actually be the president of the United States?',
      );
    }, 'modelGradedFact run')();

    const storedData = storeTestSpy.mock.calls;

    const payload = JSON.parse(storedData[0][0].eval.payload);
    const pickedPayload = pick(payload, ['question', 'expert']);

    // eslint-disable-next-line prettier/prettier
    expect(pickedPayload).toMatchInlineSnapshot('{}');

    expect(score).toMatchInlineSnapshot('"Yes"');
  });
});
