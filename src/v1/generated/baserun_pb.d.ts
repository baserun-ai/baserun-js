// package: baserun.v1
// file: baserun.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';

export class Status extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): Status;
  getCode(): Status.StatusCode;
  setCode(value: Status.StatusCode): Status;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Status.AsObject;
  static toObject(includeInstance: boolean, msg: Status): Status.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Status,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Status;
  static deserializeBinaryFromReader(
    message: Status,
    reader: jspb.BinaryReader,
  ): Status;
}

export namespace Status {
  export type AsObject = {
    message: string;
    code: Status.StatusCode;
  };

  export enum StatusCode {
    STATUS_CODE_UNSPECIFIED = 0,
    STATUS_CODE_OK = 1,
    STATUS_CODE_ERROR = 2,
  }
}

export class ToolFunction extends jspb.Message {
  getName(): string;
  setName(value: string): ToolFunction;
  getArguments(): string;
  setArguments(value: string): ToolFunction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToolFunction.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ToolFunction,
  ): ToolFunction.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ToolFunction,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): ToolFunction;
  static deserializeBinaryFromReader(
    message: ToolFunction,
    reader: jspb.BinaryReader,
  ): ToolFunction;
}

export namespace ToolFunction {
  export type AsObject = {
    name: string;
    arguments: string;
  };
}

export class ToolCall extends jspb.Message {
  getId(): string;
  setId(value: string): ToolCall;
  getType(): string;
  setType(value: string): ToolCall;

  hasFunction(): boolean;
  clearFunction(): void;
  getFunction(): ToolFunction | undefined;
  setFunction(value?: ToolFunction): ToolCall;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToolCall.AsObject;
  static toObject(includeInstance: boolean, msg: ToolCall): ToolCall.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ToolCall,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): ToolCall;
  static deserializeBinaryFromReader(
    message: ToolCall,
    reader: jspb.BinaryReader,
  ): ToolCall;
}

export namespace ToolCall {
  export type AsObject = {
    id: string;
    type: string;
    pb_function?: ToolFunction.AsObject;
  };
}

export class Message extends jspb.Message {
  getRole(): string;
  setRole(value: string): Message;
  getContent(): string;
  setContent(value: string): Message;
  getFinishReason(): string;
  setFinishReason(value: string): Message;
  getFunctionCall(): string;
  setFunctionCall(value: string): Message;
  clearToolCallsList(): void;
  getToolCallsList(): Array<ToolCall>;
  setToolCallsList(value: Array<ToolCall>): Message;
  addToolCalls(value?: ToolCall, index?: number): ToolCall;
  getToolCallId(): string;
  setToolCallId(value: string): Message;
  getName(): string;
  setName(value: string): Message;
  getSystemFingerprint(): string;
  setSystemFingerprint(value: string): Message;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Message,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(
    message: Message,
    reader: jspb.BinaryReader,
  ): Message;
}

export namespace Message {
  export type AsObject = {
    role: string;
    content: string;
    finishReason: string;
    functionCall: string;
    toolCallsList: Array<ToolCall.AsObject>;
    toolCallId: string;
    name: string;
    systemFingerprint: string;
  };
}

export class Run extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): Run;
  getSuiteId(): string;
  setSuiteId(value: string): Run;
  getName(): string;
  setName(value: string): Run;
  clearInputsList(): void;
  getInputsList(): Array<string>;
  setInputsList(value: Array<string>): Run;
  addInputs(value: string, index?: number): string;
  getRunType(): Run.RunType;
  setRunType(value: Run.RunType): Run;
  getMetadata(): string;
  setMetadata(value: string): Run;

  hasStartTimestamp(): boolean;
  clearStartTimestamp(): void;
  getStartTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Run;

  hasCompletionTimestamp(): boolean;
  clearCompletionTimestamp(): void;
  getCompletionTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCompletionTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Run;
  getResult(): string;
  setResult(value: string): Run;
  getError(): string;
  setError(value: string): Run;
  getSessionId(): string;
  setSessionId(value: string): Run;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Run.AsObject;
  static toObject(includeInstance: boolean, msg: Run): Run.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(message: Run, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Run;
  static deserializeBinaryFromReader(
    message: Run,
    reader: jspb.BinaryReader,
  ): Run;
}

