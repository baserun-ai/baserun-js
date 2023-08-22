import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Log,
} from '../types';
import { patch } from './patch';
import { DEFAULT_USAGE } from './constants';

interface OldOpenAIError {
  response?: { data?: { error?: { message?: string } } };
}

interface NewOpenAIError {
  response?: { error?: { message?: string } };
}

export class OpenAIWrapper {
  static originalMethods: {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    createCompletion: (config: any) => any;
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    createChatCompletion: (config: any) => any;
  } = {
    createCompletion: () => {
      throw new Error('createCompletion not defined');
    },
    createChatCompletion: () => {
      throw new Error('createChatCompletion not defined');
    },
  };

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
      usage = response.data.usage;
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
      completionTimestamp: endTime,
      usage: usage ?? DEFAULT_USAGE,
    };

    if (type === BaserunType.Chat) {
      const { messages = [], ...config } = args[0] ?? {};
      return {
        ...logEntry,
        messages,
        config,
      } as AutoLLMLog;
    }

    const { prompt = '', ...config } = args[0] ?? {};
    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    } as AutoLLMLog;
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
      completionTimestamp: endTime,
      usage: usage ?? DEFAULT_USAGE,
    };

    if (type === BaserunType.Chat) {
      const { messages = [], ...config } = args[0] ?? {};
      return {
        ...logEntry,
        messages,
        config,
      } as AutoLLMLog;
    }

    const { prompt = '', ...config } = args[0] ?? {};
    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    } as AutoLLMLog;
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
        const openai = new module({
          apiKey: process.env.OPENAI_API_KEY,
        });
        OpenAIWrapper.originalMethods = {
          createCompletion: openai.completions.create.bind(openai.completions),
          createChatCompletion: openai.chat.completions.create.bind(
            openai.chat.completions,
          ),
        };
        patch(module, symbols, OpenAIWrapper.newResolver, log);
      } else {
        const symbols = [
          'OpenAIApi.prototype.createCompletion',
          'OpenAIApi.prototype.createChatCompletion',
        ];
        const configuration = new module.Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new module.OpenAIApi(configuration);
        const originalCreateCompletion = openai.createCompletion.bind(openai);
        const originalCreateChatCompletion =
          openai.createChatCompletion.bind(openai);
        OpenAIWrapper.originalMethods = {
          createCompletion: async (args) => {
            const response = await originalCreateCompletion(args);
            return response.data;
          },
          createChatCompletion: async (args) => {
            const response = await originalCreateChatCompletion(args);
            return response.data;
          },
        };
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
