import { Run } from '../v1/gen/baserun.js';

export function getCurrentRun(): Run | undefined {
  return global.baserunCurrentRun || undefined;
}
