import OpenAI from 'openai';
import { baserun } from '../../../src';

baserun.init();

const openai = new OpenAI();

async function doItMooIt2() {
  const messages = [
    {
      role: 'user',
      content: `Say "this is a test ${(Math.random() * 100) | 0}"`,
    },
  ] as any;

  baserun.log('getting started', { this: 'is json' });

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  messages.push(chatCompletion.choices[0].message);

  baserun.log('can you belive it', { this: 'is json' });

  messages.push({
    role: 'user',
    content: `Are you really really sure???`,
  });

  const chatCompletion2 = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  baserun.log('wow! look at all these choices', chatCompletion2.choices);

  return chatCompletion2;
}

const getCompletion = baserun.trace(doItMooIt2, {
  name: 'openai.chat.completions.create',
});

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
