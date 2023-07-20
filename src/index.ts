import {
  OpenAIChatMessage,
  OpenAIChatRequestInput,
  OpenAIChatRequestOutput,
  OpenAIChatRole,
  OpenAICompletionPrompt,
  OpenAICompletionRequestInput,
  OpenAICompletionRequestOutput,
  OpenAIRequestInput,
} from './openai';
import {
  GoogleCompletionPrompt,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleRequestOutput,
} from './google';
import { BaserunProvider, BaserunType } from './types';
import {
  parseVariablesFromTemplateString,
  pickKeys,
  Segment,
  templatizeString,
} from './template';

type AIRequestInput = OpenAIRequestInput | GoogleRequestInput;

export {
  AIRequestInput,
  GoogleCompletionPrompt,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleRequestOutput,
  OpenAIChatMessage,
  OpenAIChatRole,
  OpenAICompletionPrompt,
  OpenAIRequestInput,
  BaserunProvider,
  BaserunType,
  Segment,
  parseVariablesFromTemplateString,
};

export class Baserun {
  buildOpenAIChatPrompt(
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
            : '',
        };
      }),
    };
  }

  buildOpenAICompletionPrompt(
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

  buildGoogleCompletionPrompt(
    input: GoogleCompletionRequestInput,
    providedVariables?: Record<string, string>,
  ): GoogleRequestOutput {
    const {
      config: { model, ...config },
      prompt: { content, variables },
    } = input;
    return {
      model,
      parameters: config,
      instances: [
        {
          prompt: templatizeString(
            content,
            pickKeys(variables, providedVariables),
          ),
        },
      ],
    };
  }
}
