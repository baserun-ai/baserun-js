import {
  ChatCompletionRequestMessage,
  CreateCompletionRequest,
  CreateChatCompletionRequest,
} from 'openai';
import { BaserunProvider, BaserunType, Variables } from './types';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

export type OpenAIChatMessage = ChatCompletionRequestMessage & Variables;
export type OpenAICompletionPrompt = { content: string } & Variables;

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

export type OpenAIChatRole = ChatCompletionRequestMessageRoleEnum;
export type OpenAIChatRequestOutput = CreateChatCompletionRequest;
export type OpenAICompletionRequestOutput = CreateCompletionRequest;

export type OpenAIRequestInput =
  | OpenAIChatRequestInput
  | OpenAICompletionRequestInput;
