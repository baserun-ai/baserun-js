import { Run } from './v1/generated/baserun_pb.js';

export function getCurrentRun(): Run | undefined {
  return global.baserunCurrentRun || undefined;
}
