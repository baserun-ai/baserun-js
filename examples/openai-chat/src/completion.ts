import OpenAI from 'openai';

const openai = new OpenAI();

async function doItMooIt() {
  const res = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: 'A long long time ago, ',
    max_tokens: 10,
  });

  console.log(res);
}

const getCompletion = doItMooIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