export namespace Run {
  export type AsObject = {
    runId: string;
    suiteId: string;
    name: string;
    inputsList: Array<string>;
    runType: Run.RunType;
    metadata: string;
    startTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    completionTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    result: string;
    error: string;
    sessionId: string;
  };

  export enum RunType {
    RUN_TYPE_TEST = 0,
    RUN_TYPE_PRODUCTION = 1,
  }
}

export class Log extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): Log;
  getName(): string;
  setName(value: string): Log;
  getPayload(): string;
  setPayload(value: string): Log;

  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Log;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Log.AsObject;
  static toObject(includeInstance: boolean, msg: Log): Log.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(message: Log, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Log;
  static deserializeBinaryFromReader(
    message: Log,
    reader: jspb.BinaryReader,
  ): Log;
}

export namespace Log {
  export type AsObject = {
    runId: string;
    name: string;
    payload: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class EndUser extends jspb.Message {
  getId(): string;
  setId(value: string): EndUser;
  getIdentifier(): string;
  setIdentifier(value: string): EndUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndUser.AsObject;
  static toObject(includeInstance: boolean, msg: EndUser): EndUser.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndUser,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndUser;
  static deserializeBinaryFromReader(
    message: EndUser,
    reader: jspb.BinaryReader,
  ): EndUser;
}

export namespace EndUser {
  export type AsObject = {
    id: string;
    identifier: string;
  };
}

export class Model extends jspb.Message {
  getId(): number;
  setId(value: number): Model;
  getModelName(): string;
  setModelName(value: string): Model;
  getProvider(): string;
  setProvider(value: string): Model;
  getName(): string;
  setName(value: string): Model;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Model.AsObject;
  static toObject(includeInstance: boolean, msg: Model): Model.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Model,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Model;
  static deserializeBinaryFromReader(
    message: Model,
    reader: jspb.BinaryReader,
  ): Model;
}

export namespace Model {
  export type AsObject = {
    id: number;
    modelName: string;
    provider: string;
    name: string;
  };
}

export class ModelConfig extends jspb.Message {
  getId(): number;
  setId(value: number): ModelConfig;
  getModelId(): number;
  setModelId(value: number): ModelConfig;

  hasModel(): boolean;
  clearModel(): void;
  getModel(): Model | undefined;
  setModel(value?: Model): ModelConfig;
  getLogitBias(): string;
  setLogitBias(value: string): ModelConfig;
  getPresencePenalty(): number;
  setPresencePenalty(value: number): ModelConfig;
  getFrequencyPenalty(): number;
  setFrequencyPenalty(value: number): ModelConfig;
  getTemperature(): number;
  setTemperature(value: number): ModelConfig;
  getTopP(): number;
  setTopP(value: number): ModelConfig;
  getTopK(): number;
  setTopK(value: number): ModelConfig;
  getFunctions(): string;
  setFunctions(value: string): ModelConfig;
  getFunctionCall(): string;
  setFunctionCall(value: string): ModelConfig;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ModelConfig.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ModelConfig,
  ): ModelConfig.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ModelConfig,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): ModelConfig;
  static deserializeBinaryFromReader(
    message: ModelConfig,
    reader: jspb.BinaryReader,
  ): ModelConfig;
}

export namespace ModelConfig {
  export type AsObject = {
    id: number;
    modelId: number;
    model?: Model.AsObject;
    logitBias: string;
    presencePenalty: number;
    frequencyPenalty: number;
    temperature: number;
    topP: number;
    topK: number;
    functions: string;
    functionCall: string;
  };
}

