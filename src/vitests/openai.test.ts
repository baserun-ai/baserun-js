import { expect, test, vi } from 'vitest';
import { baserun } from '../../src';
baserun.init();

import OpenAI from 'openai';
// import sinon from 'sinon';
// import { getOrCreateSubmissionService } from '../backend/submissionService';

const openai = new OpenAI();

test('yo', async () => {
  console.log(globalThis.something);
});

test.only('automatically instruments openai chat completion', async () => {
  // await sleep(1000);
  // const mockStartRun = sinon.stub(getOrCreateSubmissionService(), 'startRun');
  // const mockEndRun = sinon.stub(getOrCreateSubmissionService(), 'endRun');

  await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: "What's the weather like in San Francisco, Tokyo, and Paris?",
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  // // Assert
  // expect(mockStartRun.calledOnce).toBe(true);
  // expect(mockEndRun.calledOnce).toBe(true);

  // // Clean up
  // mockStartRun.restore();
  // mockEndRun.restore();
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
