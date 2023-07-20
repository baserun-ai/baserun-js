import { ChatCompletionRequestMessage } from 'openai';

export enum BaserunProvider {
  OpenAI = 'openai',
  Google = 'google',
}

export enum BaserunType {
  Chat = 'chat',
  Completion = 'completion',
}

export interface Variables {
  variables?: string[];
}

export type BaserunChatMessage = ChatCompletionRequestMessage & Variables;
export type BaserunPrompt = { content: string } & Variables;
