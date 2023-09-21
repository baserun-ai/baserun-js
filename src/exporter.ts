import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-node';
import { AttributeValue, SpanAttributes } from '@opentelemetry/api';
import { Message, Span, SubmitSpanRequest } from './v1/generated/baserun_pb';
import { SpanAttributeName } from './instrumentation/span_attributes';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { isDefined } from './helpers';
import { getOrCreateSubmissionService } from './grpc';
import { getCurrentRun } from './current_run';

enum SpanAttributeType {
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  StringArray = 'stringArray',
}

interface SpanAttributeTypeMap {
  [SpanAttributeType.Boolean]: boolean;
  [SpanAttributeType.Number]: number;
  [SpanAttributeType.String]: string;
  [SpanAttributeType.StringArray]: string[];
}

type AttributeSetter<T extends SpanAttributeType> = {
  method: (value: SpanAttributeTypeMap[T]) => Span;
  type: T;
  value: AttributeValue | undefined;
};

function setSpanAttribute(
  attributeSetter: AttributeSetter<SpanAttributeType.StringArray>,
): void;
function setSpanAttribute(
  attributeSetter: AttributeSetter<SpanAttributeType.String>,
): void;
function setSpanAttribute(
  attributeSetter: AttributeSetter<SpanAttributeType.Number>,
): void;
function setSpanAttribute(
  attributeSetter: AttributeSetter<SpanAttributeType.Boolean>,
): void;
function setSpanAttribute(attributeSetter: any): void {
  if (!isDefined(attributeSetter.value)) {
    return;
  }

  if (typeof attributeSetter.method !== 'function') {
    throw new Error(`Invalid method provided: ${attributeSetter.method}`);
  }

  switch (attributeSetter.type) {
    case SpanAttributeType.Boolean: {
      attributeSetter.method(Boolean(attributeSetter.value));
      break;
    }
    case SpanAttributeType.Number: {
      attributeSetter.method(Number(attributeSetter.value));
      break;
    }
    case SpanAttributeType.String: {
      attributeSetter.method(String(attributeSetter.value));
      break;
    }
    case SpanAttributeType.StringArray: {
      break;
    }
    default:
      throw new Error(`Invalid type provided: ${attributeSetter.type}`);
  }
}

function extractSpanAttributesPrefixDicts(
  attributes: SpanAttributes,
  prefix: string,
): Array<{ [key: string]: any }> {
  const result: { [index: number]: { [key: string]: any } } = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    const [indexAsString, field] = key.slice(prefix.length + 1).split('.');
    const index = parseInt(indexAsString, 10);
    if (!result[index]) {
      result[index] = {};
    }
    result[index][field] = value;
  }

  return Object.entries(result)
    .sort(([keyA], [keyB]) => parseInt(keyA, 10) - parseInt(keyB, 10))
    .map(([, value]) => value);
}

