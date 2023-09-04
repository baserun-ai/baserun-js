import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Log,
} from '../types';
import { patch } from './patch';
import { DEFAULT_USAGE } from './constants';
import { loadModule } from '../loader';

interface OldOpenAIError {
  response?: { data?: { error?: { message?: string } } };
}

interface NewOpenAIError {
  response?: { error?: { message?: string } };
}

export class OpenAIWrapper {
  static originalMethods: {
    createCompletion: (config: any) => any;
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
    args: any[],
    startTime: number,
    endTime: number,
    response?: any,
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
    args: any[],
    startTime: number,
    endTime: number,
    response?: any,
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

  static isStreaming(_symbol: string, args: any[]): boolean {
    return args[0].stream;
  }

  static collectStreamedResponse(
    symbol: string,
    response: any,
    chunk: any,
  ): any {
    if (symbol.includes('Chat')) {
      if (response === null) {
        response = {
          id: chunk.id,
          object: 'chat.completion',
          created: chunk.created,
          model: chunk.model,
          choices: [],
          usage: DEFAULT_USAGE,
        };
      }

      const newChoices = chunk.choices || [];

      for (const newChoice of newChoices) {
        const newIndex = newChoice.index || 0;
        const newDelta = newChoice.delta || {};
        const newContent = newDelta.content || '';
        const newRole = newDelta.role || 'assistant';
        const newName = newDelta.name || null;
        const newFunctionCall = newDelta.function_call || null;
        const newFinishReason = newChoice.finish_reason;

        const existingChoice = response.choices.find(
          (choice: any) => choice.index === newIndex,
        );

        if (existingChoice) {
          if (newContent) {
            if ('content' in existingChoice.message) {
              existingChoice.message.content += newContent;
            } else {
              existingChoice.message.content = newContent;
            }
          }

          if (newFunctionCall) {
            existingChoice.message.function_call = newFunctionCall;
          }

          if (newName) {
            existingChoice.name = newName;
          }

          existingChoice.finish_reason = newFinishReason;
        } else {
          const newChoiceObj: any = {
            index: newIndex,
            message: {
              role: newRole,
            },
            finish_reason: newFinishReason,
          };

          if (newContent) {
            newChoiceObj.message.content = newContent;
          }

          if (newFunctionCall) {
            newChoiceObj.message.function_call = newFunctionCall;
          }

          if (newName) {
            newChoiceObj.message.name = newName;
          }

          response.choices.push(newChoiceObj);
        }
      }

      return response;
    }

    if (response === null) {
      return chunk;
    }

    const newChoices = chunk.choices || [];

    for (const newChoice of newChoices) {
      const newIndex = newChoice.index || 0;
      const newText = newChoice.text || '';

      const existingChoice = response.choices.find(
        (choice: any) => choice.index === newIndex,
      );
      if (existingChoice) {
        existingChoice.text += newText;
      } else {
        response.choices.push(newChoice);
      }
    }

    return response;
  }

  static init(log: (entry: Log) => void) {
    try {
      const openaiModule = loadModule(module, 'openai');
      const isV4 = Boolean(openaiModule?.OpenAI?.Chat?.Completions);
      if (isV4) {
        const symbols = [
          'OpenAI.Completions.prototype.create',
          'OpenAI.Chat.Completions.prototype.create',
        ];
        const openai = new openaiModule({
          apiKey: process.env.OPENAI_API_KEY,
        });
        OpenAIWrapper.originalMethods = {
          createCompletion: openai.completions.create.bind(openai.completions),
          createChatCompletion: openai.chat.completions.create.bind(
            openai.chat.completions,
          ),
        };
        patch({
          module: openaiModule,
          symbols,
          resolver: OpenAIWrapper.newResolver,
          log,
          isStreaming: OpenAIWrapper.isStreaming,
          collectStreamedResponse: OpenAIWrapper.collectStreamedResponse,
        });
      } else {
        const symbols = [
          'OpenAIApi.prototype.createCompletion',
          'OpenAIApi.prototype.createChatCompletion',
        ];
        const configuration = new openaiModule.Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new openaiModule.OpenAIApi(configuration);
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
        patch({
          module: openaiModule,
          symbols,
          resolver: OpenAIWrapper.oldResolver,
          log,
          isStreaming: OpenAIWrapper.isStreaming,
          collectStreamedResponse: OpenAIWrapper.collectStreamedResponse,
        });
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
