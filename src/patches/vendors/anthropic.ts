import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Message,
} from '../../types.js';
import { DEFAULT_USAGE } from '../constants.js';
import { handleTemplates, patch } from '../patch.js';
import { anthropic, modulesPromise } from '../modules.js';
import { TemplateMessage } from '../../templates.js';
import Anthropic from '@anthropic-ai/sdk';

import { getTimestamp } from '../../utils/helpers.js';
import { track } from '../../utils/track.js';
import { Stream } from '@anthropic-ai/sdk/streaming';

interface MessageWithUsage extends Message {
  output_tokens: number;
  input_tokens: number;
}

function getStreamClass(
  patchedObject: Anthropic.Messages,
  log: (entry: AutoLLMLog) => Promise<void>,
  startTime: Date,
  args: any[],
  templateId: string | undefined,
) {
  class StreamWrapper<Item> extends Stream<Item> {
    static fromSSEResponse<Item>(
      response: any,
      controller: AbortController,
    ): StreamWrapper<Item> {
      const stream = super.fromSSEResponse(response, controller);
      return new StreamWrapper((stream as any).iterator, stream.controller);
    }

    [Symbol.asyncIterator](): AsyncIterator<Item> {
      const originalIterator = super[Symbol.asyncIterator]();

      let response: MessageWithUsage | null = null;

      return {
        next: async (...argsi): Promise<IteratorResult<Item>> => {
          const result = await originalIterator.next(...argsi);
          if (!result.done) {
            response = AnthropicWrapper.collectMessagesCreateStreamedResponse(
              response,
              result.value as Anthropic.MessageStreamEvent,
            );
          } else {
            const endTime = getTimestamp();
            const logEntry = await AnthropicWrapper.resolver(
              'Anthropic.Messages.prototype.create',
              patchedObject,
              args,
              startTime,
              endTime,
              true,
              response,
              undefined,
            );
            logEntry.templateId = templateId;
            await track(() => log(logEntry), 'patch: log');
          }
          return result;
        },
      };
    }
  }

  return StreamWrapper;
}

