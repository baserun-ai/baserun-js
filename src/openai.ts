import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  CreateChatCompletionRequest,
} from 'openai';
import { Provider } from './provider';
import { templatizeString } from './template';

interface OpenAITemplateChatMessage {
  role:
    | typeof ChatCompletionRequestMessageRoleEnum.System
    | typeof ChatCompletionRequestMessageRoleEnum.User;
  template: string;
}

export type OpenAIChatPrompt =
  | ChatCompletionRequestMessage
  | OpenAITemplateChatMessage;

export interface OpenAIChatRequestInput {
  config: Omit<CreateChatCompletionRequest, 'messages'>;
  prompts: OpenAIChatPrompt[];
  provider: Provider.OpenAI;
}

export type OpenAIChatRequest = CreateChatCompletionRequest;

export function evaluateOpenAIPrompt(
  prompt: OpenAIChatPrompt,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  variables: any,
): ChatCompletionRequestMessage {
  if ('template' in prompt) {
    const { role, template } = prompt;
    return {
      role,
      content: templatizeString(template, variables),
    };
  }

  return prompt;
}
