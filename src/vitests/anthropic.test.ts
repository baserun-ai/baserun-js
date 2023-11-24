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

import Anthropic from '@anthropic-ai/sdk';
import pick from 'lodash.pick';
const anthropic = new Anthropic({});

describe('anthropic', () => {
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

  test('automatically instruments anthropic completion', async () => {
    await anthropic.completions.create({
      model: 'claude-2',
      max_tokens_to_sample: 20,
      prompt: `${Anthropic.HUMAN_PROMPT} What's going on?${Anthropic.AI_PROMPT}`,
    });

    const storedData = storeTestSpy.mock.calls as any;

    const expected = pick(storedData[0][0].completions[0], [
      'role',
      'finishReason',
      'name',
    ]);

    expect(expected).toMatchInlineSnapshot(`
      {
        "finishReason": "max_tokens",
        "name": "",
        "role": "Assistant",
      }
    `);
  });

  test('automatically instruments anthropic completion with stream', async () => {
    const stream = await anthropic.completions.create({
      model: 'claude-2',
      max_tokens_to_sample: 20,
      prompt: `${Anthropic.HUMAN_PROMPT} What's going on?${Anthropic.AI_PROMPT}`,
      stream: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _completion of stream) {
      // consume stream
    }

    const storedData = storeTestSpy.mock.calls as any;

    const res = storedData[0][0];
    const expected = pick(res, ['name', 'model', 'requestType', 'vendor']);

    expect(expected).toMatchInlineSnapshot(`
      {
        "model": "claude-2",
        "name": "baserun.anthropic.completion",
        "requestType": "completion",
        "vendor": "anthropic",
      }
    `);
  });
});
