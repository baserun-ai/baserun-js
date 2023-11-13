import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import {
  AutoLLMLog,
  BaserunStepType,
  BaserunType,
  LLMChatLog,
  Log,
  StandardLog,
} from './types';
import { Message, Span } from './v1/generated/baserun_pb';

export function logToSpan(log: Log, runId: string): Span {
  const { stepType } = log;

  if (stepType === BaserunStepType.AutoLLM) {
    return autoLLMLogToSpan(log, runId);
  } else if (stepType === BaserunStepType.Log) {
    return standardLogToSpan(log, runId);
  }

  // this should never happen. just adding it because for whatever reason TypeScript can't handle this
  throw new Error('Unknown step type');
}

export function standardLogToSpan(log: StandardLog, runId: string): Span {
  const { name, timestamp } = log;

  const span = new Span()
    .setRunId(runId)
    .setTraceId('') // todo: this is an otel concept, so we might have to change it
    .setName(name)
    .setStartTime(Timestamp.fromDate(new Date(timestamp * 1000))); // todo: check if * 1000 is correct

  return span;
}

export function autoLLMLogToSpan(log: AutoLLMLog, runId: string): Span {
  const { model, top_p, temperature, stream } = getModelConfig(log);

  const span = new Span()
    .setRunId(runId)
    .setName(`baserun.provider.requestType`)
    .setVendor(log.provider)
    .setTotalTokens(log.usage.total_tokens)
    .setCompletionTokens(log.usage.completion_tokens)
    .setPromptTokens(log.usage.prompt_tokens)
    .setModel(model)
    .setRequestType(log.type)
    .setStartTime(Timestamp.fromDate(new Date(log.startTimestamp * 1000))) // todo: check if * 1000 is correct
    .setEndTime(Timestamp.fromDate(new Date(log.completionTimestamp * 1000)));

  if (top_p) {
    span.setTopP(top_p);
  }

  if (temperature) {
    span.setTemperature(temperature);
  }

  if (stream) {
    span.setStream(stream);
  }

  // the main difference between a chat.completion and just completion is, that a chat completion can have multiple prompts (messages)
  if (isLLMChatLog(log)) {
    const { promptMessages } = log;

    const mappedMessages = promptMessages.map(
      ({ content, finish_reason, function_call, role }) =>
        new Message()
          .setContent(content)
          .setFinishReason(finish_reason)
          .setFunctionCall(function_call)
          .setRole(role),
    );

    span.setPromptMessagesList(mappedMessages);
  } else {
    const { prompt } = log;

    const message = new Message().setContent(prompt.content);
    span.setPromptMessagesList([message]);
  }

  const completionsList = log.choices.map(
    ({ content, finish_reason, function_call, role }) =>
      new Message()
        .setContent(content)
        .setFinishReason(finish_reason)
        .setFunctionCall(function_call)
        .setRole(role),
  );

  span.setCompletionsList(completionsList);

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
