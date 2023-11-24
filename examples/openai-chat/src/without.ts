import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';

async function doItMooIt() {
  await baserun.init();

  const openai = new OpenAI();
  const messages = [
    {
      role: 'user',
      content: `Say "this is a test ${(Math.random() * 100) | 0}"`,
    },
  ] as any;

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  return chatCompletion;
}

const getCompletion = doItMooIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
