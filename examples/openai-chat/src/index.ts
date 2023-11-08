import OpenAI from 'openai';
import { baserun } from '../../../src';

baserun.init();

const openai = new OpenAI();

const getCompletion = baserun.trace(async () => {
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
});

async function main() {
  const completion = await getCompletion();
  console.log('completion', completion);
}

main();
