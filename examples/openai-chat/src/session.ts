import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';

const openai = new OpenAI();
async function getCompletions(text: string) {
  const gptResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Say "this is a test ${text}"`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  baserun.log('gptResponse', gptResponse);
}

const reallyGetCompletions = baserun.trace(getCompletions, {
  metadata: {
    random: 'metadata whooot',
  },
  name: 'funny trace',
});

async function main() {
  await baserun.init();
  await baserun.session({
    session() {
      return reallyGetCompletions('test');
    },
    user: 'bobby brown',
  });
}

main();