export class BaserunExporter implements SpanExporter {
  export(spans: ReadableSpan[]) {
    for (const otelSpan of spans) {
      if (
        otelSpan.name.startsWith('baserun.parent') ||
        !otelSpan.name.startsWith('baserun')
      ) {
        continue;
      }

      // const status = new Status()
      //   .setMessage(otelSpan.status.message ?? '')
      //   .setCode(otelSpan.status.code as unknown as StatusCode);
      const vendor = otelSpan.attributes[
        SpanAttributeName.LLM_VENDOR
      ] as string;
      const run = getCurrentRun();
      if (!run) {
        console.warn('Baserun run attribute not set, cannot submit run');
        break;
      }

      const span = new Span()
        .setRunId(run.getRunId())
        // TODO (Adam) Do I need to convert this bytes like we did in python?
        .setTraceId(otelSpan.spanContext().traceId)
        .setName(otelSpan.name)
        .setVendor(vendor);
      // TODO (Adam) why isn't this serializing correctly???
      // span.setSpanId(Number(otelSpan.spanContext().spanId));

      // TODO (Adam) why isn't this status serializing correctly???
      // span.setStatus(status);

      setSpanAttribute({
        method: span.setTotalTokens.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_USAGE_TOTAL_TOKENS],
      });
      setSpanAttribute({
        method: span.setCompletionTokens.bind(span),
        type: SpanAttributeType.Number,
        value:
          otelSpan.attributes[SpanAttributeName.LLM_USAGE_COMPLETION_TOKENS],
      });
      setSpanAttribute({
        method: span.setPromptTokens.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_USAGE_PROMPT_TOKENS],
      });
      setSpanAttribute({
        method: span.setModel.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_REQUEST_MODEL],
      });
      setSpanAttribute({
        method: span.setRequestType.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_REQUEST_TYPE],
      });

      const promptMessages: Message[] = extractSpanAttributesPrefixDicts(
        otelSpan.attributes,
        SpanAttributeName.LLM_PROMPTS,
      ).map((message) =>
        new Message()
          .setRole(message.role)
          .setContent(message.content)
          .setFunctionCall(message.function_call)
          .setFinishReason(message.finish_reason),
      );

      const completions: Message[] = extractSpanAttributesPrefixDicts(
        otelSpan.attributes,
        SpanAttributeName.LLM_COMPLETIONS,
      ).map((message) =>
        new Message()
          .setRole(message.role)
          .setContent(message.content)
          .setFunctionCall(message.function_call)
          .setFinishReason(message.finish_reason),
      );

      span.setPromptMessagesList(promptMessages);
      span.setCompletionsList(completions);
      span.setStartTime(
        Timestamp.fromDate(new Date(hrTimeToMilliseconds(otelSpan.startTime))),
      );
      span.setEndTime(
        Timestamp.fromDate(new Date(hrTimeToMilliseconds(otelSpan.endTime))),
      );

      setSpanAttribute({
        method: span.setLogId.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.ANTHROPIC_LOG_ID],
      });

      setSpanAttribute({
        method: span.setApiBase.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.OPENAI_API_BASE],
      });
      setSpanAttribute({
        method: span.setApiType.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.OPENAI_API_TYPE],
      });
      setSpanAttribute({
        method: span.setFunctions.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_FUNCTIONS],
      });
      setSpanAttribute({
        method: span.setFunctionCall.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_FUNCTION_CALL],
      });
      setSpanAttribute({
        method: span.setTemperature.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_TEMPERATURE],
      });
      setSpanAttribute({
        method: span.setTopP.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_TOP_P],
      });
      setSpanAttribute({
        method: span.setN.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_N],
      });
      setSpanAttribute({
        method: span.setStream.bind(span),
        type: SpanAttributeType.Boolean,
        value: otelSpan.attributes[SpanAttributeName.LLM_STREAM],
      });
      setSpanAttribute({
        method: span.setStopList.bind(span),
        type: SpanAttributeType.StringArray,
        value: otelSpan.attributes[SpanAttributeName.LLM_CHAT_STOP_SEQUENCES],
      });
      setSpanAttribute({
        method: span.setMaxTokens.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_REQUEST_MAX_TOKENS],
      });
      setSpanAttribute({
        method: span.setFrequencyPenalty.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_FREQUENCY_PENALTY],
      });
      setSpanAttribute({
        method: span.setPresencePenalty.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_PRESENCE_PENALTY],
      });
      setSpanAttribute({
        method: span.setLogitBias.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_LOGIT_BIAS],
      });
      setSpanAttribute({
        method: span.setLogprobs.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_LOGPROBS],
      });
      setSpanAttribute({
        method: span.setEcho.bind(span),
        type: SpanAttributeType.Boolean,
        value: otelSpan.attributes[SpanAttributeName.LLM_ECHO],
      });
      setSpanAttribute({
        method: span.setSuffix.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_SUFFIX],
      });
      setSpanAttribute({
        method: span.setBestOf.bind(span),
        type: SpanAttributeType.Number,
        value: otelSpan.attributes[SpanAttributeName.LLM_BEST_OF],
      });
      setSpanAttribute({
        method: span.setUser.bind(span),
        type: SpanAttributeType.String,
        value: otelSpan.attributes[SpanAttributeName.LLM_USER],
      });

      const spanRequest = new SubmitSpanRequest().setSpan(span).setRun(run);
      getOrCreateSubmissionService().submitSpan(
        spanRequest,
        (error, _response) => {
          if (error) {
            console.error('Failed to submit span to Baserun: ', error);
          }
        },
      );
    }
  }

  async shutdown() {
    // TODO (Adam)
    return Promise.resolve();
  }

  async forceFlush() {
    // TODO (Adam)
    return Promise.resolve();
  }
}
