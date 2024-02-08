import {
  AutoLLMLog,
  BaserunStepType,
  BaserunType,
  LLMChatLog,
  Log,
  StandardLog,
} from '../types.js';
import { Message, Span, Log as ProtoLog } from '../v1/gen/baserun.js';
import { Timestamp } from '../v1/gen/google/protobuf/timestamp.js';

export function logToSpanOrLog(log: Log, runId: string): Span | ProtoLog {
  const { stepType } = log;

  if (stepType === BaserunStepType.AutoLLM) {
    return autoLLMLogToSpan(log, runId);
  } else if (stepType === BaserunStepType.Log) {
    return standardLogToSpan(log, runId);
  }

  // this should never happen. just adding it because for whatever reason TypeScript can't handle this
  throw new Error('Unknown step type');
}

export function standardLogToSpan(log: StandardLog, runId: string): ProtoLog {
  const { name, timestamp } = log;

  return {
    name,
    runId,
    timestamp: Timestamp.fromDate(new Date(timestamp * 1000)), // todo: double check if * 1000 is still needed
    payload: JSON.stringify(log.payload),
  };
}

export function autoLLMLogToSpan(log: AutoLLMLog, runId: string): Span {
  const { model, top_p, temperature, stream } = getModelConfig(log);
  const user = (log.config as any).user;

  if (log.errorStack) {
    return {
      name: `baserun.${log.provider}.${log.type}`,
      runId,
      errorStacktrace: log.errorStack,
      model,
      requestType: log.type,
      vendor: log.provider,
      startTime: Timestamp.fromDate(log.startTimestamp),
      endTime: Timestamp.fromDate(log.completionTimestamp),
      completions: [],
      completionTokens: 0,
      promptMessages: [],
      promptTokens: 0,
      spanId: BigInt(0),
      stop: [],
      totalTokens: 0,
      traceId: Uint8Array.from([]),
      user: user,
    };
  }

  const span: Span = {
    name: `baserun.${log.provider}.${log.type}`,
    runId,
    model,
    requestType: log.type,
    vendor: log.provider,
    startTime: Timestamp.fromDate(log.startTimestamp),
    endTime: Timestamp.fromDate(log.completionTimestamp),
    completions: [],
    promptMessages: [],
    spanId: BigInt(0),
    stop: [],
    completionTokens: log.usage?.completion_tokens ?? 0,
    totalTokens: log.usage?.total_tokens ?? 0,
    promptTokens: log.usage?.prompt_tokens ?? 0,
    traceId: Uint8Array.from([]),
    topP: top_p,
    temperature,
    stream,
    user: user,
  };

  // the main difference between a chat.completion and just completion is, that a chat completion can have multiple prompts (messages)
  if (isLLMChatLog(log)) {
    const { promptMessages, toolChoice, tools } = log;

    if (toolChoice) {
      span.toolChoice = JSON.stringify(toolChoice);
    }

    if (tools) {
      span.tools = JSON.stringify(tools);
    }

    const mappedMessages = promptMessages.map(
      ({ content, finish_reason, tool_calls, role }) => {
        const message: Message = {
          content,
          finishReason: finish_reason,
          role,
          functionCall: '',
          name: '',
          systemFingerprint: '',
          toolCallId: '',
          toolCalls: [],
        };

        if (tool_calls) {
          message.toolCalls = tool_calls.map((t) => ({
            id: t.id,
            type: t.type,
            function: {
              name: t.function.name,
              arguments: t.function.arguments,
            },
          }));
        }

        return message;
      },
    );

    span.promptMessages = mappedMessages;
  } else {
    const { prompt } = log;

    // todo: we need to make some fields optional in the proto because they are not always present
    const message: Message = {
      content: prompt.content,
      finishReason: '',
      functionCall: '',
      name: '',
      role: '',
      systemFingerprint: '',
      toolCallId: '',
      toolCalls: [],
    };
    span.promptMessages = [message];
  }

  if (log.choices) {
    const completions = log.choices.map(
      ({ content, finish_reason, tool_calls, role }) => {
        const message: Message = {
          content,
          finishReason: finish_reason,
          role,
          functionCall: '',
          name: '',
          systemFingerprint: '',
          toolCallId: '',
          toolCalls: [],
        };

        if (tool_calls) {
          message.toolCalls = tool_calls.map((t) => ({
            id: t.id,
            type: t.type,
            function: {
              name: t.function.name,
              arguments: t.function.arguments,
            },
          }));
        }

        return message;
      },
    );

    span.completions = completions;
  }

  return span;
}

type ModelConfig = {
  model: string;
  top_p?: number;
  stream?: boolean;
  temperature?: number;
};

function getModelConfig(log: AutoLLMLog): ModelConfig {
  const { config } = log;

  return config as ModelConfig;
}

function isLLMChatLog(log: AutoLLMLog): log is LLMChatLog {
  return log.type === BaserunType.Chat;
}
