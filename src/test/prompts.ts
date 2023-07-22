import { BaserunProvider, BaserunType } from '../types';
import {
  GoogleChatRequestInput,
  GoogleCompletionRequestInput,
} from '../google';
import {
  OpenAIChatRequestInput,
  OpenAICompletionRequestInput,
} from '../openai';
import { LlamaChatRequestInput } from '../llama';

export const OpenAICompletionPrompts: Record<
  string,
  OpenAICompletionRequestInput
> = {
  openai: {
    config: {
      model: 'text-davinci-003',
    },
    prompt: {
      content: 'What is the capital of {{country}}?',
      variables: ['country'],
    },
    provider: BaserunProvider.OpenAI,
    type: BaserunType.Completion,
  },
};

export const GoogleCompletionPrompts: Record<
  string,
  GoogleCompletionRequestInput
> = {
  google: {
    config: {
      model: 'text-bison@001',
      temperature: 0.5,
    },
    prompt: {
      content: 'What is the capital of {{country}}?',
      variables: ['country'],
    },
    provider: BaserunProvider.Google,
    type: BaserunType.Completion,
  },
};

export const OpenAIChatPrompts: Record<string, OpenAIChatRequestInput> = {
  assistant: {
    config: {
      model: 'gpt-4',
    },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful customer support assistant for {{company}}.',
        variables: ['company'],
      },
      {
        role: 'user',
        content: '{{question}}',
        variables: ['question'],
      },
    ],
    provider: BaserunProvider.OpenAI,
    type: BaserunType.Chat,
  },
  country: {
    config: {
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      temperature: 0.3,
    },
    messages: [
      {
        role: 'user',
        content: 'What is the capital of {{country}}?',
        variables: ['country'],
      },
    ],
    provider: BaserunProvider.OpenAI,
    type: BaserunType.Chat,
  },
  ingredients: {
    config: {
      model: 'gpt-4',
    },
    messages: [
      {
        role: 'user',
        content:
          'Generate a shopping list of the ingredients in {{appetizer}}, {{entree}}, and {{dessert}}.',
        variables: ['appetizer', 'entree', 'dessert'],
      },
    ],
    provider: BaserunProvider.OpenAI,
    type: BaserunType.Chat,
  },
  static: {
    config: {
      model: 'gpt-4',
    },
    messages: [
      {
        role: 'user',
        content: 'What is the capital of Portugal?',
      },
    ],
    provider: BaserunProvider.OpenAI,
    type: BaserunType.Chat,
  },
};

export const GoogleChatPrompts: Record<string, GoogleChatRequestInput> = {
  chat: {
    config: {
      model: 'chat-bison@001',
    },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful customer support assistant for {{company}}.',
        variables: ['company'],
      },
      {
        role: 'user',
        content: '{{question}}',
        variables: ['question'],
      },
    ],
    provider: BaserunProvider.Google,
    type: BaserunType.Chat,
  },
};

export const LlamaChatPrompts: Record<string, LlamaChatRequestInput> = {
  chat: {
    config: {
      model: 'llama13b-v2-chat',
    },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful customer support assistant for {{company}}.',
        variables: ['company'],
      },
      {
        role: 'user',
        content: '{{question}}',
        variables: ['question'],
      },
    ],
    provider: BaserunProvider.Llama,
    type: BaserunType.Chat,
  },
  assistant: {
    config: {
      model: 'llama13b-v2-chat',
    },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful customer support assistant for {{company}}.',
        variables: ['company'],
      },
      {
        role: 'user',
        content: '{{question}}',
        variables: ['question'],
      },
      {
        role: 'assistant',
        content: 'Not too my knowledge',
      },
      {
        role: 'user',
        content: 'Can you check again?',
      },
    ],
    provider: BaserunProvider.Llama,
    type: BaserunType.Chat,
  },
};
