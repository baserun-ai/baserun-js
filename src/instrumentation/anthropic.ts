import {
  InstrumentationConfig,
  InstrumentationNodeModuleDefinition,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { Span } from '@opentelemetry/api';

import type * as anthropic from '@anthropic-ai/sdk';
import { BaserunInstrumentor } from './base_instrumentor';
import { ANTHROPIC_VENDOR_NAME, SpanAttributeName } from './span_attributes';
import { wrapMethod } from './wrapper';
import { BaserunType } from '../types';
import { setAttributeIfExists } from './helpers';

export class AnthropicInstrumentor extends BaserunInstrumentor {
  constructor(config: InstrumentationConfig = {}) {
    super('Anthropic', '1.3.9', config);
  }

  setRequestAttributes(
    type: BaserunType.Completion,
    span: Span,
    args: Parameters<typeof anthropic.Anthropic.Completions.prototype.create>,
  ) {
    const config = args[0];

    span.setAttribute(SpanAttributeName.LLM_VENDOR, ANTHROPIC_VENDOR_NAME);
    span.setAttribute(SpanAttributeName.LLM_REQUEST_MODEL, config.model);
    span.setAttribute(
      `${SpanAttributeName.LLM_PROMPTS}.0.content`,
      config.prompt,
    );

    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_TEMPERATURE,
      config.temperature,
    );
    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_REQUEST_MAX_TOKENS,
      config.max_tokens_to_sample,
    );
    setAttributeIfExists(span, SpanAttributeName.LLM_TOP_P, config.top_p);
    setAttributeIfExists(span, SpanAttributeName.LLM_TOP_K, config.top_k);
    setAttributeIfExists(span, SpanAttributeName.LLM_STREAM, config.stream);

    // TODO (Adam) why is this have chat in the name????
    setAttributeIfExists(
      span,
      SpanAttributeName.LLM_CHAT_STOP_SEQUENCES,
      config.stop_sequences,
    );
  }

  setResponseAttributes(
    type: BaserunType.Completion,
    span: Span,
    response: anthropic.Anthropic.Completions.Completion,
  ) {
    switch (type) {
      case BaserunType.Completion: {
        const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.0`;
        span.setAttribute(`${prefix}.finish_reason`, response.stop_reason);
        if (response.completion) {
          span.setAttribute(`${prefix}.content`, response.completion);
        }
        break;
      }
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
    return;
  }

  init() {
    return new InstrumentationNodeModuleDefinition<typeof anthropic>(
      '@anthropic-ai/sdk',
      ['>=0.5.0'],
      this._onPatch.bind(this),
      this._onUnPatch.bind(this),
    );
  }

  private _onPatch(moduleExports: typeof anthropic): typeof anthropic {
    if (isWrapped(moduleExports.Anthropic.Completions.prototype.create)) {
      this._unwrap(moduleExports.Anthropic.Completions.prototype, 'create');
    }
    this._wrap(
      moduleExports.Anthropic.Completions.prototype,
      'create',
      this._patchCompletion(),
    );

    return moduleExports;
  }

  private _onUnPatch(moduleExports: typeof anthropic): void {
    this._unwrap(moduleExports.Anthropic.Completions.prototype, 'create');
  }

  private _patchCompletion(): (
    original: typeof anthropic.Anthropic.Completions.prototype.create,
  ) => any {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const instrumentor = this;
    return (
      original: typeof anthropic.Anthropic.Completions.prototype.create,
    ) => {
      return async function makePatchedCreate(
        this: typeof anthropic.Anthropic.Completions,
        ...originalArgs: Parameters<
          typeof anthropic.Anthropic.Completions.prototype.create
        >
      ) {
        let content = '';
        return wrapMethod(instrumentor, {
          name: 'anthropic.completion',
          original,
          originalThis: this,
          originalArgs,
          processStreamChunk: (
            span: Span,
            chunk: anthropic.Anthropic.Completions.Completion,
          ) => {
            // Currently we only support one choice in streaming responses
            const prefix = `${SpanAttributeName.LLM_COMPLETIONS}.0`;
            const newText = chunk.completion;
            if (newText) {
              content += newText;
            }

            if (chunk.stop_reason) {
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
