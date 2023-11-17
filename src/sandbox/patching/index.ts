import OpenAI from 'openai';
import { patch } from './patcher.js';

patch();

const openai = new OpenAI();

async function main() {
  const ai = await openai.chat.completions.create({
    messages: [
      {
        content: 'Hi',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  // console.log(ai);
  // const ai = await openai.completions.create({
  //   model: 'babbage-002',
  //   prompt: 'Once upon a time',
  // });

  console.log(ai);
}

main();
