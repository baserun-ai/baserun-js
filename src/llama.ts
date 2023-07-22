import { BaserunChatMessage, BaserunProvider, BaserunType } from './types';

interface LlamaChatConfig {
  model: 'llama7b-v2-chat' | 'llama13b-v2-chat' | 'llama70b-v2-chat';
  temperature?: number;
  max_new_tokens?: number;
  top_p?: number;
  repetition_penalty?: number;
}

export interface LlamaChatRequestInput {
  config: LlamaChatConfig;
  messages: BaserunChatMessage[];
  provider: BaserunProvider.Llama;
  type: BaserunType.Chat;
}

export type LlamaRequestInput = LlamaChatRequestInput;

export interface LlamaChatRequestOutput {
  model: 'llama7b-v2-chat' | 'llama13b-v2-chat' | 'llama70b-v2-chat';
  input: Omit<LlamaChatConfig, 'model'> & {
    prompt: string;
    system_prompt?: string;
  };
}

export type LlamaRequestOutput = LlamaChatRequestOutput;