export class AnthropicWrapper {
  static async resolve_completions(
    _symbol: string,
    _patchedObject: any,
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

  static async resolve_messages_create(
    _symbol: string,
    _patchedObject: any,
    args: [
      body: Anthropic.MessageCreateParams,
      options?: Anthropic.RequestOptions,
    ],
    startTimestamp: Date,
    completionTimestamp: Date,
    isStream: boolean,
    response?: Anthropic.Message | MessageWithUsage,
    error?: any,
  ) {
    const [body] = args;
    const type = BaserunType.Chat;
    const config = {
      model: body.model,
      top_p: body.top_p,
      top_k: body.top_k,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      stream: isStream,
    };
    const promptMessages: Message[] =
      AnthropicWrapper.anthropicMessagesToMessages(body.messages);

    let choices: Message[] | undefined;
    let usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    } = DEFAULT_USAGE;
    if (response) {
      if (isStream) {
        response = response as MessageWithUsage;
        choices = [response];
        usage = {
          prompt_tokens: response.input_tokens,
          completion_tokens: response.output_tokens,
          total_tokens: response.input_tokens + response.output_tokens,
        };
      } else {
        response = response as Anthropic.Message;
        choices = AnthropicWrapper.anthropicMessagesToMessages([response]);
        usage = {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens:
            response.usage.input_tokens + response.usage.output_tokens,
        };
      }
    }

    if (error) {
      const errorMessage = error?.stack ?? error?.toString() ?? '';
      return {
        stepType: BaserunStepType.AutoLLM,
        type,
        provider: BaserunProvider.Anthropic,
        startTimestamp,
        completionTimestamp,
        usage,
        promptMessages,
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
      usage,
      promptMessages,
      choices,
      config,
      isStream,
    } as AutoLLMLog;
  }

  static async resolver(
    _symbol: string,
    _patchedObject: any,
    args: any[],
    startTimestamp: Date,
    completionTimestamp: Date,
    isStream: boolean,
    response?: any,
    error?: any,
  ) {
    if (_symbol == 'Anthropic.Completions.prototype.create') {
      return await AnthropicWrapper.resolve_completions(
        _symbol,
        _patchedObject,
        args,
        startTimestamp,
        completionTimestamp,
        isStream,
        response,
        error,
      );
    }
    return await AnthropicWrapper.resolve_messages_create(
      _symbol,
      _patchedObject,
      args as [Anthropic.MessageCreateParams, Anthropic.RequestOptions],
      startTimestamp,
      completionTimestamp,
      isStream,
      response,
      error,
    );
  }

  static isStreaming(_symbol: string, args: any[]): boolean {
    return !!args[0].stream;
  }

  static getMessages(args: any[]): TemplateMessage[] {
    return args[0].messages;
  }

  static preprocessArgs(
    args: any[],
  ): [Anthropic.MessageCreateParams, Anthropic.RequestOptions?] {
    args[0].messages.forEach((msg: any) => {
      delete msg['baserunFormatMetadata'];
    });
    return args as [Anthropic.MessageCreateParams, Anthropic.RequestOptions?];
  }

  static collectCompletionStreamedResponse(
    response: Anthropic.Completion | null,
    chunk: Anthropic.Completion,
  ): Anthropic.Completion {
    if (!response) {
      return chunk;
    }

    response.completion += chunk.completion;
    return response;
  }

  static collectMessagesCreateStreamedResponse(
    response: MessageWithUsage | null,
    chunk: Anthropic.MessageStreamEvent,
  ): MessageWithUsage {
    if (!response) {
      if (chunk.type != 'message_start') {
        throw new Error('wrong order of chunks');
      }
      return {
        output_tokens: 0,
        input_tokens: chunk.message.usage.input_tokens,
        role: chunk.message.role,
        finish_reason: '',
        content: '',
      };
    }

    if (
      chunk.type == 'content_block_delta' &&
      chunk.delta.type == 'text_delta'
    ) {
      response.content += chunk.delta.text;
    }

    if (chunk.type == 'message_delta') {
      response.output_tokens += chunk.usage.output_tokens;
      response.finish_reason =
        chunk.delta.stop_reason || response.finish_reason;
    }
    return response;
  }

  static collectStreamedResponse(
    _symbol: string,
    response: Anthropic.Completion | MessageWithUsage,
    chunk: Anthropic.Completion | Anthropic.MessageStreamEvent,
  ): Anthropic.Completion | MessageWithUsage {
    if (chunk.type == 'completion') {
      return AnthropicWrapper.collectCompletionStreamedResponse(
        response as Anthropic.Completion | null,
        chunk,
      );
    }

    return AnthropicWrapper.collectMessagesCreateStreamedResponse(
      response as MessageWithUsage | null,
      chunk,
    );
  }

  static anthropicMessagesToMessages(
    messages: {
      content: string | Array<Anthropic.TextBlock | Anthropic.ImageBlockParam>;
      role: string;
      stop_reason?: string | null;
    }[],
  ) {
    return messages.map((v) => ({
      role: v.role,
      finish_reason: v.stop_reason ?? '',
      content:
        typeof v.content == 'string'
          ? v.content
          : v.content
              .map((vv) => 'text' in vv && vv.text)
              .filter((vv) => vv)
              .join(''),
    }));
  }

  static async init(log: (entry: AutoLLMLog) => Promise<void>) {
    await modulesPromise;
    for (const mod of anthropic) {
      AnthropicWrapper.patch(mod, log);
    }
  }

  static messagesCreateWrapper(
    original: (
      ...args: [Anthropic.MessageCreateParams, Anthropic.RequestOptions?]
    ) => any,
    log: (log: AutoLLMLog) => Promise<void>,
  ) {
    return async function (
      this: Anthropic.Messages,
      ...args: [Anthropic.MessageCreateParams, Anthropic.RequestOptions?]
    ) {
      /* eslint-disable-next-line  @typescript-eslint/no-this-alias */
      const patchedObject = this;
      const startTime = getTimestamp();
      const [body, options] = args;
      let response = null;
      let error = null;

      const boundOriginal = original.bind(this);

      const templateId = await handleTemplates(
        AnthropicWrapper.getMessages(args),
      );
      args = AnthropicWrapper.preprocessArgs(args);

      if (body.stream) {
        if (options?.__streamClass) {
          throw new Error('cannot use __streamClass option when using baserun');
        }
        const newOptions = {
          ...options,
          __streamClass: getStreamClass(
            patchedObject,
            log,
            startTime,
            args,
            templateId,
          ),
        };
        try {
          response = await boundOriginal(body, newOptions);
          return response;
        } catch (e) {
          const endTime = getTimestamp();
          const logEntry = await AnthropicWrapper.resolver(
            'Anthropic.Messages.prototype.create',
            patchedObject,
            args,
            startTime,
            endTime,
            true,
            undefined,
            e,
          );
          logEntry.templateId = templateId;
          await track(() => log(logEntry), 'patch: log');
          throw e;
        }
      } else {
        try {
          response = await boundOriginal(...args);
          return response;
        } catch (e) {
          error = e;
          throw e;
        } finally {
          const endTime = getTimestamp();
          const logEntry = await AnthropicWrapper.resolver(
            'Anthropic.Messages.prototype.create',
            patchedObject,
            args,
            startTime,
            endTime,
            false,
            response,
            error,
          );
          logEntry.templateId = templateId;
          await track(() => log(logEntry), 'patch: log');
        }
      }
    };
  }

  static patch(mod: any, log: (entry: AutoLLMLog) => Promise<void>) {
    try {
      const symbols = ['Anthropic.Completions.prototype.create'];
      patch({
        module: mod,
        symbols,
        resolver: AnthropicWrapper.resolver,
        log,
        isStreaming: AnthropicWrapper.isStreaming,
        collectStreamedResponse: AnthropicWrapper.collectStreamedResponse,
        getMessages: () => [], // prompt doesn't match templates format anyway
      });
      mod.Messages.prototype.create = AnthropicWrapper.messagesCreateWrapper(
        mod.Messages.prototype.create,
        log,
      );
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
