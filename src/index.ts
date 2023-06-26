import {
  OpenAIChatRequestInput,
  OpenAIChatRequestOutput,
  OpenAICompletionRequestInput,
  OpenAICompletionRequestOutput,
  OpenAIRequestInput,
  OpenAIRequestOutput,
} from './openai';
import { BaserunProvider, BaserunType, Variables } from './types';
import { pickKeys, templatizeString } from './template';

export { OpenAIRequestInput };
export { Variables };
export { BaserunProvider };
export { BaserunType };

export class Baserun {
  buildPrompt(
    input: OpenAIChatRequestInput,
    providedVariables?: Record<string, string>,
  ): OpenAIChatRequestOutput;
  buildPrompt(
    input: OpenAICompletionRequestInput,
    providedVariables?: Record<string, string>,
  ): OpenAICompletionRequestOutput;
  buildPrompt(
    input: OpenAIRequestInput,
    providedVariables?: Record<string, string>,
  ): OpenAIRequestOutput {
    switch (input.provider) {
      case BaserunProvider.OpenAI: {
        switch (input.type) {
          case BaserunType.Chat: {
            const { config, messages } = input;
            return {
              ...config,
              messages: messages.map(({ content, variables, ...rest }) => {
                return {
                  ...rest,
                  content: content
                    ? templatizeString(
                        content,
                        pickKeys(variables, providedVariables),
                      )
                    : undefined,
                };
              }),
            };
          }

          case BaserunType.Completion: {
            const {
              config,
              prompt: { content, variables },
            } = input;
            return {
              ...config,
              prompt: templatizeString(
                content,
                pickKeys(variables, providedVariables),
              ),
            };
          }
        }
      }
    }
  }
}
