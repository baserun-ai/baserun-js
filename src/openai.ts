import { BaserunProvider, BaserunType, Log } from './types';

export function monkeyPatchOpenAI(log: (entry: Log) => void) {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const openai = require('openai');

    const originalCompletionCreate = openai.Completion.create;
    const originalChatCompletionCreate = openai.ChatCompletion.create;

    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    openai.Completion.create = function (...args: any[]): any {
      const startTime = Date.now();
      const response = originalCompletionCreate(...args);

      const { prompt = '', ...config } = args[0] ?? {};
      const output = response.choices[0].text;
      const usage = response.usage;

      const logEntry = {
        type: BaserunType.Completion,
        provider: BaserunProvider.OpenAI,
        config,
        prompt: { content: prompt },
        output,
        startTimestamp: startTime,
        completionTimestamp: Date.now(),
        usage,
      };

      log(logEntry);

      return response;
    };

    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    openai.ChatCompletion.create = function (...args: any[]): any {
      const startTime = Date.now();
      const response = originalChatCompletionCreate(...args);

      const { messages = [], ...config } = args[0] ?? {};
      const output = response.choices[0].message.content;
      const usage = response.usage;

      const logEntry = {
        type: BaserunType.Chat,
        provider: BaserunProvider.OpenAI,
        config,
        messages,
        output,
        startTimestamp: startTime,
        completionTimestamp: Date.now(),
        usage,
      };

      log(logEntry);

      return response;
    };
  } catch (error) {
    /* openai isn't used */
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'MODULE_NOT_FOUND'
    ) {
      return;
    }

    throw error;
  }
}
