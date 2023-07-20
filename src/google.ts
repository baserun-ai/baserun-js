import { BaserunProvider, BaserunType, Variables } from './types';

export type GoogleCompletionPrompt = { content: string } & Variables;

interface GoogleCompletionConfig {
  model: 'text-bison@001';
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export interface GoogleCompletionRequestInput {
  config: GoogleCompletionConfig;
  prompt: GoogleCompletionPrompt;
  provider: BaserunProvider.Google;
  type: BaserunType.Completion;
}

export type GoogleRequestInput = GoogleCompletionRequestInput;
export interface GoogleRequestOutput {
  model: 'text-bison@001';
  parameters: Omit<GoogleCompletionConfig, 'model'>;
  instances: Array<{ prompt: string }>;
}
