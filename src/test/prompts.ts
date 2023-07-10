import {
  OpenAIChatRequestInput,
  OpenAICompletionRequestInput,
} from '../openai';
import { BaserunProvider, BaserunType } from '../types';

export const CompletionPrompts: Record<string, OpenAICompletionRequestInput> = {
  completion: {
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

export const ChatPrompts: Record<string, OpenAIChatRequestInput> = {
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
