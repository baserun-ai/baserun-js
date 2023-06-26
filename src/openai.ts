import {
  ChatCompletionRequestMessage,
  CreateCompletionRequest,
  CreateChatCompletionRequest,
} from 'openai';
import { BaserunProvider, BaserunType, Variables } from './types';

export type OpenAIChatMessage = ChatCompletionRequestMessage & Variables;
type OpenAICompletionPrompt = { content: string } & Variables;

export interface OpenAIChatRequestInput {
  config: Omit<CreateChatCompletionRequest, 'messages'>;
  messages: OpenAIChatMessage[];
  provider: BaserunProvider.OpenAI;
  type: BaserunType.Chat;
}

export interface OpenAICompletionRequestInput {
  config: Omit<CreateCompletionRequest, 'prompt'>;
  prompt: OpenAICompletionPrompt;
  provider: BaserunProvider.OpenAI;
  type: BaserunType.Completion;
}

export type OpenAIRequestInput =
  | OpenAIChatRequestInput
  | OpenAICompletionRequestInput;

export type OpenAIChatRequestOutput = CreateChatCompletionRequest;
export type OpenAICompletionRequestOutput = CreateCompletionRequest;
export type OpenAIRequestOutput =
  | OpenAIChatRequestOutput
  | OpenAICompletionRequestOutput;
