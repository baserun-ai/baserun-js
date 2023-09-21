// package: baserun.v1
// file: baserun.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class Status extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): Status;
    getCode(): Status.StatusCode;
    setCode(value: Status.StatusCode): Status;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Status.AsObject;
    static toObject(includeInstance: boolean, msg: Status): Status.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Status, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Status;
    static deserializeBinaryFromReader(message: Status, reader: jspb.BinaryReader): Status;
}

export namespace Status {
    export type AsObject = {
        message: string,
        code: Status.StatusCode,
    }

    export enum StatusCode {
    STATUS_CODE_UNSPECIFIED = 0,
    STATUS_CODE_OK = 1,
    STATUS_CODE_ERROR = 2,
    }

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

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Message.AsObject;
    static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Message;
    static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
    export type AsObject = {
        role: string,
        content: string,
        finishReason: string,
        functionCall: string,
    }
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

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Run.AsObject;
    static toObject(includeInstance: boolean, msg: Run): Run.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Run, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Run;
    static deserializeBinaryFromReader(message: Run, reader: jspb.BinaryReader): Run;
}

export namespace Run {
    export type AsObject = {
        runId: string,
        suiteId: string,
        name: string,
        inputsList: Array<string>,
        runType: Run.RunType,
        metadata: string,
        startTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        completionTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        result: string,
        error: string,
    }

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
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Log, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Log;
    static deserializeBinaryFromReader(message: Log, reader: jspb.BinaryReader): Log;
}

export namespace Log {
    export type AsObject = {
        runId: string,
        name: string,
        payload: string,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
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

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Span.AsObject;
    static toObject(includeInstance: boolean, msg: Span): Span.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Span, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Span;
    static deserializeBinaryFromReader(message: Span, reader: jspb.BinaryReader): Span;
}

export namespace Span {
    export type AsObject = {
        runId: string,
        traceId: Uint8Array | string,
        spanId: number,
        name: string,
        startTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        endTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        status?: Status.AsObject,
        vendor: string,
        requestType: string,
        model: string,
        totalTokens: number,
        completionTokens: number,
        promptTokens: number,
        promptMessagesList: Array<Message.AsObject>,
        completionsList: Array<Message.AsObject>,
        apiBase?: string,
        apiType?: string,
        functions?: string,
        functionCall?: string,
        temperature?: number,
        topP?: number,
        n?: number,
        stream?: boolean,
        stopList: Array<string>,
        maxTokens?: number,
        presencePenalty?: number,
        frequencyPenalty?: number,
        logitBias?: string,
        user?: string,
        logprobs?: number,
        echo?: boolean,
        suffix?: string,
        bestOf?: number,
        logId?: string,
        topK?: number,
    }
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
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Eval, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Eval;
    static deserializeBinaryFromReader(message: Eval, reader: jspb.BinaryReader): Eval;
}

export namespace Eval {
    export type AsObject = {
        name: string,
        type: string,
        result: string,
        score?: number,
        submission: string,
        payload: string,
    }
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
    setCompletionTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): TestSuite;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TestSuite.AsObject;
    static toObject(includeInstance: boolean, msg: TestSuite): TestSuite.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TestSuite, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TestSuite;
    static deserializeBinaryFromReader(message: TestSuite, reader: jspb.BinaryReader): TestSuite;
}

export namespace TestSuite {
    export type AsObject = {
        id: string,
        name: string,
        startTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        completionTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class StartRunRequest extends jspb.Message { 

    hasRun(): boolean;
    clearRun(): void;
    getRun(): Run | undefined;
    setRun(value?: Run): StartRunRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StartRunRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StartRunRequest): StartRunRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StartRunRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StartRunRequest;
    static deserializeBinaryFromReader(message: StartRunRequest, reader: jspb.BinaryReader): StartRunRequest;
}

export namespace StartRunRequest {
    export type AsObject = {
        run?: Run.AsObject,
    }
}

export class StartRunResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): StartRunResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StartRunResponse.AsObject;
    static toObject(includeInstance: boolean, msg: StartRunResponse): StartRunResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StartRunResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StartRunResponse;
    static deserializeBinaryFromReader(message: StartRunResponse, reader: jspb.BinaryReader): StartRunResponse;
}

export namespace StartRunResponse {
    export type AsObject = {
        message: string,
    }
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
    static toObject(includeInstance: boolean, msg: SubmitLogRequest): SubmitLogRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitLogRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitLogRequest;
    static deserializeBinaryFromReader(message: SubmitLogRequest, reader: jspb.BinaryReader): SubmitLogRequest;
}

export namespace SubmitLogRequest {
    export type AsObject = {
        log?: Log.AsObject,
        run?: Run.AsObject,
    }
}

export class SubmitLogResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): SubmitLogResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubmitLogResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SubmitLogResponse): SubmitLogResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitLogResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitLogResponse;
    static deserializeBinaryFromReader(message: SubmitLogResponse, reader: jspb.BinaryReader): SubmitLogResponse;
}

