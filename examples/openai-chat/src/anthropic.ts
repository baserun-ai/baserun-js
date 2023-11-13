import Anthropic from '@anthropic-ai/sdk';
import { baserun } from '../../../src';

baserun.init();

const anthropic = new Anthropic({});

async function main() {
  const stream = await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 20,
    prompt: `${Anthropic.HUMAN_PROMPT} What's going on?${Anthropic.AI_PROMPT}`,
    // prompt: `${Anthropic.HUMAN_PROMPT} What's going on?`,
    stream: true,
  });

  console.log(stream);

  for await (const completion of stream) {
    // console.log(completion);
  }
}

main();
