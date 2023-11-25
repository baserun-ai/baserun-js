import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';

async function doIt() {
  await baserun.init();

  const openai = new OpenAI();

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Say "this is a test ${(Math.random() * 100) | 0}"`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  return chatCompletion;
}

const getCompletion = doIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
