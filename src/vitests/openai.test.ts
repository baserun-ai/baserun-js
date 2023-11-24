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
import pick from 'lodash.pick';
import { Eval } from '../evals/types.js';

const openai = new OpenAI();

describe(
  'openai',
  () => {
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

    describe('completion', () => {
      test('with promise', async () => {
        await openai.completions.create({
          model: 'gpt-3.5-turbo-instruct',
          prompt: '1+1=',
          temperature: 0,
        });

        const storedData = submitLogSpy.mock.calls as any;

        const expected = pick(storedData[0][0].completions[0], [
          'role',
          'finishReason',
          'name',
          'toolCallId',
          'toolCalls',
        ]);

        expect(expected).toMatchInlineSnapshot(`
      {
        "finishReason": "length",
        "name": "",
        "role": undefined,
        "toolCallId": "",
        "toolCalls": [],
      }
    `);
      });

      test('with promise and check', async () => {
        await baserun.trace(async () => {
          const res = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: '1+1=',
            temperature: 0,
          });

          baserun.evals.includes(
            'model name',
            'gpt-3.5-turbo-instruct',
            res.model,
          );
        }, 'test')();

        const spanData = submitLogSpy.mock.calls as any;
        const [span, run] = spanData[0];
        // todo: not sure why evalData is empty
        // const evalData = evalSpy.mock.calls as any;

        const expectedLog = pick(span, ['name', 'model', 'vendor']);
        const expectedRun = pick(run, ['name', 'metadata']);

        expect(expectedLog).toMatchInlineSnapshot(`
        {
          "model": "gpt-3.5-turbo-instruct",
          "name": "baserun.openai.completion",
          "vendor": "openai",
        }
      `);
        expect(expectedRun).toMatchInlineSnapshot(`
            {
              "metadata": "{}",
              "name": "test",
            }
          `);
      });

      test('with stream', async () => {
        const stream = await openai.completions.create({
          model: 'gpt-3.5-turbo-instruct',
          prompt: '1+1=',
          temperature: 0,
          stream: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _completion of stream) {
          // console.log(completion);
        }

        const storedData = submitLogSpy.mock.calls as any;

        const expected = pick(storedData[0][0].completions[0], [
          'role',
          'finishReason',
          'name',
          'toolCallId',
          'toolCalls',
        ]);

        expect(expected).toMatchInlineSnapshot(`
      {
        "finishReason": null,
        "name": "",
        "role": undefined,
        "toolCallId": "",
        "toolCalls": [],
      }
    `);
      });
    });

    describe('chat completion', () => {
      test('with promise', async () => {
        await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-1106',
          messages: [
            {
              role: 'user',
              content: `Say "this is a test"`,
            },
          ],
          temperature: 0,
          max_tokens: 10,
        });

        const storedData = submitLogSpy.mock.calls as any;

        const [span, run] = storedData[0];

        const expectedLog = pick(span, ['name', 'model', 'vendor']);
        const expectedRun = pick(run, ['name', 'metadata']);

        expect(expectedLog).toMatchInlineSnapshot(`
        {
          "model": "gpt-3.5-turbo-1106",
          "name": "baserun.openai.chat",
          "vendor": "openai",
        }
      `);
        expect(expectedRun).toMatchInlineSnapshot(`
            {
              "metadata": "{}",
              "name": "openai chat",
            }
          `);
      });
      test('with stream', async () => {
        const stream = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-1106',
          messages: [
            {
              role: 'user',
              content: `Say "this is a test"`,
            },
          ],
          temperature: 0,
          stream: true,
          max_tokens: 10,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _completion of stream) {
          // console.log(completion);
        }

        const storedData = submitLogSpy.mock.calls as any;

        const [span, run] = storedData[0];

        const expectedLog = pick(span, ['name', 'model', 'vendor', 'stream']);
        const expectedRun = pick(run, ['name', 'metadata']);

        expect(expectedLog).toMatchInlineSnapshot(`
        {
          "model": "gpt-3.5-turbo-1106",
          "name": "baserun.openai.chat",
          "stream": true,
          "vendor": "openai",
        }
      `);
        expect(expectedRun).toMatchInlineSnapshot(`
            {
              "metadata": "{}",
              "name": "openai chat",
            }
          `);
      });
    });
  },
  {
    timeout: 15000,
  },
);
