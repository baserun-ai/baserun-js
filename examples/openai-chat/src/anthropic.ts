import Anthropic from '@anthropic-ai/sdk';
import { baserun } from '../../../src';

baserun.init();

const anthropic = new Anthropic({});

async function main() {
  const completion = await anthropic.completions.create({
    model: 'claude-2',
    max_tokens_to_sample: 20,
    prompt: `${Anthropic.HUMAN_PROMPT} What's going on? ${Anthropic.AI_PROMPT}`,
  });

  console.log(completion);
}

main();
