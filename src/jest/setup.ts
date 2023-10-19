import { Baserun } from '../baserun';
import {
  TestSuite,
  StartTestSuiteRequest,
} from '../v1/generated/baserun_pb.js';
import { v4 } from 'uuid';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { getOrCreateSubmissionService } from '../grpc';

export default function baserunSetup() {
  Baserun.init();
  const suite = new TestSuite()
    .setId(v4())
    .setStartTimestamp(Timestamp.fromDate(new Date()));
  global.baserunTestSuite = suite;
  const startTestSuiteRequest = new StartTestSuiteRequest().setTestSuite(suite);
  getOrCreateSubmissionService().startTestSuite(
    startTestSuiteRequest,
    (error) => {
      if (error) {
        console.error('Failed to submit test suite start to Baserun: ', error);
      }
    },
  );
}