export namespace SubmitLogResponse {
    export type AsObject = {
        message: string,
    }
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
    static toObject(includeInstance: boolean, msg: SubmitSpanRequest): SubmitSpanRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitSpanRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitSpanRequest;
    static deserializeBinaryFromReader(message: SubmitSpanRequest, reader: jspb.BinaryReader): SubmitSpanRequest;
}

export namespace SubmitSpanRequest {
    export type AsObject = {
        span?: Span.AsObject,
        run?: Run.AsObject,
    }
}

export class SubmitSpanResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): SubmitSpanResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubmitSpanResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SubmitSpanResponse): SubmitSpanResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitSpanResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitSpanResponse;
    static deserializeBinaryFromReader(message: SubmitSpanResponse, reader: jspb.BinaryReader): SubmitSpanResponse;
}

export namespace SubmitSpanResponse {
    export type AsObject = {
        message: string,
    }
}

export class EndRunRequest extends jspb.Message { 

    hasRun(): boolean;
    clearRun(): void;
    getRun(): Run | undefined;
    setRun(value?: Run): EndRunRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EndRunRequest.AsObject;
    static toObject(includeInstance: boolean, msg: EndRunRequest): EndRunRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EndRunRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EndRunRequest;
    static deserializeBinaryFromReader(message: EndRunRequest, reader: jspb.BinaryReader): EndRunRequest;
}

export namespace EndRunRequest {
    export type AsObject = {
        run?: Run.AsObject,
    }
}

export class EndRunResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): EndRunResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EndRunResponse.AsObject;
    static toObject(includeInstance: boolean, msg: EndRunResponse): EndRunResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EndRunResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EndRunResponse;
    static deserializeBinaryFromReader(message: EndRunResponse, reader: jspb.BinaryReader): EndRunResponse;
}

export namespace EndRunResponse {
    export type AsObject = {
        message: string,
    }
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
    static toObject(includeInstance: boolean, msg: SubmitEvalRequest): SubmitEvalRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitEvalRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitEvalRequest;
    static deserializeBinaryFromReader(message: SubmitEvalRequest, reader: jspb.BinaryReader): SubmitEvalRequest;
}

export namespace SubmitEvalRequest {
    export type AsObject = {
        eval?: Eval.AsObject,
        run?: Run.AsObject,
    }
}

export class SubmitEvalResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): SubmitEvalResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SubmitEvalResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SubmitEvalResponse): SubmitEvalResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SubmitEvalResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SubmitEvalResponse;
    static deserializeBinaryFromReader(message: SubmitEvalResponse, reader: jspb.BinaryReader): SubmitEvalResponse;
}

export namespace SubmitEvalResponse {
    export type AsObject = {
        message: string,
    }
}

export class StartTestSuiteRequest extends jspb.Message { 

    hasTestSuite(): boolean;
    clearTestSuite(): void;
    getTestSuite(): TestSuite | undefined;
    setTestSuite(value?: TestSuite): StartTestSuiteRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StartTestSuiteRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StartTestSuiteRequest): StartTestSuiteRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StartTestSuiteRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StartTestSuiteRequest;
    static deserializeBinaryFromReader(message: StartTestSuiteRequest, reader: jspb.BinaryReader): StartTestSuiteRequest;
}

export namespace StartTestSuiteRequest {
    export type AsObject = {
        testSuite?: TestSuite.AsObject,
    }
}

export class StartTestSuiteResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): StartTestSuiteResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StartTestSuiteResponse.AsObject;
    static toObject(includeInstance: boolean, msg: StartTestSuiteResponse): StartTestSuiteResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StartTestSuiteResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StartTestSuiteResponse;
    static deserializeBinaryFromReader(message: StartTestSuiteResponse, reader: jspb.BinaryReader): StartTestSuiteResponse;
}

export namespace StartTestSuiteResponse {
    export type AsObject = {
        message: string,
    }
}

export class EndTestSuiteRequest extends jspb.Message { 

    hasTestSuite(): boolean;
    clearTestSuite(): void;
    getTestSuite(): TestSuite | undefined;
    setTestSuite(value?: TestSuite): EndTestSuiteRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EndTestSuiteRequest.AsObject;
    static toObject(includeInstance: boolean, msg: EndTestSuiteRequest): EndTestSuiteRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EndTestSuiteRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EndTestSuiteRequest;
    static deserializeBinaryFromReader(message: EndTestSuiteRequest, reader: jspb.BinaryReader): EndTestSuiteRequest;
}

export namespace EndTestSuiteRequest {
    export type AsObject = {
        testSuite?: TestSuite.AsObject,
    }
}

export class EndTestSuiteResponse extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): EndTestSuiteResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EndTestSuiteResponse.AsObject;
    static toObject(includeInstance: boolean, msg: EndTestSuiteResponse): EndTestSuiteResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EndTestSuiteResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EndTestSuiteResponse;
    static deserializeBinaryFromReader(message: EndTestSuiteResponse, reader: jspb.BinaryReader): EndTestSuiteResponse;
}

export namespace EndTestSuiteResponse {
    export type AsObject = {
        message: string,
    }
}
