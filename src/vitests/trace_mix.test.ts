import {
  SpyInstance,
  expect,
  vi,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  test,
} from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import { Log, Run, Span } from '../v1/gen/baserun.js';
baserun.init();

import OpenAI from 'openai';
import { Eval } from '../evals/types.js';
import groupBy from 'lodash.groupby';

const openai = new OpenAI();

describe('openai', () => {
  let submitLogSpy: SpyInstance<
    [logOrSpan: Log | Span, run: Run, submitRun?: boolean],
    Promise<void>
  >;
  let evalSpy: SpyInstance<[evalEntry: Eval<any>], void>;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    submitLogSpy = vi.spyOn(Baserun, 'submitLogOrSpan');
    evalSpy = vi.spyOn(Baserun, '_appendToEvals');
  });

  afterEach(() => {
    submitLogSpy.mockRestore();
    evalSpy.mockRestore();
  });

  test('trace mix', async () => {
    await baserun.trace(async () => {
      baserun.log('lets go', 'omg');
      await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '1+1=',
        temperature: 0,
      });

      const res = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '2+2=',
        temperature: 0,
      });

      baserun.log('TestEvent', 'whatever');

      baserun.evals.includes('model name', res.model, 'gpt-3.5-turbo-instruct');
    })();

    const storedData = submitLogSpy.mock.calls as any;

    const [span1] = storedData[0];
    expect(span1.name).toBe('lets go');

    const [span2] = storedData[1];
    expect(span2.model).toBe('gpt-3.5-turbo-instruct');

    const [span3] = storedData[2];
    expect(span3.model).toBe('gpt-3.5-turbo-instruct');

    const [span4] = storedData[3];
    expect(span4.name).toBe('TestEvent');
  });

  test.only('parallel traces', async () => {
    const fn = await baserun.trace(async () => {
      baserun.log('lets go', 'omg');
      await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '1+1=',
        temperature: 0,
      });

      const res = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '2+2=',
        temperature: 0,
      });

      baserun.log('TestEvent', 'whatever');

      baserun.evals.includes('model name', res.model, 'gpt-3.5-turbo-instruct');
    });

    await Promise.all([fn(), fn()]);

    const storedData = submitLogSpy.mock.calls as any;

    // we want to make sure that the traces are separate
    expect(storedData.length).toBe(8);

    const grouped = groupBy(storedData, (x: any) => x[1].runId);
    // group by runId

    const [trace1, trace2] = Object.values(grouped);

    expect(trace1.length).toBe(4);
    expect(trace2.length).toBe(4);
  });
});
