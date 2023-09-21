// package: baserun.v1
// file: baserun.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as baserun_pb from "./baserun_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

interface ISubmissionServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    startRun: ISubmissionServiceService_IStartRun;
    submitLog: ISubmissionServiceService_ISubmitLog;
    submitSpan: ISubmissionServiceService_ISubmitSpan;
    endRun: ISubmissionServiceService_IEndRun;
    submitEval: ISubmissionServiceService_ISubmitEval;
    startTestSuite: ISubmissionServiceService_IStartTestSuite;
    endTestSuite: ISubmissionServiceService_IEndTestSuite;
}

interface ISubmissionServiceService_IStartRun extends grpc.MethodDefinition<baserun_pb.StartRunRequest, baserun_pb.StartRunResponse> {
    path: "/baserun.v1.SubmissionService/StartRun";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.StartRunRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.StartRunRequest>;
    responseSerialize: grpc.serialize<baserun_pb.StartRunResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.StartRunResponse>;
}
interface ISubmissionServiceService_ISubmitLog extends grpc.MethodDefinition<baserun_pb.SubmitLogRequest, baserun_pb.SubmitLogResponse> {
    path: "/baserun.v1.SubmissionService/SubmitLog";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.SubmitLogRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.SubmitLogRequest>;
    responseSerialize: grpc.serialize<baserun_pb.SubmitLogResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.SubmitLogResponse>;
}
interface ISubmissionServiceService_ISubmitSpan extends grpc.MethodDefinition<baserun_pb.SubmitSpanRequest, baserun_pb.SubmitSpanResponse> {
    path: "/baserun.v1.SubmissionService/SubmitSpan";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.SubmitSpanRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.SubmitSpanRequest>;
    responseSerialize: grpc.serialize<baserun_pb.SubmitSpanResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.SubmitSpanResponse>;
}
interface ISubmissionServiceService_IEndRun extends grpc.MethodDefinition<baserun_pb.EndRunRequest, baserun_pb.EndRunResponse> {
    path: "/baserun.v1.SubmissionService/EndRun";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.EndRunRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.EndRunRequest>;
    responseSerialize: grpc.serialize<baserun_pb.EndRunResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.EndRunResponse>;
}
interface ISubmissionServiceService_ISubmitEval extends grpc.MethodDefinition<baserun_pb.SubmitEvalRequest, baserun_pb.SubmitEvalResponse> {
    path: "/baserun.v1.SubmissionService/SubmitEval";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.SubmitEvalRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.SubmitEvalRequest>;
    responseSerialize: grpc.serialize<baserun_pb.SubmitEvalResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.SubmitEvalResponse>;
}
interface ISubmissionServiceService_IStartTestSuite extends grpc.MethodDefinition<baserun_pb.StartTestSuiteRequest, baserun_pb.StartTestSuiteResponse> {
    path: "/baserun.v1.SubmissionService/StartTestSuite";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.StartTestSuiteRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.StartTestSuiteRequest>;
    responseSerialize: grpc.serialize<baserun_pb.StartTestSuiteResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.StartTestSuiteResponse>;
}
interface ISubmissionServiceService_IEndTestSuite extends grpc.MethodDefinition<baserun_pb.EndTestSuiteRequest, baserun_pb.EndTestSuiteResponse> {
    path: "/baserun.v1.SubmissionService/EndTestSuite";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<baserun_pb.EndTestSuiteRequest>;
    requestDeserialize: grpc.deserialize<baserun_pb.EndTestSuiteRequest>;
    responseSerialize: grpc.serialize<baserun_pb.EndTestSuiteResponse>;
    responseDeserialize: grpc.deserialize<baserun_pb.EndTestSuiteResponse>;
}

export const SubmissionServiceService: ISubmissionServiceService;

