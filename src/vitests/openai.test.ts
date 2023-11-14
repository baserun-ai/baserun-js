import '../patch';

import { expect, test, vi } from 'vitest';
// import { baserun } from '../../src';
// baserun.init();

import OpenAI from 'openai';
// import sinon from 'sinon';
// import { getOrCreateSubmissionService } from '../backend/submissionService';

const openai = new OpenAI();

test.only('automatically instruments openai chat completion', async () => {
  // await sleep(1000);
  // const mockStartRun = sinon.stub(getOrCreateSubmissionService(), 'startRun');
  // const mockEndRun = sinon.stub(getOrCreateSubmissionService(), 'endRun');

  await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: 'Hi',
  });

  // // Assert
  // expect(mockStartRun.calledOnce).toBe(true);
  // expect(mockEndRun.calledOnce).toBe(true);

  // // Clean up
  // mockStartRun.restore();
  // mockEndRun.restore();
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
