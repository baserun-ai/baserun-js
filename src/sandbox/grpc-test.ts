import { getOrCreateSubmissionService } from '../backend/submissionService.js';
import { Run, Run_RunType, StartRunRequest } from '../v1/gen/baserun.js';
import { v4 } from 'uuid';
import { Timestamp } from '../v1/gen/google/protobuf/timestamp.js';

const service = getOrCreateSubmissionService();

const run: Run = {
  error: '',
  inputs: [],
  metadata: '',
  name: 'test',
  runId: v4(),
  result: '',
  runType: Run_RunType.PRODUCTION,
  sessionId: '',
  suiteId: '',
  completionTimestamp: Timestamp.fromDate(new Date()),
  startTimestamp: Timestamp.fromDate(new Date()),
};

const startRunRequest: StartRunRequest = {
  run,
};

service.startRun(startRunRequest, (err, res) => {
  console.log(err, res);
});
