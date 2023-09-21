import { Run } from './v1/generated/baserun_pb';
import { BASERUN_RUN_KEY } from './instrumentation/span_attributes';
import { context } from '@opentelemetry/api';

export function getCurrentRun(): Run | undefined {
  return (
    global.baserunTestRun ??
    (context.active().getValue(BASERUN_RUN_KEY) as Run | undefined)
  );
}