export class Span extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): Span;
  getTraceId(): Uint8Array | string;
  getTraceId_asU8(): Uint8Array;
  getTraceId_asB64(): string;
  setTraceId(value: Uint8Array | string): Span;
  getSpanId(): number;
  setSpanId(value: number): Span;
  getName(): string;
  setName(value: string): Span;

  hasStartTime(): boolean;
  clearStartTime(): void;
  getStartTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartTime(value?: google_protobuf_timestamp_pb.Timestamp): Span;

  hasEndTime(): boolean;
  clearEndTime(): void;
  getEndTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndTime(value?: google_protobuf_timestamp_pb.Timestamp): Span;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): Status | undefined;
  setStatus(value?: Status): Span;
  getVendor(): string;
  setVendor(value: string): Span;
  getRequestType(): string;
  setRequestType(value: string): Span;
  getModel(): string;
  setModel(value: string): Span;
  getTotalTokens(): number;
  setTotalTokens(value: number): Span;
  getCompletionTokens(): number;
  setCompletionTokens(value: number): Span;
  getPromptTokens(): number;
  setPromptTokens(value: number): Span;
  clearPromptMessagesList(): void;
  getPromptMessagesList(): Array<Message>;
  setPromptMessagesList(value: Array<Message>): Span;
  addPromptMessages(value?: Message, index?: number): Message;
  clearCompletionsList(): void;
  getCompletionsList(): Array<Message>;
  setCompletionsList(value: Array<Message>): Span;
  addCompletions(value?: Message, index?: number): Message;

  hasApiBase(): boolean;
  clearApiBase(): void;
  getApiBase(): string | undefined;
  setApiBase(value: string): Span;

  hasApiType(): boolean;
  clearApiType(): void;
  getApiType(): string | undefined;
  setApiType(value: string): Span;

  hasFunctions(): boolean;
  clearFunctions(): void;
  getFunctions(): string | undefined;
  setFunctions(value: string): Span;

  hasFunctionCall(): boolean;
  clearFunctionCall(): void;
  getFunctionCall(): string | undefined;
  setFunctionCall(value: string): Span;

  hasTemperature(): boolean;
  clearTemperature(): void;
  getTemperature(): number | undefined;
  setTemperature(value: number): Span;

  hasTopP(): boolean;
  clearTopP(): void;
  getTopP(): number | undefined;
  setTopP(value: number): Span;

  hasN(): boolean;
  clearN(): void;
  getN(): number | undefined;
  setN(value: number): Span;

  hasStream(): boolean;
  clearStream(): void;
  getStream(): boolean | undefined;
  setStream(value: boolean): Span;
  clearStopList(): void;
  getStopList(): Array<string>;
  setStopList(value: Array<string>): Span;
  addStop(value: string, index?: number): string;

  hasMaxTokens(): boolean;
  clearMaxTokens(): void;
  getMaxTokens(): number | undefined;
  setMaxTokens(value: number): Span;

  hasPresencePenalty(): boolean;
  clearPresencePenalty(): void;
  getPresencePenalty(): number | undefined;
  setPresencePenalty(value: number): Span;

  hasFrequencyPenalty(): boolean;
  clearFrequencyPenalty(): void;
  getFrequencyPenalty(): number | undefined;
  setFrequencyPenalty(value: number): Span;

  hasLogitBias(): boolean;
  clearLogitBias(): void;
  getLogitBias(): string | undefined;
  setLogitBias(value: string): Span;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): string | undefined;
  setUser(value: string): Span;

  hasLogprobs(): boolean;
  clearLogprobs(): void;
  getLogprobs(): number | undefined;
  setLogprobs(value: number): Span;

  hasEcho(): boolean;
  clearEcho(): void;
  getEcho(): boolean | undefined;
  setEcho(value: boolean): Span;

  hasSuffix(): boolean;
  clearSuffix(): void;
  getSuffix(): string | undefined;
  setSuffix(value: string): Span;

  hasBestOf(): boolean;
  clearBestOf(): void;
  getBestOf(): number | undefined;
  setBestOf(value: number): Span;

  hasLogId(): boolean;
  clearLogId(): void;
  getLogId(): string | undefined;
  setLogId(value: string): Span;

  hasTopK(): boolean;
  clearTopK(): void;
  getTopK(): number | undefined;
  setTopK(value: number): Span;

  hasEndUser(): boolean;
  clearEndUser(): void;
  getEndUser(): EndUser | undefined;
  setEndUser(value?: EndUser): Span;

  hasTemplateId(): boolean;
  clearTemplateId(): void;
  getTemplateId(): string | undefined;
  setTemplateId(value: string): Span;

  hasTemplateParameters(): boolean;
  clearTemplateParameters(): void;
  getTemplateParameters(): string | undefined;
  setTemplateParameters(value: string): Span;

  hasTools(): boolean;
  clearTools(): void;
  getTools(): string | undefined;
  setTools(value: string): Span;

  hasToolChoice(): boolean;
  clearToolChoice(): void;
  getToolChoice(): string | undefined;
  setToolChoice(value: string): Span;

  hasSeed(): boolean;
  clearSeed(): void;
  getSeed(): number | undefined;
  setSeed(value: number): Span;

  hasResponseFormat(): boolean;
  clearResponseFormat(): void;
  getResponseFormat(): string | undefined;
  setResponseFormat(value: string): Span;

  hasErrorStacktrace(): boolean;
  clearErrorStacktrace(): void;
  getErrorStacktrace(): string | undefined;
  setErrorStacktrace(value: string): Span;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Span.AsObject;
  static toObject(includeInstance: boolean, msg: Span): Span.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Span,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Span;
  static deserializeBinaryFromReader(
    message: Span,
    reader: jspb.BinaryReader,
  ): Span;
}

