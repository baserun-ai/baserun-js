import { baserun } from '../index.js';
import OpenAI from 'openai';

baserun.init();

const openai = new OpenAI();
async function getCompletions() {
  const gptResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Say "this is a test"`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  console.log(gptResponse);
}

const reallyGetCompletions = (name: string) =>
  baserun.trace(getCompletions, { name })();

async function main() {
  await Promise.all([
    reallyGetCompletions('trace 1'),
    reallyGetCompletions('trace 2'),
    reallyGetCompletions('trace 3'),
    reallyGetCompletions('trace 4'),
    reallyGetCompletions('trace 5'),
  ]);
}

main();
