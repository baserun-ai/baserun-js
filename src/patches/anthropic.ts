import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Log,
} from '../types';
import { DEFAULT_USAGE } from './constants';
import { patch } from './patch';
import { loadModule } from '../loader';

interface AnthropicError {
  error?: { error?: { message?: string } };
}

export class AnthropicWrapper {
  static resolver(
    symbol: string,
    args: any[],
    startTime: number,
    endTime: number,
    response?: any,
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

  static isStreaming(_symbol: string, args: any[]): boolean {
    return args[0].stream;
  }

  static collectStreamedResponse(
    _symbol: string,
    response: any,
    chunk: any,
  ): any {
    if (!response) {
      return chunk;
    }

    response.completion += chunk.completion;
    return response;
  }

  static init(log: (entry: Log) => void) {
    try {
      const anthropicModule = loadModule(module, '@anthropic-ai/sdk');
      const symbols = ['Anthropic.Completions.prototype.create'];
      patch({
        module: anthropicModule,
        symbols,
        resolver: AnthropicWrapper.resolver,
        log,
        isStreaming: AnthropicWrapper.isStreaming,
        collectStreamedResponse: AnthropicWrapper.collectStreamedResponse,
      });
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