export interface ISubmissionServiceServer extends grpc.UntypedServiceImplementation {
    startRun: grpc.handleUnaryCall<baserun_pb.StartRunRequest, baserun_pb.StartRunResponse>;
    submitLog: grpc.handleUnaryCall<baserun_pb.SubmitLogRequest, baserun_pb.SubmitLogResponse>;
    submitSpan: grpc.handleUnaryCall<baserun_pb.SubmitSpanRequest, baserun_pb.SubmitSpanResponse>;
    endRun: grpc.handleUnaryCall<baserun_pb.EndRunRequest, baserun_pb.EndRunResponse>;
    submitEval: grpc.handleUnaryCall<baserun_pb.SubmitEvalRequest, baserun_pb.SubmitEvalResponse>;
    startTestSuite: grpc.handleUnaryCall<baserun_pb.StartTestSuiteRequest, baserun_pb.StartTestSuiteResponse>;
    endTestSuite: grpc.handleUnaryCall<baserun_pb.EndTestSuiteRequest, baserun_pb.EndTestSuiteResponse>;
}

export interface ISubmissionServiceClient {
    startRun(request: baserun_pb.StartRunRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    startRun(request: baserun_pb.StartRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    startRun(request: baserun_pb.StartRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    submitLog(request: baserun_pb.SubmitLogRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    submitLog(request: baserun_pb.SubmitLogRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    submitLog(request: baserun_pb.SubmitLogRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    submitSpan(request: baserun_pb.SubmitSpanRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    submitSpan(request: baserun_pb.SubmitSpanRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    submitSpan(request: baserun_pb.SubmitSpanRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    endRun(request: baserun_pb.EndRunRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    endRun(request: baserun_pb.EndRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    endRun(request: baserun_pb.EndRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    submitEval(request: baserun_pb.SubmitEvalRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    submitEval(request: baserun_pb.SubmitEvalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    submitEval(request: baserun_pb.SubmitEvalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    startTestSuite(request: baserun_pb.StartTestSuiteRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    startTestSuite(request: baserun_pb.StartTestSuiteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    startTestSuite(request: baserun_pb.StartTestSuiteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    endTestSuite(request: baserun_pb.EndTestSuiteRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
    endTestSuite(request: baserun_pb.EndTestSuiteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
    endTestSuite(request: baserun_pb.EndTestSuiteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
}

export class SubmissionServiceClient extends grpc.Client implements ISubmissionServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public startRun(request: baserun_pb.StartRunRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    public startRun(request: baserun_pb.StartRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    public startRun(request: baserun_pb.StartRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartRunResponse) => void): grpc.ClientUnaryCall;
    public submitLog(request: baserun_pb.SubmitLogRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    public submitLog(request: baserun_pb.SubmitLogRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    public submitLog(request: baserun_pb.SubmitLogRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitLogResponse) => void): grpc.ClientUnaryCall;
    public submitSpan(request: baserun_pb.SubmitSpanRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    public submitSpan(request: baserun_pb.SubmitSpanRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    public submitSpan(request: baserun_pb.SubmitSpanRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitSpanResponse) => void): grpc.ClientUnaryCall;
    public endRun(request: baserun_pb.EndRunRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    public endRun(request: baserun_pb.EndRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    public endRun(request: baserun_pb.EndRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndRunResponse) => void): grpc.ClientUnaryCall;
    public submitEval(request: baserun_pb.SubmitEvalRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    public submitEval(request: baserun_pb.SubmitEvalRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    public submitEval(request: baserun_pb.SubmitEvalRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.SubmitEvalResponse) => void): grpc.ClientUnaryCall;
    public startTestSuite(request: baserun_pb.StartTestSuiteRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    public startTestSuite(request: baserun_pb.StartTestSuiteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    public startTestSuite(request: baserun_pb.StartTestSuiteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.StartTestSuiteResponse) => void): grpc.ClientUnaryCall;
    public endTestSuite(request: baserun_pb.EndTestSuiteRequest, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
    public endTestSuite(request: baserun_pb.EndTestSuiteRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
    public endTestSuite(request: baserun_pb.EndTestSuiteRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: baserun_pb.EndTestSuiteResponse) => void): grpc.ClientUnaryCall;
}
