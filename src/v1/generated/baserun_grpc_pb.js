// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var baserun_pb = require('./baserun_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');

function serialize_baserun_v1_EndRunRequest(arg) {
  if (!(arg instanceof baserun_pb.EndRunRequest)) {
    throw new Error('Expected argument of type baserun.v1.EndRunRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_EndRunRequest(buffer_arg) {
  return baserun_pb.EndRunRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_EndRunResponse(arg) {
  if (!(arg instanceof baserun_pb.EndRunResponse)) {
    throw new Error('Expected argument of type baserun.v1.EndRunResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_EndRunResponse(buffer_arg) {
  return baserun_pb.EndRunResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_EndTestSuiteRequest(arg) {
  if (!(arg instanceof baserun_pb.EndTestSuiteRequest)) {
    throw new Error('Expected argument of type baserun.v1.EndTestSuiteRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_EndTestSuiteRequest(buffer_arg) {
  return baserun_pb.EndTestSuiteRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_EndTestSuiteResponse(arg) {
  if (!(arg instanceof baserun_pb.EndTestSuiteResponse)) {
    throw new Error('Expected argument of type baserun.v1.EndTestSuiteResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_EndTestSuiteResponse(buffer_arg) {
  return baserun_pb.EndTestSuiteResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_StartRunRequest(arg) {
  if (!(arg instanceof baserun_pb.StartRunRequest)) {
    throw new Error('Expected argument of type baserun.v1.StartRunRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_StartRunRequest(buffer_arg) {
  return baserun_pb.StartRunRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_StartRunResponse(arg) {
  if (!(arg instanceof baserun_pb.StartRunResponse)) {
    throw new Error('Expected argument of type baserun.v1.StartRunResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_StartRunResponse(buffer_arg) {
  return baserun_pb.StartRunResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_StartTestSuiteRequest(arg) {
  if (!(arg instanceof baserun_pb.StartTestSuiteRequest)) {
    throw new Error('Expected argument of type baserun.v1.StartTestSuiteRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_StartTestSuiteRequest(buffer_arg) {
  return baserun_pb.StartTestSuiteRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_StartTestSuiteResponse(arg) {
  if (!(arg instanceof baserun_pb.StartTestSuiteResponse)) {
    throw new Error('Expected argument of type baserun.v1.StartTestSuiteResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_StartTestSuiteResponse(buffer_arg) {
  return baserun_pb.StartTestSuiteResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitEvalRequest(arg) {
  if (!(arg instanceof baserun_pb.SubmitEvalRequest)) {
    throw new Error('Expected argument of type baserun.v1.SubmitEvalRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitEvalRequest(buffer_arg) {
  return baserun_pb.SubmitEvalRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitEvalResponse(arg) {
  if (!(arg instanceof baserun_pb.SubmitEvalResponse)) {
    throw new Error('Expected argument of type baserun.v1.SubmitEvalResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitEvalResponse(buffer_arg) {
  return baserun_pb.SubmitEvalResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitLogRequest(arg) {
  if (!(arg instanceof baserun_pb.SubmitLogRequest)) {
    throw new Error('Expected argument of type baserun.v1.SubmitLogRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitLogRequest(buffer_arg) {
  return baserun_pb.SubmitLogRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitLogResponse(arg) {
  if (!(arg instanceof baserun_pb.SubmitLogResponse)) {
    throw new Error('Expected argument of type baserun.v1.SubmitLogResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitLogResponse(buffer_arg) {
  return baserun_pb.SubmitLogResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitSpanRequest(arg) {
  if (!(arg instanceof baserun_pb.SubmitSpanRequest)) {
    throw new Error('Expected argument of type baserun.v1.SubmitSpanRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitSpanRequest(buffer_arg) {
  return baserun_pb.SubmitSpanRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_baserun_v1_SubmitSpanResponse(arg) {
  if (!(arg instanceof baserun_pb.SubmitSpanResponse)) {
    throw new Error('Expected argument of type baserun.v1.SubmitSpanResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_baserun_v1_SubmitSpanResponse(buffer_arg) {
  return baserun_pb.SubmitSpanResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SubmissionServiceService = exports.SubmissionServiceService = {
  startRun: {
    path: '/baserun.v1.SubmissionService/StartRun',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.StartRunRequest,
    responseType: baserun_pb.StartRunResponse,
    requestSerialize: serialize_baserun_v1_StartRunRequest,
    requestDeserialize: deserialize_baserun_v1_StartRunRequest,
    responseSerialize: serialize_baserun_v1_StartRunResponse,
    responseDeserialize: deserialize_baserun_v1_StartRunResponse,
  },
  submitLog: {
    path: '/baserun.v1.SubmissionService/SubmitLog',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.SubmitLogRequest,
    responseType: baserun_pb.SubmitLogResponse,
    requestSerialize: serialize_baserun_v1_SubmitLogRequest,
    requestDeserialize: deserialize_baserun_v1_SubmitLogRequest,
    responseSerialize: serialize_baserun_v1_SubmitLogResponse,
    responseDeserialize: deserialize_baserun_v1_SubmitLogResponse,
  },
  submitSpan: {
    path: '/baserun.v1.SubmissionService/SubmitSpan',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.SubmitSpanRequest,
    responseType: baserun_pb.SubmitSpanResponse,
    requestSerialize: serialize_baserun_v1_SubmitSpanRequest,
    requestDeserialize: deserialize_baserun_v1_SubmitSpanRequest,
    responseSerialize: serialize_baserun_v1_SubmitSpanResponse,
    responseDeserialize: deserialize_baserun_v1_SubmitSpanResponse,
  },
  endRun: {
    path: '/baserun.v1.SubmissionService/EndRun',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.EndRunRequest,
    responseType: baserun_pb.EndRunResponse,
    requestSerialize: serialize_baserun_v1_EndRunRequest,
    requestDeserialize: deserialize_baserun_v1_EndRunRequest,
    responseSerialize: serialize_baserun_v1_EndRunResponse,
    responseDeserialize: deserialize_baserun_v1_EndRunResponse,
  },
  submitEval: {
    path: '/baserun.v1.SubmissionService/SubmitEval',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.SubmitEvalRequest,
    responseType: baserun_pb.SubmitEvalResponse,
    requestSerialize: serialize_baserun_v1_SubmitEvalRequest,
    requestDeserialize: deserialize_baserun_v1_SubmitEvalRequest,
    responseSerialize: serialize_baserun_v1_SubmitEvalResponse,
    responseDeserialize: deserialize_baserun_v1_SubmitEvalResponse,
  },
  startTestSuite: {
    path: '/baserun.v1.SubmissionService/StartTestSuite',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.StartTestSuiteRequest,
    responseType: baserun_pb.StartTestSuiteResponse,
    requestSerialize: serialize_baserun_v1_StartTestSuiteRequest,
    requestDeserialize: deserialize_baserun_v1_StartTestSuiteRequest,
    responseSerialize: serialize_baserun_v1_StartTestSuiteResponse,
    responseDeserialize: deserialize_baserun_v1_StartTestSuiteResponse,
  },
  endTestSuite: {
    path: '/baserun.v1.SubmissionService/EndTestSuite',
    requestStream: false,
    responseStream: false,
    requestType: baserun_pb.EndTestSuiteRequest,
    responseType: baserun_pb.EndTestSuiteResponse,
    requestSerialize: serialize_baserun_v1_EndTestSuiteRequest,
    requestDeserialize: deserialize_baserun_v1_EndTestSuiteRequest,
    responseSerialize: serialize_baserun_v1_EndTestSuiteResponse,
    responseDeserialize: deserialize_baserun_v1_EndTestSuiteResponse,
  },
};

exports.SubmissionServiceClient = grpc.makeGenericClientConstructor(SubmissionServiceService);
