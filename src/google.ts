import { BaserunProvider, BaserunType, Variables } from './types';

export type GoogleCompletionPrompt = { content: string } & Variables;
export type GoogleChatMessages = Array<
  { content: string; role: string } & Variables
>;

interface GoogleChatConfig {
  model: 'chat-bison@001';
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

/* TODO add support for context & examples */
export interface GoogleChatRequestInput {
  config: GoogleChatConfig;
  messages: GoogleChatMessages;
  provider: BaserunProvider.Google;
  type: BaserunType.Chat;
}

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

export type GoogleRequestInput =
  | GoogleCompletionRequestInput
  | GoogleChatRequestInput;

export interface GoogleCompletionRequestOutput {
  model: 'text-bison@001';
  parameters: Omit<GoogleCompletionConfig, 'model'>;
  instances: Array<{ prompt: string }>;
}

export interface GoogleChatRequestOutput {
  model: 'chat-bison@001';
  parameters: Omit<GoogleChatConfig, 'model'>;
  instances: Array<{ messages: Array<{ author: string; content: string }> }>;
}

export type GoogleRequestOutput =
  | GoogleCompletionRequestOutput
  | GoogleChatRequestOutput;
