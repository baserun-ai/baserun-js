import { BaserunProvider, BaserunStepType, BaserunType, Log } from './types';
import { getTimestamp } from './helpers';

export function monkeyPatchOpenAI(log: (entry: Log) => void) {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const openai = require('openai');

    const originalCompletion = openai.OpenAIApi.prototype.createCompletion;
    const originalChatCompletion =
      openai.OpenAIApi.prototype.createChatCompletion;

    openai.OpenAIApi.prototype.createCompletion = async function (
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      ...args: any[]
    ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    Promise<any> {
      const startTime = getTimestamp();
      const response = await originalCompletion.bind(this)(...args);

      const { prompt = '', ...config } = args[0] ?? {};
      const output = response.data.choices[0].text;
      const usage = response.data.usage;

      const logEntry = {
        stepType: BaserunStepType.AutoLLM,
        type: BaserunType.Completion,
        provider: BaserunProvider.OpenAI,
        config,
        prompt: { content: prompt },
        output,
        startTimestamp: startTime,
        completionTimestamp: getTimestamp(),
        usage,
      };

      log(logEntry);

      return response;
    };

    openai.OpenAIApi.prototype.createChatCompletion = async function (
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      ...args: any[]
    ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    Promise<any> {
      const startTime = getTimestamp();
      const response = await originalChatCompletion.bind(this)(...args);

      const { messages = [], ...config } = args[0] ?? {};
      const output = response.data.choices[0].message.content;
      const usage = response.data.usage;

      const logEntry = {
        stepType: BaserunStepType.AutoLLM,
        type: BaserunType.Chat,
        provider: BaserunProvider.OpenAI,
        config,
        messages,
        output,
        startTimestamp: startTime,
        completionTimestamp: getTimestamp(),
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
