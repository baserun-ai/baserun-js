import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';
import { track } from '../../../src/utils/track.js';

async function doItMooIt() {
  await baserun.init();
  const openai = new OpenAI();
  const messages = [
    {
      role: 'user',
      content: `Say "this is a test ${(Math.random() * 100) | 0}"`,
    },
  ] as any;

  const chatCompletion = await track(
    () =>
      openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
      }),
    'openai.chat.completions.create',
  );

  messages.push(chatCompletion.choices[0].message);

  messages.push({
    role: 'user',
    content: `Are you really really sure???`,
  });

  return chatCompletion;

  // const chatCompletion2 = await openai.chat.completions.create({
  //   messages,
  //   model: 'gpt-3.5-turbo',
  // });

  // return chatCompletion2;
}

const getCompletion = doItMooIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
