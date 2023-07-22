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
  LlamaRequestInput,
  LlamaChatRequestOutput,
  LlamaChatRequestInput,
  LlamaRequestOutput,
} from './llama';

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

type AIRequestInput =
  | OpenAIRequestInput
  | GoogleRequestInput
  | LlamaRequestInput;

export {
  AIRequestInput,
  GoogleChatRequestInput,
  GoogleCompletionRequestInput,
  GoogleRequestInput,
  GoogleCompletionRequestOutput,
  GoogleChatRequestOutput,
  GoogleRequestOutput,
  LlamaChatRequestInput,
  LlamaRequestInput,
  LlamaChatRequestOutput,
  LlamaRequestOutput,
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

  buildLlamaChatPrompt(
    input: LlamaChatRequestInput,
    providedVariables?: Record<string, string>,
  ): LlamaChatRequestOutput {
    const {
      config: { model, ...config },
      messages,
    } = input;

    const systemPrompt = messages
      .filter((message) => message.role === OpenAIChatRole.System)
      .map((message) => {
        return message.content
          ? templatizeString(
              message.content,
              pickKeys(message.variables, providedVariables),
            )
          : undefined;
      })
      .join('\n');

    const userAndAssistantMessages = messages.filter(
      (message) =>
        message.role === OpenAIChatRole.User ||
        message.role === OpenAIChatRole.Assistant,
    );

    const prompt = userAndAssistantMessages
      .map((message) => {
        const templatedMessage = templatizeString(
          message.content ?? '',
          pickKeys(message.variables, providedVariables),
        );

        if (
          userAndAssistantMessages.length === 1 ||
          userAndAssistantMessages.every(
            (message) => message.role === OpenAIChatRole.User,
          )
        ) {
          return templatedMessage;
        }

        const prefix =
          message.role === OpenAIChatRole.User ? 'User' : 'Assistant';
        return `${prefix}: ${templatedMessage}`;
      })
      .join('\n');

    return {
      model,
      input: {
        ...config,
        prompt,
        system_prompt: systemPrompt,
      },
    };
  }
}
