import { Baserun } from '../baserun';
import { EndTestSuiteRequest } from '../v1/generated/baserun_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { getOrCreateSubmissionService } from '../grpc';

export default async function teardown() {
  global.baserunTestSuite.setCompletionTimestamp(
    Timestamp.fromDate(new Date()),
  );
  const endTestSuiteRequest = new EndTestSuiteRequest().setTestSuite(
    global.baserunTestSuite,
  );
  getOrCreateSubmissionService().endTestSuite(endTestSuiteRequest, (error) => {
    if (error) {
      console.error('Failed to end test suite for Baserun: ', error);
    }
  });

  const parsedUrl = new URL(Baserun._apiUrl);
  const url = `${parsedUrl.protocol}//${
    parsedUrl.host
  }/runs/${global.baserunTestSuite.getId()}`;
  const width = process.stdout.columns || 80;
  const word = ' Baserun summary ';
  const before = Math.floor((width - word.length) / 2);
  const after = width - word.length - before;

  console.log(
    '\x1b[34m' + '='.repeat(before) + word + '='.repeat(after) + '\x1b[0m',
  );
  console.log(`Test results available at: ${url}`);
  console.log('\x1b[34m' + '='.repeat(width) + '\x1b[0m');
}
