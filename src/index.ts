import {
  OpenAIChatMessage,
  OpenAIChatRequestInput,
  OpenAIChatRequestOutput,
  OpenAICompletionPrompt,
  OpenAICompletionRequestInput,
  OpenAICompletionRequestOutput,
  OpenAIRequestInput,
} from './openai';
import { BaserunProvider, BaserunType } from './types';
import { pickKeys, templatizeString } from './template';

export { OpenAIChatMessage, OpenAICompletionPrompt, OpenAIRequestInput, BaserunProvider, BaserunType };

export class Baserun {
  buildChatPrompt(
    input: OpenAIChatRequestInput,
    providedVariables?: Record<string, string>,
  ): OpenAIChatRequestOutput {
    const { config, messages } = input;
    return {
      ...config,
      messages: messages.map(({ content, variables, ...rest }) => {
        return {
          ...rest,
          content: content
            ? templatizeString(content, pickKeys(variables, providedVariables))
            : undefined,
        };
      }),
    };
  }

  buildCompletionPrompt(
    input: OpenAICompletionRequestInput,
    providedVariables?: Record<string, string>,
  ): OpenAICompletionRequestOutput {
    const {
      config,
      prompt: { content, variables },
    } = input;
    return {
      ...config,
      prompt: templatizeString(content, pickKeys(variables, providedVariables)),
    };
  }
}
