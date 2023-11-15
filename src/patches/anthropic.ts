import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
} from '../types.js';
import { DEFAULT_USAGE } from './constants.js';
import { patch } from './patch.js';
import { loadModule } from '../utils/loader.js';

export class AnthropicWrapper {
  static resolver(
    _symbol: string,
    args: any[],
    startTimestamp: Date,
    completionTimestamp: Date,
    isStream: boolean,
    response?: any,
    error?: any,
  ) {
    const { prompt = '', ...config } = args[0] ?? {};
    const type = BaserunType.Completion;

    if (error) {
      const errorMessage = error?.stack ?? error?.toString() ?? '';
      console.log({ errorMessage, error });
      return {
        stepType: BaserunStepType.AutoLLM,
        type,
        provider: BaserunProvider.Anthropic,
        startTimestamp,
        completionTimestamp,
        usage: DEFAULT_USAGE,
        prompt: { content: prompt },
        config,
        isStream,
        errorStack: errorMessage,
      } as AutoLLMLog;
    }

    return {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.Anthropic,
      startTimestamp,
      completionTimestamp,
      usage: DEFAULT_USAGE,
      prompt: { content: prompt },
      config,
      isStream,
      choices: [
        {
          content: response.completion,
          finish_reason: response.stop_reason,
          role: 'Assistant',
        },
      ],
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

  static async init(log: (entry: AutoLLMLog) => Promise<void>) {
    try {
      const anthropicModule = await loadModule(module, '@anthropic-ai/sdk');
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
