import { baserun } from '../../../src/index.js';
import OpenAI from 'openai';

async function askQuestion(question = 'What is the capital of the US?') {
  const openai = new OpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: question }],
  });
  const content = completion.choices[0].message.content ?? '';

  // Create the annotation
  const annotation = baserun.annotate(completion.id);

  // Capture whatever annotations you need
  annotation.feedback('annotate_feedback', {
    score: 0.8,
    metadata: {
      comment: 'This is correct but not concise enough',
    },
  });
  annotation.checkIncludes('openai_chat.content', 'Washington', content);
  annotation.log('OpenAI Chat Results', { result: content, input: question });

  // Make sure to submit the annotation
  await annotation.submit();

  return completion;
}

async function main() {
  await baserun.init();
  const workflow = baserun.trace(askQuestion, 'Tracing annotation');
  await workflow();
}

main();
