import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  Message,
} from '../../types.js';
import { DEFAULT_USAGE } from '../constants.js';
import { patch } from '../patch.js';
import { anthropic, modulesPromise } from '../modules.js';
import Anthropic from '@anthropic-ai/sdk';

interface MessageWithUsage extends Message {
  output_tokens: number;
  input_tokens: number;
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

  static async resolve_messages_stream(
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
    if (_symbol.endsWith('stream')) {
      return await AnthropicWrapper.resolve_messages_stream(
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
    // treating Anthropic.Messages.prototype.stream as non-streaming here as we can't return correct value
    //  from the patched function with the code in path.ts otherwise
    return !!args[0].stream;
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

  static collectMessagesStreamResponse(
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

  static patch(mod: any, log: (entry: AutoLLMLog) => Promise<void>) {
    try {
      const symbols = [
        'Anthropic.Completions.prototype.create',
        'Anthropic.Messages.prototype.create',
      ];
      patch({
        module: mod,
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
