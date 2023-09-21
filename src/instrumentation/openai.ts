import {
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { Span } from '@opentelemetry/api';

import type * as openai from 'openai';
import { BaserunInstrumentor } from './base_instrumentor';
import { OPENAI_VENDOR_NAME, SpanAttributeName } from './span_attributes';
import { isDefined } from '../helpers';
import { wrapMethod } from './wrapper';
import { BaserunType } from '../types';
import { setAttributeIfExists } from './helpers';

interface RequestTypeMap {
  [BaserunType.Chat]: Parameters<
    typeof openai.OpenAI.Chat.Completions.prototype.create
  >;
  [BaserunType.Completion]: Parameters<
    typeof openai.OpenAI.Completions.prototype.create
  >;
}

interface ResponseTypeMap {
  [BaserunType.Chat]: openai.OpenAI.Chat.Completions.ChatCompletion;
  [BaserunType.Completion]: openai.OpenAI.Completions.Completion;
}

export class OpenAIInstrumentor extends BaserunInstrumentor {
  constructor(config: InstrumentationConfig = {}) {
    super('OpenAI', '1.3.9', config);
  }

  setRequestAttributes<T extends BaserunType>(
    type: T,
    span: Span,
    args: RequestTypeMap[T],
  ) {
    const config = args[0];

    span.setAttribute(SpanAttributeName.LLM_VENDOR, OPENAI_VENDOR_NAME);
    span.setAttribute(SpanAttributeName.LLM_REQUEST_MODEL, config.model);
    // TODO (Adam) weird things on the openai library
    // span.setAttribute(SpanAttributes.OPENAI_API_BASE, openai.api_base)
    // span.setAttribute(SpanAttributes.OPENAI_API_TYPE, openai.api_type)

    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_TEMPERATURE,
      config.temperature,
    );
    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_REQUEST_MAX_TOKENS,
      config.max_tokens,
    );
    setAttributeIfExists(span, SpanAttributeName.LLM_TOP_P, config.top_p);
    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_FREQUENCY_PENALTY,
      config.frequency_penalty,
    );
    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_PRESENCE_PENALTY,
      config.presence_penalty,
    );

    setAttributeIfExists(span, SpanAttributeName.LLM_N, config.n);
    setAttributeIfExists(span, SpanAttributeName.LLM_STREAM, config.stream);

    if (isDefined(config.stop)) {
      span.setAttribute(
        SpanAttributeName.LLM_CHAT_STOP_SEQUENCES,
        typeof config.stop === 'string' ? [config.stop] : config.stop,
      );
    }

    if (isDefined(config.logit_bias)) {
      setAttributeIfExists(
        span,
        SpanAttributeName.LLM_LOGIT_BIAS,
        JSON.stringify(config.logit_bias),
      );
    }

    setAttributeIfExists(span, SpanAttributeName.LLM_USER, config.user);

    switch (type) {
      case BaserunType.Chat: {
        const typedConfig = config as RequestTypeMap[BaserunType.Chat][0];
        if (isDefined(typedConfig.functions)) {
          span.setAttribute(
            SpanAttributeName.LLM_FUNCTIONS,
            JSON.stringify(typedConfig.functions),
          );
        }

        if (isDefined(typedConfig.function_call)) {
          span.setAttribute(
            SpanAttributeName.LLM_FUNCTION_CALL,
            JSON.stringify(typedConfig.function_call),
          );
        }

        const messages = typedConfig.messages;
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          const prefix = `${SpanAttributeName.LLM_PROMPTS}.${i}`;
          span.setAttribute(`${prefix}.role`, message.role);

          if (message.content) {
            span.setAttribute(`${prefix}.content`, message.content);
          }

          // TODO (Adam) name / function calls
        }
        break;
      }

      case BaserunType.Completion: {
        const typedConfig = config as RequestTypeMap[BaserunType.Completion][0];
        setAttributeIfExists(
          span,
          SpanAttributeName.LLM_LOGPROBS,
          typedConfig.logprobs,
        );
        setAttributeIfExists(
          span,
          SpanAttributeName.LLM_ECHO,
          typedConfig.echo,
        );
        setAttributeIfExists(
          span,
          SpanAttributeName.LLM_SUFFIX,
          typedConfig.suffix,
        );
        setAttributeIfExists(
          span,
          SpanAttributeName.LLM_BEST_OF,
          typedConfig.best_of,
        );

        if (typedConfig.prompt) {
          const prompts = Array.isArray(typedConfig.prompt)
            ? typedConfig.prompt
            : [typedConfig.prompt];
          for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            const prefix = `${SpanAttributeName.LLM_PROMPTS}.${i}`;
            if (prompt) {
              span.setAttribute(`${prefix}.content`, prompt);
            }
          }
        }
        break;
      }

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  setResponseAttributes<T extends BaserunType>(
    type: T,
    span: Span,
    response: ResponseTypeMap[T],
  ) {
    switch (type) {
      case BaserunType.Completion: {
        const typedResponse =
          response as ResponseTypeMap[BaserunType.Completion];
        const choices = typedResponse.choices;
        for (let i = 0; i < choices.length; i++) {
          const choice = choices[i];
          const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.${i}`;
          span.setAttribute(`${prefix}.finish_reason`, choice.finish_reason);
          const text = choice.text;
          if (text) {
            span.setAttribute(`${prefix}.content`, text);
          }
        }
        break;
      }
      case BaserunType.Chat: {
        const typedResponse = response as ResponseTypeMap[BaserunType.Chat];
        const choices = typedResponse.choices;
        for (let i = 0; i < choices.length; i++) {
          const choice = choices[i];
          const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.${i}`;
          span.setAttribute(`${prefix}.finish_reason`, choice.finish_reason);

          const message = choice.message;
          span.setAttribute(`${prefix}.role`, message.role);
          if (message.content) {
            span.setAttribute(`${prefix}.content`, message.content);
          }

          if (message.function_call) {
            span.setAttribute(
              `${prefix}.function_call`,
              JSON.stringify(message.function_call),
            );
          }
        }
        break;
      }
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    if (response.usage) {
      span.setAttribute(
        SpanAttributeName.LLM_USAGE_TOTAL_TOKENS,
        response.usage.total_tokens,
      );
      span.setAttribute(
        SpanAttributeName.LLM_USAGE_COMPLETION_TOKENS,
        response.usage.completion_tokens,
      );
      span.setAttribute(
        SpanAttributeName.LLM_USAGE_PROMPT_TOKENS,
        response.usage.prompt_tokens,
      );
    }
    return;
  }

  init() {
    return new InstrumentationNodeModuleDefinition<typeof openai>(
      'openai',
      ['4.*'],
      this._onPatch.bind(this),
      this._onUnPatch.bind(this),
    );
  }

  private _onPatch(moduleExports: typeof openai): typeof openai {
    if (isWrapped(moduleExports.OpenAI.Chat.Completions.prototype.create)) {
      this._unwrap(moduleExports.OpenAI.Chat.Completions.prototype, 'create');
    }
    this._wrap(
      moduleExports.OpenAI.Chat.Completions.prototype,
      'create',
      this._patchChatCompletion(),
    );

    if (isWrapped(moduleExports.OpenAI.Completions.prototype.create)) {
      this._unwrap(moduleExports.OpenAI.Completions.prototype, 'create');
    }
    this._wrap(
      moduleExports.OpenAI.Completions.prototype,
      'create',
      this._patchCompletion(),
    );

    return moduleExports;
  }

  private _onUnPatch(moduleExports: typeof openai): void {
    this._unwrap(moduleExports.OpenAI.Chat.Completions.prototype, 'create');
    this._unwrap(moduleExports.OpenAI.Completions.prototype, 'create');
  }

  private _patchChatCompletion(): (
    original: typeof openai.OpenAI.Chat.Completions.prototype.create,
  ) => any {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const instrumentor = this;
    return (
      original: typeof openai.OpenAI.Chat.Completions.prototype.create,
    ) => {
      return async function makePatchedCreate(
        this: typeof openai.OpenAI.Chat.Completions,
        ...originalArgs: Parameters<
          typeof openai.OpenAI.Chat.Completions.prototype.create
        >
      ) {
        let content = '';
        return wrapMethod(instrumentor, {
          name: 'openai.chat',
          original,
          originalThis: this,
          originalArgs,
          processStreamChunk: (
            span: Span,
            chunk: openai.OpenAI.Chat.ChatCompletionChunk,
          ) => {
            // Currently we only support one choice in streaming responses
            const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.0`;
            const role = chunk.choices[0].delta['role'];
            if (role) {
              span.setAttribute(`${prefix}.role`, role);
            }

            const newContent = chunk.choices[0].delta.content;
            if (newContent) {
              content += newContent;
            }

            if (chunk.choices[0].finish_reason) {
              span.setAttribute(`${prefix}.content`, content);
              return true;
            }

            return false;
          },
        });
      };
    };
  }

  private _patchCompletion(): (
    original: typeof openai.OpenAI.Completions.prototype.create,
  ) => any {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const instrumentor = this;
    return (original: typeof openai.OpenAI.Completions.prototype.create) => {
      return async function makePatchedCreate(
        this: typeof openai.OpenAI.Completions,
        ...originalArgs: Parameters<
          typeof openai.OpenAI.Completions.prototype.create
        >
      ) {
        let content = '';
        return wrapMethod(instrumentor, {
          name: 'openai.completion',
          original,
          originalThis: this,
          originalArgs,
          processStreamChunk: (
            span: Span,
            chunk: openai.OpenAI.Completions.Completion,
          ) => {
            // Currently we only support one choice in streaming responses
            const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.0`;
            const newText = chunk.choices[0].text;
            if (newText) {
              content += newText;
            }

            if (chunk.choices[0].finish_reason) {
              span.setAttribute(`${prefix}.content`, content);
              return true;
            }

            return false;
          },
        });
      };
    };
  }
}
