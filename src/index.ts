import {
  OpenAIChatRequestInput,
  OpenAIChatRequestOutput,
  OpenAIChatRole,
  OpenAICompletionRequestInput,
  OpenAICompletionRequestOutput,
  OpenAIRequestInput,
} from './openai';
import {
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleCompletionRequestOutput,
  GoogleChatRequestInput,
  GoogleChatRequestOutput,
  GoogleRequestOutput,
} from './google';
import {
  BaserunProvider,
  BaserunType,
  BaserunChatMessage,
  BaserunPrompt,
} from './types';
import {
  parseVariablesFromTemplateString,
  pickKeys,
  Segment,
  templatizeString,
} from './template';

type AIRequestInput = OpenAIRequestInput | GoogleRequestInput;

export {
  AIRequestInput,
  GoogleChatRequestInput,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleCompletionRequestOutput,
  GoogleChatRequestOutput,
  GoogleRequestOutput,
  OpenAIChatRole,
  OpenAIRequestInput,
  BaserunProvider,
  BaserunType,
  BaserunPrompt,
  BaserunChatMessage,
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
