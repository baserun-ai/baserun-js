import { CreateCompletionRequest, CreateChatCompletionRequest } from 'openai';
import {
  BaserunChatMessage,
  BaserunPrompt,
  BaserunProvider,
  BaserunType,
} from './types';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

export interface OpenAIChatRequestInput {
  config: Omit<CreateChatCompletionRequest, 'messages'>;
  messages: BaserunChatMessage[];
  provider: BaserunProvider.OpenAI;
  type: BaserunType.Chat;
}

export interface OpenAICompletionRequestInput {
  config: Omit<CreateCompletionRequest, 'prompt'>;
  prompt: BaserunPrompt;
  provider: BaserunProvider.OpenAI;
  type: BaserunType.Completion;
}

export { ChatCompletionRequestMessageRoleEnum as OpenAIChatRole };
export type OpenAIChatRequestOutput = CreateChatCompletionRequest;
export type OpenAICompletionRequestOutput = CreateCompletionRequest;

export type OpenAIRequestInput =
  | OpenAIChatRequestInput
  | OpenAICompletionRequestInput;
