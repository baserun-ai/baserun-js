import { baserun } from '../../../src/index.js';
import Replicate from 'replicate';

async function doItMooIt() {
  await baserun.init();

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const output = await replicate.run(
    'replicate/llama-7b:ac808388e2e9d8ed35a5bf2eaa7d83f0ad53f9e3df31a42e4eb0a0c3249b3165',
    {
      input: {
        prompt: '1+1=',
        max_length: 4,
        temperature: 0.01,
      },
    },
  );

  return output;
}

const getCompletion = doItMooIt;

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