export namespace Span {
  export type AsObject = {
    runId: string;
    traceId: Uint8Array | string;
    spanId: number;
    name: string;
    startTime?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endTime?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    status?: Status.AsObject;
    vendor: string;
    requestType: string;
    model: string;
    totalTokens: number;
    completionTokens: number;
    promptTokens: number;
    promptMessagesList: Array<Message.AsObject>;
    completionsList: Array<Message.AsObject>;
    apiBase?: string;
    apiType?: string;
    functions?: string;
    functionCall?: string;
    temperature?: number;
    topP?: number;
    n?: number;
    stream?: boolean;
    stopList: Array<string>;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    logitBias?: string;
    user?: string;
    logprobs?: number;
    echo?: boolean;
    suffix?: string;
    bestOf?: number;
    logId?: string;
    topK?: number;
    endUser?: EndUser.AsObject;
    templateId?: string;
    templateParameters?: string;
    tools?: string;
    toolChoice?: string;
    seed?: number;
    responseFormat?: string;
    errorStacktrace?: string;
  };
}

export class Eval extends jspb.Message {
  getName(): string;
  setName(value: string): Eval;
  getType(): string;
  setType(value: string): Eval;
  getResult(): string;
  setResult(value: string): Eval;

  hasScore(): boolean;
  clearScore(): void;
  getScore(): number | undefined;
  setScore(value: number): Eval;
  getSubmission(): string;
  setSubmission(value: string): Eval;
  getPayload(): string;
  setPayload(value: string): Eval;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Eval.AsObject;
  static toObject(includeInstance: boolean, msg: Eval): Eval.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Eval,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Eval;
  static deserializeBinaryFromReader(
    message: Eval,
    reader: jspb.BinaryReader,
  ): Eval;
}

export namespace Eval {
  export type AsObject = {
    name: string;
    type: string;
    result: string;
    score?: number;
    submission: string;
    payload: string;
  };
}

export class TestSuite extends jspb.Message {
  getId(): string;
  setId(value: string): TestSuite;
  getName(): string;
  setName(value: string): TestSuite;

  hasStartTimestamp(): boolean;
  clearStartTimestamp(): void;
  getStartTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): TestSuite;

  hasCompletionTimestamp(): boolean;
  clearCompletionTimestamp(): void;
  getCompletionTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCompletionTimestamp(
    value?: google_protobuf_timestamp_pb.Timestamp,
  ): TestSuite;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TestSuite.AsObject;
  static toObject(includeInstance: boolean, msg: TestSuite): TestSuite.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TestSuite,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TestSuite;
  static deserializeBinaryFromReader(
    message: TestSuite,
    reader: jspb.BinaryReader,
  ): TestSuite;
}

