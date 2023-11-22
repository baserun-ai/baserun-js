import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  LLMChatLog,
  LLMCompletionLog,
  Message,
} from '../../types.js';
import { patch } from '../patch.js';
import { DEFAULT_USAGE } from '../constants.js';
import { modulesPromise, openai } from '../modules.js';
import getDebug from 'debug';

const debug = getDebug('baserun:openai');

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

  static resolver(
    symbol: string,
    args: any[],
    startTimestamp: Date,
    completionTimestamp: Date,
    isStream: boolean,
    response?: any,
    error?: any,
  ) {
    let usage = DEFAULT_USAGE;
    let output = '';
    const type = symbol.includes('Chat')
      ? BaserunType.Chat
      : BaserunType.Completion;

    let errorStack: string | undefined = undefined;

    const options = args[0] ?? {};

    if (error) {
      const maybeOpenAIError = error as NewOpenAIError;
      if (error.stack) {
        errorStack = error.stack;
      } else {
        if (maybeOpenAIError?.response?.error?.message) {
          output = `Error: ${maybeOpenAIError.response.error.message}`;
          errorStack = maybeOpenAIError.response.error.message;
        } else {
          errorStack = error;
        }
      }
    } else if (response) {
      usage = response.usage;
      if (type === BaserunType.Completion) {
        output = response.choices[0]?.text ?? '';
      } else {
        output = response.choices[0]?.message?.content ?? '';
      }
    }
    // todo: this is a bunch of duplicate code from the function above, this is something to clean up later, but it's also not
    // clear if we need to keep the support for the old OpenAI lib around
    if (type === BaserunType.Chat) {
      const { messages = [], tools, ...config } = options;

      return {
        choices: getChoiceMessages(response),
        config,
        logId: response?.id,
        stepType: BaserunStepType.AutoLLM,
        startTimestamp,
        completionTimestamp,
        type,
        provider: BaserunProvider.OpenAI,
        promptMessages: messages,
        usage: usage ?? DEFAULT_USAGE,
        isStream,
        errorStack,
        tools,
        toolChoice: config.tool_choice,
      } as LLMChatLog;
    }

    const { prompt = '', ...config } = options;
    return {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.OpenAI,
      output,
      startTimestamp,
      completionTimestamp,
      usage: usage ?? DEFAULT_USAGE,
      prompt: { content: prompt },
      choices: getChoiceMessages(response),
      config,
      isStream,
      errorStack,
    } as LLMCompletionLog;
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

  static patch(openaiModule: any, log: (entry: AutoLLMLog) => Promise<void>) {
    try {
      const symbols = [
        'OpenAI.Completions.prototype.create',
        'OpenAI.Chat.Completions.prototype.create',
      ];
      OpenAIWrapper.originalMethods = {
        createCompletion: openaiModule.Completions.prototype.create,
        createChatCompletion: openaiModule.Chat.Completions.prototype.create,
      };

      patch({
        module: openaiModule,
        symbols,
        resolver: OpenAIWrapper.resolver,
        log,
        isStreaming: OpenAIWrapper.isStreaming,
        collectStreamedResponse: OpenAIWrapper.collectStreamedResponse,
      });
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

  static async init(log: (entry: AutoLLMLog) => Promise<void>) {
    debug('patching openai', openai.length);
    await modulesPromise;
    for (const mod of openai) {
      debug('patching', mod);
      OpenAIWrapper.patch(mod, log);
    }
  }
}

export function getChoiceMessages(response: any): Message[] {
  if (!response || !response.choices) {
    return [];
  }

  return response.choices.map((c: any) => {
    const { finish_reason, message, text } = c;
    if (text) {
      return {
        content: text,
        finish_reason,
      };
    }
    return {
      finish_reason,
      ...message,
    };
  });
}
