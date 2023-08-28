import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Log,
} from '../types';
import { DEFAULT_USAGE } from './constants';
import { patch } from './patch';

interface AnthropicError {
  error?: { error?: { message?: string } };
}

export class AnthropicWrapper {
  static resolver(
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
    let output = '';
    const { prompt = '', ...config } = args[0] ?? {};
    const type = BaserunType.Completion;
    if (error) {
      const maybeAnthropicError = error as AnthropicError;
      if (maybeAnthropicError?.error?.error?.message) {
        output = `Error: ${maybeAnthropicError.error.error.message}`;
      } else {
        output = `Error: ${error}`;
      }
    } else if (response) {
      output = response.completion ?? '';
    }

    const logEntry = {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.Anthropic,
      output,
      startTimestamp: startTime,
      completionTimestamp: endTime,
      usage: DEFAULT_USAGE,
    };

    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    } as AutoLLMLog;
  }

  static init(log: (entry: Log) => void) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const module = require('@anthropic-ai/sdk');
      const symbols = ['Anthropic.Completions.prototype.create'];
      patch(module, symbols, AnthropicWrapper.resolver, log);
    } catch (err) {
      /* @anthropic-ai/sdk isn't used */
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
