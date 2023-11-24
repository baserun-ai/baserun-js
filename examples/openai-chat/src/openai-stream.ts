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

  const stream = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
    stream: true,
  });

  const completions: any = [];
  for await (const completion of stream) {
    completions.push(completion);
  }

  return completions;
}

const getCompletion = baserun.trace(doItMooIt2, {
  name: 'hello kello rello',
});

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