export namespace TestSuite {
  export type AsObject = {
    id: string;
    name: string;
    startTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    completionTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class Template extends jspb.Message {
  getId(): string;
  setId(value: string): Template;
  getName(): string;
  setName(value: string): Template;
  getTemplateType(): Template.TemplateType;
  setTemplateType(value: Template.TemplateType): Template;
  clearTemplateVersionsList(): void;
  getTemplateVersionsList(): Array<TemplateVersion>;
  setTemplateVersionsList(value: Array<TemplateVersion>): Template;
  addTemplateVersions(value?: TemplateVersion, index?: number): TemplateVersion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Template.AsObject;
  static toObject(includeInstance: boolean, msg: Template): Template.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Template,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Template;
  static deserializeBinaryFromReader(
    message: Template,
    reader: jspb.BinaryReader,
  ): Template;
}

export namespace Template {
  export type AsObject = {
    id: string;
    name: string;
    templateType: Template.TemplateType;
    templateVersionsList: Array<TemplateVersion.AsObject>;
  };

  export enum TemplateType {
    TEMPLATE_TYPE_UNSPECIFIED = 0,
    TEMPLATE_TYPE_FORMATTED_STRING = 1,
    TEMPLATE_TYPE_JINJA2 = 2,
  }
}

export class TemplateVersion extends jspb.Message {
  getId(): string;
  setId(value: string): TemplateVersion;

  hasTemplate(): boolean;
  clearTemplate(): void;
  getTemplate(): Template | undefined;
  setTemplate(value?: Template): TemplateVersion;
  getTag(): string;
  setTag(value: string): TemplateVersion;
  getParameterDefinition(): string;
  setParameterDefinition(value: string): TemplateVersion;
  getTemplateString(): string;
  setTemplateString(value: string): TemplateVersion;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TemplateVersion.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: TemplateVersion,
  ): TemplateVersion.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: TemplateVersion,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): TemplateVersion;
  static deserializeBinaryFromReader(
    message: TemplateVersion,
    reader: jspb.BinaryReader,
  ): TemplateVersion;
}

export namespace TemplateVersion {
  export type AsObject = {
    id: string;
    template?: Template.AsObject;
    tag: string;
    parameterDefinition: string;
    templateString: string;
  };
}

export class Session extends jspb.Message {
  getId(): string;
  setId(value: string): Session;
  getIdentifier(): string;
  setIdentifier(value: string): Session;

  hasStartTimestamp(): boolean;
  clearStartTimestamp(): void;
  getStartTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Session;

  hasCompletionTimestamp(): boolean;
  clearCompletionTimestamp(): void;
  getCompletionTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCompletionTimestamp(
    value?: google_protobuf_timestamp_pb.Timestamp,
  ): Session;

  hasEndUser(): boolean;
  clearEndUser(): void;
  getEndUser(): EndUser | undefined;
  setEndUser(value?: EndUser): Session;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Session.AsObject;
  static toObject(includeInstance: boolean, msg: Session): Session.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Session,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Session;
  static deserializeBinaryFromReader(
    message: Session,
    reader: jspb.BinaryReader,
  ): Session;
}

export namespace Session {
  export type AsObject = {
    id: string;
    identifier: string;
    startTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    completionTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endUser?: EndUser.AsObject;
  };
}

export class StartRunRequest extends jspb.Message {
  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): StartRunRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartRunRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartRunRequest,
  ): StartRunRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartRunRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartRunRequest;
  static deserializeBinaryFromReader(
    message: StartRunRequest,
    reader: jspb.BinaryReader,
  ): StartRunRequest;
}

export namespace StartRunRequest {
  export type AsObject = {
    run?: Run.AsObject;
  };
}

export class StartRunResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): StartRunResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartRunResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartRunResponse,
  ): StartRunResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartRunResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartRunResponse;
  static deserializeBinaryFromReader(
    message: StartRunResponse,
    reader: jspb.BinaryReader,
  ): StartRunResponse;
}

export namespace StartRunResponse {
  export type AsObject = {
    message: string;
  };
}

export class SubmitLogRequest extends jspb.Message {
  hasLog(): boolean;
  clearLog(): void;
  getLog(): Log | undefined;
  setLog(value?: Log): SubmitLogRequest;

  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): SubmitLogRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitLogRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitLogRequest,
  ): SubmitLogRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitLogRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitLogRequest;
  static deserializeBinaryFromReader(
    message: SubmitLogRequest,
    reader: jspb.BinaryReader,
  ): SubmitLogRequest;
}

export namespace SubmitLogRequest {
  export type AsObject = {
    log?: Log.AsObject;
    run?: Run.AsObject;
  };
}

