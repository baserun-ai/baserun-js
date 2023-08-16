import { BaserunProvider, BaserunStepType, BaserunType, Log } from './types';
import { getTimestamp } from './helpers';

const DEFAULT_USAGE = {
  prompt_tokens: 0,
  completion_tokens: 0,
  total_tokens: 0,
};

interface OldOpenAIError {
  response?: { data?: { error?: { message?: string } } };
}

interface NewOpenAIError {
  response?: { error?: { message?: string } };
}

export function monkeyPatchOpenAIEdge(log: (entry: Log) => void) {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const openaiEdge = require('openai-edge');
    const originalCompletion = openaiEdge.OpenAIApi.prototype.createCompletion;
    const originalChatCompletion =
      openaiEdge.OpenAIApi.prototype.createChatCompletion;

    openaiEdge.OpenAIApi.prototype.createCompletion = async function (
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      ...args: any[]
    ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    Promise<any> {
      const startTime = getTimestamp();
      let usage;
      let output = '';
      try {
        const response = await originalCompletion.bind(this)(...args);
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        output =
          'error' in data
            ? `Error: ${data.error.message}`
            : data.choices[0]?.text ?? '';
        usage = data.usage;
        return response;
      } catch (err) {
        output = `Error: ${err}`;
        throw err;
      } finally {
        const { prompt = '', ...config } = args[0] ?? {};
        const logEntry = {
          stepType: BaserunStepType.AutoLLM,
          type: BaserunType.Completion,
          provider: BaserunProvider.OpenAI,
          config,
          prompt: { content: prompt },
          output,
          startTimestamp: startTime,
          completionTimestamp: getTimestamp(),
          usage: usage ?? DEFAULT_USAGE,
        };

        log(logEntry);
      }
    };

    openaiEdge.OpenAIApi.prototype.createChatCompletion = async function (
      /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      ...args: any[]
    ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    Promise<any> {
      const startTime = getTimestamp();
      let usage;
      let output = '';

      try {
        const response = await originalChatCompletion.bind(this)(...args);
        const clonedResponse = response.clone();

        const data = await clonedResponse.json();
        output =
          'error' in data
            ? `Error: ${data.error.message}`
            : data.choices[0]?.message?.content ?? '';
        usage = data.usage;
        return response;
      } catch (err) {
        output = `Error: ${err}`;
        throw err;
      } finally {
        const { messages = [], ...config } = args[0] ?? {};
        const logEntry = {
          stepType: BaserunStepType.AutoLLM,
          type: BaserunType.Chat,
          provider: BaserunProvider.OpenAI,
          config,
          messages,
          output,
          startTimestamp: startTime,
          completionTimestamp: getTimestamp(),
          usage: usage ?? DEFAULT_USAGE,
        };

        log(logEntry);
      }
    };
  } catch (error) {
    /* openai-edge isn't used */
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

export function monkeyPatchOpenAI(log: (entry: Log) => void) {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const openai = require('openai');

    const isV4 = Boolean(openai?.OpenAI?.Chat?.Completions);

    const originalCompletion = isV4
      ? openai.OpenAI.Completions.prototype.create
      : openai.OpenAIApi.prototype.createCompletion;
    const originalChatCompletion = isV4
      ? openai.OpenAI.Chat.Completions.prototype.create
      : openai.OpenAIApi.prototype.createChatCompletion;

    if (isV4) {
      openai.OpenAI.Completions.prototype.create = async function (
        /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
        ...args: any[]
      ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      Promise<any> {
        const startTime = getTimestamp();
        let usage;
        let output = '';

        try {
          const response = await originalCompletion.bind(this)(...args);
          output = response.choices[0]?.text ?? '';
          usage = response.usage;
          return response;
        } catch (err) {
          const maybeOpenAIError = err as NewOpenAIError;
          if (maybeOpenAIError?.response?.error?.message) {
            output = `Error: ${maybeOpenAIError.response.error.message}`;
          } else {
            output = `Error: ${err}`;
          }
          throw err;
        } finally {
          const { prompt = '', ...config } = args[0] ?? {};

          const logEntry = {
            stepType: BaserunStepType.AutoLLM,
            type: BaserunType.Completion,
            provider: BaserunProvider.OpenAI,
            config,
            prompt: { content: prompt },
            output,
            startTimestamp: startTime,
            completionTimestamp: getTimestamp(),
            usage: usage ?? DEFAULT_USAGE,
          };

          log(logEntry);
        }
      };

      openai.OpenAI.Chat.Completions.prototype.create = async function (
        /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
        ...args: any[]
      ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      Promise<any> {
        const startTime = getTimestamp();
        let usage;
        let output = '';

        try {
          const response = await originalChatCompletion.bind(this)(...args);
          output = response.choices[0]?.message?.content ?? '';
          usage = response.usage;
          return response;
        } catch (err) {
          const maybeOpenAIError = err as NewOpenAIError;
          if (maybeOpenAIError?.response?.error?.message) {
            output = `Error: ${maybeOpenAIError.response.error.message}`;
          } else {
            output = `Error: ${err}`;
          }
          throw err;
        } finally {
          const { messages = [], ...config } = args[0] ?? {};

          const logEntry = {
            stepType: BaserunStepType.AutoLLM,
            type: BaserunType.Chat,
            provider: BaserunProvider.OpenAI,
            config,
            messages,
            output,
            startTimestamp: startTime,
            completionTimestamp: getTimestamp(),
            usage: usage ?? DEFAULT_USAGE,
          };

          log(logEntry);
        }
      };
    } else {
      openai.OpenAIApi.prototype.createCompletion = async function (
        /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
        ...args: any[]
      ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      Promise<any> {
        const startTime = getTimestamp();
        let usage;
        let output = '';

        try {
          const response = await originalCompletion.bind(this)(...args);
          output = response.data.choices[0]?.text ?? '';
          usage = response.data.usage;
          return response;
        } catch (err) {
          const maybeOpenAIError = err as OldOpenAIError;
          if (maybeOpenAIError?.response?.data?.error?.message) {
            output = `Error: ${maybeOpenAIError.response.data.error.message}`;
          } else {
            output = `Error: ${err}`;
          }
          throw err;
        } finally {
          const { prompt = '', ...config } = args[0] ?? {};

          const logEntry = {
            stepType: BaserunStepType.AutoLLM,
            type: BaserunType.Completion,
            provider: BaserunProvider.OpenAI,
            config,
            prompt: { content: prompt },
            output,
            startTimestamp: startTime,
            completionTimestamp: getTimestamp(),
            usage: usage ?? DEFAULT_USAGE,
          };

          log(logEntry);
        }
      };

      openai.OpenAIApi.prototype.createChatCompletion = async function (
        /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
        ...args: any[]
      ): /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
      Promise<any> {
        const startTime = getTimestamp();
        let usage;
        let output = '';

        try {
          const response = await originalChatCompletion.bind(this)(...args);
          output = response.data.choices[0]?.message?.content ?? '';
          usage = response.data.usage;
          return response;
        } catch (err) {
          const maybeOpenAIError = err as OldOpenAIError;
          if (maybeOpenAIError?.response?.data?.error?.message) {
            output = `Error: ${maybeOpenAIError.response.data.error.message}`;
          } else {
            output = `Error: ${err}`;
          }
          throw err;
        } finally {
          const { messages = [], ...config } = args[0] ?? {};

          const logEntry = {
            stepType: BaserunStepType.AutoLLM,
            type: BaserunType.Chat,
            provider: BaserunProvider.OpenAI,
            config,
            messages,
            output,
            startTimestamp: startTime,
            completionTimestamp: getTimestamp(),
            usage: usage ?? DEFAULT_USAGE,
          };

          log(logEntry);
        }
      };
    }
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
