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

  test('automatically instruments openai chat completion', async () => {
    await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: '1+1=',
      temperature: 0,
    });

    const storedData = storeTestSpy.mock.calls as any;

    expect(storedData[0][0].completions).toMatchInlineSnapshot(`
      [
        {
          "content": "2

      This is a basic mathematical equation that states that when you add one to",
          "finishReason": "length",
          "functionCall": "",
          "name": "",
          "role": undefined,
          "systemFingerprint": "",
          "toolCallId": "",
          "toolCalls": [],
        },
      ]
    `);
  });
});
