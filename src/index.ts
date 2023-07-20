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
  GoogleChatMessages,
  GoogleCompletionPrompt,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleCompletionRequestOutput,
  GoogleChatRequestInput,
  GoogleChatRequestOutput,
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
  GoogleChatMessages,
  GoogleChatRequestInput,
  GoogleCompletionPrompt,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleCompletionRequestOutput,
  GoogleChatRequestOutput,
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
  ): GoogleCompletionRequestOutput {
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

  buildGoogleChatPrompt(
    input: GoogleChatRequestInput,
    providedVariables?: Record<string, string>,
  ): GoogleChatRequestOutput {
    const {
      config: { model, ...config },
      messages,
    } = input;
    return {
      model,
      parameters: config,
      instances: [
        {
          messages: messages.map(({ content, variables, role }) => {
            return {
              author: role,
              content: content
                ? templatizeString(
                    content,
                    pickKeys(variables, providedVariables),
                  )
                : '',
            };
          }),
        },
      ],
    };
  }
}
