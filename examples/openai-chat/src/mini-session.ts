import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  await baserun.init();
  const { data, sessionId } = await baserun.session({
    async session() {
      return openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `Say "this is a test"`,
          },
        ],
        model: 'gpt-3.5-turbo',
      });
    },
    user: 'bobby brown',
  });

  console.log({ data, sessionId });
}

main();