export class SubmitLogResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitLogResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitLogResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitLogResponse,
  ): SubmitLogResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitLogResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitLogResponse;
  static deserializeBinaryFromReader(
    message: SubmitLogResponse,
    reader: jspb.BinaryReader,
  ): SubmitLogResponse;
}

export namespace SubmitLogResponse {
  export type AsObject = {
    message: string;
  };
}

export class SubmitSpanRequest extends jspb.Message {
  hasSpan(): boolean;
  clearSpan(): void;
  getSpan(): Span | undefined;
  setSpan(value?: Span): SubmitSpanRequest;

  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): SubmitSpanRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitSpanRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitSpanRequest,
  ): SubmitSpanRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitSpanRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitSpanRequest;
  static deserializeBinaryFromReader(
    message: SubmitSpanRequest,
    reader: jspb.BinaryReader,
  ): SubmitSpanRequest;
}

export namespace SubmitSpanRequest {
  export type AsObject = {
    span?: Span.AsObject;
    run?: Run.AsObject;
  };
}

export class SubmitSpanResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitSpanResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitSpanResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitSpanResponse,
  ): SubmitSpanResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitSpanResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitSpanResponse;
  static deserializeBinaryFromReader(
    message: SubmitSpanResponse,
    reader: jspb.BinaryReader,
  ): SubmitSpanResponse;
}

export namespace SubmitSpanResponse {
  export type AsObject = {
    message: string;
  };
}

export class EndRunRequest extends jspb.Message {
  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): EndRunRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndRunRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndRunRequest,
  ): EndRunRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndRunRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndRunRequest;
  static deserializeBinaryFromReader(
    message: EndRunRequest,
    reader: jspb.BinaryReader,
  ): EndRunRequest;
}

export namespace EndRunRequest {
  export type AsObject = {
    run?: Run.AsObject;
  };
}

export class EndRunResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): EndRunResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndRunResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndRunResponse,
  ): EndRunResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndRunResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndRunResponse;
  static deserializeBinaryFromReader(
    message: EndRunResponse,
    reader: jspb.BinaryReader,
  ): EndRunResponse;
}

export namespace EndRunResponse {
  export type AsObject = {
    message: string;
  };
}

export class SubmitEvalRequest extends jspb.Message {
  hasEval(): boolean;
  clearEval(): void;
  getEval(): Eval | undefined;
  setEval(value?: Eval): SubmitEvalRequest;

  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): SubmitEvalRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitEvalRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitEvalRequest,
  ): SubmitEvalRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitEvalRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitEvalRequest;
  static deserializeBinaryFromReader(
    message: SubmitEvalRequest,
    reader: jspb.BinaryReader,
  ): SubmitEvalRequest;
}

export namespace SubmitEvalRequest {
  export type AsObject = {
    eval?: Eval.AsObject;
    run?: Run.AsObject;
  };
}

export class SubmitEvalResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitEvalResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitEvalResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitEvalResponse,
  ): SubmitEvalResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitEvalResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitEvalResponse;
  static deserializeBinaryFromReader(
    message: SubmitEvalResponse,
    reader: jspb.BinaryReader,
  ): SubmitEvalResponse;
}

export namespace SubmitEvalResponse {
  export type AsObject = {
    message: string;
  };
}

export class StartTestSuiteRequest extends jspb.Message {
  hasTestSuite(): boolean;
  clearTestSuite(): void;
  getTestSuite(): TestSuite | undefined;
  setTestSuite(value?: TestSuite): StartTestSuiteRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartTestSuiteRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartTestSuiteRequest,
  ): StartTestSuiteRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartTestSuiteRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartTestSuiteRequest;
  static deserializeBinaryFromReader(
    message: StartTestSuiteRequest,
    reader: jspb.BinaryReader,
  ): StartTestSuiteRequest;
}

export namespace StartTestSuiteRequest {
  export type AsObject = {
    testSuite?: TestSuite.AsObject;
  };
}

export class StartTestSuiteResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): StartTestSuiteResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartTestSuiteResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartTestSuiteResponse,
  ): StartTestSuiteResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartTestSuiteResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartTestSuiteResponse;
  static deserializeBinaryFromReader(
    message: StartTestSuiteResponse,
    reader: jspb.BinaryReader,
  ): StartTestSuiteResponse;
}

