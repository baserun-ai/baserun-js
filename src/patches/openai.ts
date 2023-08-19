import { BaserunProvider, BaserunStepType, BaserunType, Log } from '../types';
import { patch } from './patch';
import { DEFAULT_USAGE } from './constants';
import { getTimestamp } from '../helpers';

interface OldOpenAIError {
  response?: { data?: { error?: { message?: string } } };
}

interface NewOpenAIError {
  response?: { error?: { message?: string } };
}

export class OpenAIWrapper {
  static oldResolver(
    symbol: string,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    args: any[],
    startTime: number,
    endTime: number,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    response?: any,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    error?: any,
  ) {
    let usage = DEFAULT_USAGE;
    let output = '';
    const type = symbol.includes('Chat')
      ? BaserunType.Chat
      : BaserunType.Completion;

    if (error) {
      const maybeOpenAIError = error as OldOpenAIError;
      if (maybeOpenAIError?.response?.data?.error?.message) {
        output = `Error: ${maybeOpenAIError.response.data.error.message}`;
      } else {
        output = `Error: ${error}`;
      }
    } else if (response) {
      usage = response.usage;
      if (type === BaserunType.Completion) {
        output = response.data.choices[0]?.text ?? '';
      } else {
        output = response.data.choices[0]?.message?.content ?? '';
      }
    }

    const logEntry = {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.OpenAI,
      output,
      startTimestamp: startTime,
      completionTimestamp: getTimestamp(),
      usage: usage ?? DEFAULT_USAGE,
    };

    if (type === BaserunType.Chat) {
      const { messages = [], ...config } = args[0] ?? {};
      return {
        ...logEntry,
        messages,
        config,
      };
    }

    const { prompt = '', ...config } = args[0] ?? {};
    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    };
  }

  static newResolver(
    symbol: string,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    args: any[],
    startTime: number,
    endTime: number,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    response?: any,
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    error?: any,
  ) {
    let usage = DEFAULT_USAGE;
    let output = '';
    const type = symbol.includes('Chat')
      ? BaserunType.Chat
      : BaserunType.Completion;

    if (error) {
      const maybeOpenAIError = error as NewOpenAIError;
      if (maybeOpenAIError?.response?.error?.message) {
        output = `Error: ${maybeOpenAIError.response.error.message}`;
      } else {
        output = `Error: ${error}`;
      }
    } else if (response) {
      usage = response.usage;
      if (type === BaserunType.Completion) {
        output = response.choices[0]?.text ?? '';
      } else {
        output = response.choices[0]?.message?.content ?? '';
      }
    }

    const logEntry = {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.OpenAI,
      output,
      startTimestamp: startTime,
      completionTimestamp: getTimestamp(),
      usage: usage ?? DEFAULT_USAGE,
    };

    if (type === BaserunType.Chat) {
      const { messages = [], ...config } = args[0] ?? {};
      return {
        ...logEntry,
        messages,
        config,
      };
    }

    const { prompt = '', ...config } = args[0] ?? {};
    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    };
  }

  static init(log: (entry: Log) => void) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const module = require('openai');
      const isV4 = Boolean(module?.OpenAI?.Chat?.Completions);
      if (isV4) {
        const symbols = [
          'OpenAI.Completions.prototype.create',
          'OpenAI.Chat.Completions.prototype.create',
        ];
        patch(module, symbols, OpenAIWrapper.newResolver, log);
      } else {
        const symbols = [
          'OpenAIApi.prototype.createCompletion',
          'OpenAIApi.prototype.createChatCompletion',
        ];
        patch(module, symbols, OpenAIWrapper.oldResolver, log);
      }
    } catch (err) {
      /* openai isn't used */
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'MODULE_NOT_FOUND'
      ) {
        return;
      }

      throw err;
    }
  }
}
