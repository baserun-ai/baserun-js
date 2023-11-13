import OpenAI from 'openai';

const openai = new OpenAI();

async function doItMooIt() {
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

  messages.push(chatCompletion.choices[0].message);

  messages.push({
    role: 'user',
    content: `Are you really really sure???`,
  });

  const chatCompletion2 = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  return chatCompletion2;
}

const getCompletion = doItMooIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
