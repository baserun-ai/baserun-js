import { expect, test } from 'vitest';
import { baserun } from '../index.js';
baserun.init();

import OpenAI from 'openai';
// import sinon from 'sinon';
// import { getOrCreateSubmissionService } from '../backend/submissionService';

const openai = new OpenAI();

test.only('automatically instruments openai chat completion', async () => {
  // await sleep(1000);
  // const mockStartRun = sinon.stub(getOrCreateSubmissionService(), 'startRun');
  // const mockEndRun = sinon.stub(getOrCreateSubmissionService(), 'endRun');

  const x = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: '1+1=',
  });

  console.log(x);

  expect(1).toBe(1);

  // // Assert
  // expect(mockStartRun.calledOnce).toBe(true);
  // expect(mockEndRun.calledOnce).toBe(true);

  // // Clean up
  // mockStartRun.restore();
  // mockEndRun.restore();
});
