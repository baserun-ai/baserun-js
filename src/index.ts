import type { CreateChatCompletionRequest } from 'openai';

export function evaluatePrompt(prompt: CreateChatCompletionRequest): number {
  console.log(prompt);
  return 2 + 2;
}