export namespace StartTestSuiteResponse {
  export type AsObject = {
    message: string;
  };
}

export class EndTestSuiteRequest extends jspb.Message {
  hasTestSuite(): boolean;
  clearTestSuite(): void;
  getTestSuite(): TestSuite | undefined;
  setTestSuite(value?: TestSuite): EndTestSuiteRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndTestSuiteRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndTestSuiteRequest,
  ): EndTestSuiteRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndTestSuiteRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndTestSuiteRequest;
  static deserializeBinaryFromReader(
    message: EndTestSuiteRequest,
    reader: jspb.BinaryReader,
  ): EndTestSuiteRequest;
}

export namespace EndTestSuiteRequest {
  export type AsObject = {
    testSuite?: TestSuite.AsObject;
  };
}

export class EndTestSuiteResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): EndTestSuiteResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndTestSuiteResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndTestSuiteResponse,
  ): EndTestSuiteResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndTestSuiteResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndTestSuiteResponse;
  static deserializeBinaryFromReader(
    message: EndTestSuiteResponse,
    reader: jspb.BinaryReader,
  ): EndTestSuiteResponse;
}

export namespace EndTestSuiteResponse {
  export type AsObject = {
    message: string;
  };
}

export class StartSessionRequest extends jspb.Message {
  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): StartSessionRequest;

  hasRun(): boolean;
  clearRun(): void;
  getRun(): Run | undefined;
  setRun(value?: Run): StartSessionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartSessionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartSessionRequest,
  ): StartSessionRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartSessionRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartSessionRequest;
  static deserializeBinaryFromReader(
    message: StartSessionRequest,
    reader: jspb.BinaryReader,
  ): StartSessionRequest;
}

export namespace StartSessionRequest {
  export type AsObject = {
    session?: Session.AsObject;
    run?: Run.AsObject;
  };
}

export class StartSessionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): StartSessionResponse;

  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): StartSessionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartSessionResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: StartSessionResponse,
  ): StartSessionResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: StartSessionResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): StartSessionResponse;
  static deserializeBinaryFromReader(
    message: StartSessionResponse,
    reader: jspb.BinaryReader,
  ): StartSessionResponse;
}

export namespace StartSessionResponse {
  export type AsObject = {
    message: string;
    session?: Session.AsObject;
  };
}

export class EndSessionRequest extends jspb.Message {
  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): EndSessionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndSessionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndSessionRequest,
  ): EndSessionRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndSessionRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndSessionRequest;
  static deserializeBinaryFromReader(
    message: EndSessionRequest,
    reader: jspb.BinaryReader,
  ): EndSessionRequest;
}

export namespace EndSessionRequest {
  export type AsObject = {
    session?: Session.AsObject;
  };
}

export class EndSessionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): EndSessionResponse;

  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): EndSessionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EndSessionResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EndSessionResponse,
  ): EndSessionResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EndSessionResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): EndSessionResponse;
  static deserializeBinaryFromReader(
    message: EndSessionResponse,
    reader: jspb.BinaryReader,
  ): EndSessionResponse;
}

export namespace EndSessionResponse {
  export type AsObject = {
    message: string;
    session?: Session.AsObject;
  };
}

export class SubmitTemplateVersionRequest extends jspb.Message {
  hasTemplateVersion(): boolean;
  clearTemplateVersion(): void;
  getTemplateVersion(): TemplateVersion | undefined;
  setTemplateVersion(value?: TemplateVersion): SubmitTemplateVersionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitTemplateVersionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitTemplateVersionRequest,
  ): SubmitTemplateVersionRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitTemplateVersionRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitTemplateVersionRequest;
  static deserializeBinaryFromReader(
    message: SubmitTemplateVersionRequest,
    reader: jspb.BinaryReader,
  ): SubmitTemplateVersionRequest;
}

export namespace SubmitTemplateVersionRequest {
  export type AsObject = {
    templateVersion?: TemplateVersion.AsObject;
  };
}

