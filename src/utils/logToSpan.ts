import {
  AutoLLMLog,
  BaserunStepType,
  BaserunType,
  LLMChatLog,
  LLMCompletionLog,
  Log,
  Message,
  StandardLog,
} from '../types.js';
import {
  Message as ProtoMessage,
  Span,
  Log as ProtoLog,
} from '../v1/gen/baserun.js';
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

function promptMessagesToProtoMessages(
  promptMessages: Message[],
): ProtoMessage[] {
  return promptMessages.map(({ content, finish_reason, tool_calls, role }) => {
    const message: ProtoMessage = {
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
  });
}

export function autoLLMLogToSpan(log: AutoLLMLog, runId: string): Span {
  const { model, top_p, top_k, max_tokens, temperature, stream } =
    getModelConfig(log);
  const user = (log.config as any).user;

  // let's fill all the fields we can, no matter if we had an error or not. no reason to discard all this information
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
    completionTokens: (log.usage as any)?.completion_tokens ?? 0,
    totalTokens: log.usage?.total_tokens ?? 0,
    promptTokens: log.usage?.prompt_tokens ?? 0,
    traceId: Uint8Array.from([]),
    topP: top_p,
    topK: top_k,
    maxTokens: max_tokens,
    temperature,
    stream,
    user: user,
    xRequestId: log.requestId,
    errorStacktrace: log.errorStack,
    templateId: log.templateId,
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

    span.promptMessages = promptMessagesToProtoMessages(promptMessages);
  } else if (isLLMCompletionLog(log)) {
    const { prompt } = log;

    // todo: we need to make some fields optional in the proto because they are not always present
    const message: ProtoMessage = {
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
  } else {
    // embeddings
    span.promptMessages = promptMessagesToProtoMessages(log.promptMessages);
  }

  if ('choices' in log && log.choices) {
    const completions = log.choices.map(
      ({ content, finish_reason, tool_calls, role }) => {
        const message: ProtoMessage = {
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
  top_k?: number;
  max_tokens?: number;
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

function isLLMCompletionLog(log: AutoLLMLog): log is LLMCompletionLog {
  return log.type === BaserunType.Completion;
}
