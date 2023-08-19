import { BaserunProvider, BaserunStepType, BaserunType, Log } from '../types';
import { DEFAULT_USAGE } from './constants';
import { patch } from './patch';

export class OpenAIEdgeWrapper {
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
    let usage = DEFAULT_USAGE;
    let output = '';
    const type = symbol.includes('Chat')
      ? BaserunType.Chat
      : BaserunType.Completion;
    if (error) {
      output = `Error: ${error}`;
    } else if (response) {
      usage = response.usage;
      if (type === BaserunType.Completion) {
        output =
          'error' in response
            ? `Error: ${response.error.message}`
            : response.choices[0]?.text ?? '';
      } else {
        output =
          'error' in response
            ? `Error: ${response.error.message}`
            : response.choices[0]?.message?.content ?? '';
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
      };
    }

    const { prompt = '', ...config } = args[0] ?? {};
    return {
      ...logEntry,
      prompt: { content: prompt },
      config,
    };
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  static async processResponse(response: any): Promise<any> {
    return await response.clone().json();
  }

  static init(log: (entry: Log) => void) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const module = require('openai-edge');
      const symbols = [
        'OpenAIApi.prototype.createCompletion',
        'OpenAIApi.prototype.createChatCompletion',
      ];
      patch(
        module,
        symbols,
        OpenAIEdgeWrapper.resolver,
        log,
        OpenAIEdgeWrapper.processResponse,
      );
    } catch (err) {
      /* openai-edge isn't used */
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