export class SubmitTemplateVersionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitTemplateVersionResponse;

  hasTemplateVersion(): boolean;
  clearTemplateVersion(): void;
  getTemplateVersion(): TemplateVersion | undefined;
  setTemplateVersion(value?: TemplateVersion): SubmitTemplateVersionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitTemplateVersionResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitTemplateVersionResponse,
  ): SubmitTemplateVersionResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitTemplateVersionResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitTemplateVersionResponse;
  static deserializeBinaryFromReader(
    message: SubmitTemplateVersionResponse,
    reader: jspb.BinaryReader,
  ): SubmitTemplateVersionResponse;
}

export namespace SubmitTemplateVersionResponse {
  export type AsObject = {
    message: string;
    templateVersion?: TemplateVersion.AsObject;
  };
}

export class SubmitModelConfigRequest extends jspb.Message {
  hasModelConfig(): boolean;
  clearModelConfig(): void;
  getModelConfig(): ModelConfig | undefined;
  setModelConfig(value?: ModelConfig): SubmitModelConfigRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitModelConfigRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitModelConfigRequest,
  ): SubmitModelConfigRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitModelConfigRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitModelConfigRequest;
  static deserializeBinaryFromReader(
    message: SubmitModelConfigRequest,
    reader: jspb.BinaryReader,
  ): SubmitModelConfigRequest;
}

export namespace SubmitModelConfigRequest {
  export type AsObject = {
    modelConfig?: ModelConfig.AsObject;
  };
}

export class SubmitModelConfigResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitModelConfigResponse;

  hasModelConfig(): boolean;
  clearModelConfig(): void;
  getModelConfig(): ModelConfig | undefined;
  setModelConfig(value?: ModelConfig): SubmitModelConfigResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitModelConfigResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitModelConfigResponse,
  ): SubmitModelConfigResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitModelConfigResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitModelConfigResponse;
  static deserializeBinaryFromReader(
    message: SubmitModelConfigResponse,
    reader: jspb.BinaryReader,
  ): SubmitModelConfigResponse;
}

export namespace SubmitModelConfigResponse {
  export type AsObject = {
    message: string;
    modelConfig?: ModelConfig.AsObject;
  };
}

export class SubmitUserRequest extends jspb.Message {
  hasUser(): boolean;
  clearUser(): void;
  getUser(): EndUser | undefined;
  setUser(value?: EndUser): SubmitUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitUserRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitUserRequest,
  ): SubmitUserRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitUserRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitUserRequest;
  static deserializeBinaryFromReader(
    message: SubmitUserRequest,
    reader: jspb.BinaryReader,
  ): SubmitUserRequest;
}

export namespace SubmitUserRequest {
  export type AsObject = {
    user?: EndUser.AsObject;
  };
}

export class SubmitUserResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SubmitUserResponse;

  hasUser(): boolean;
  clearUser(): void;
  getUser(): EndUser | undefined;
  setUser(value?: EndUser): SubmitUserResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitUserResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SubmitUserResponse,
  ): SubmitUserResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SubmitUserResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): SubmitUserResponse;
  static deserializeBinaryFromReader(
    message: SubmitUserResponse,
    reader: jspb.BinaryReader,
  ): SubmitUserResponse;
}

export namespace SubmitUserResponse {
  export type AsObject = {
    message: string;
    user?: EndUser.AsObject;
  };
}

export class GetTemplatesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTemplatesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetTemplatesRequest,
  ): GetTemplatesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetTemplatesRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetTemplatesRequest;
  static deserializeBinaryFromReader(
    message: GetTemplatesRequest,
    reader: jspb.BinaryReader,
  ): GetTemplatesRequest;
}

export namespace GetTemplatesRequest {
  export type AsObject = {};
}

export class GetTemplatesResponse extends jspb.Message {
  clearTemplatesList(): void;
  getTemplatesList(): Array<Template>;
  setTemplatesList(value: Array<Template>): GetTemplatesResponse;
  addTemplates(value?: Template, index?: number): Template;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTemplatesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetTemplatesResponse,
  ): GetTemplatesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetTemplatesResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetTemplatesResponse;
  static deserializeBinaryFromReader(
    message: GetTemplatesResponse,
    reader: jspb.BinaryReader,
  ): GetTemplatesResponse;
}

export namespace GetTemplatesResponse {
  export type AsObject = {
    templatesList: Array<Template.AsObject>;
  };
}
