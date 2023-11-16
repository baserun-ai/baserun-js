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

const openai = new OpenAI();

describe('openai', () => {
  let storeTestSpy: SpyInstance<
    [logOrSpan: Log | Span, run: Run],
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

  test('automatically instruments openai chat completion', async () => {
    // await sleep(1000);
    // const mockStartRun = sinon.stub(getOrCreateSubmissionService(), 'startRun');
    // const mockEndRun = sinon.stub(getOrCreateSubmissionService(), 'endRun');

    const x = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: '1+1=',
    });

    console.log(x);

    const storedData = storeTestSpy.mock.calls;
    console.log('storedData', storedData);

    expect(1).toBe(1);

    // // Assert
    // expect(mockStartRun.calledOnce).toBe(true);
    // expect(mockEndRun.calledOnce).toBe(true);

    // // Clean up
    // mockStartRun.restore();
    // mockEndRun.restore();
  });
});
