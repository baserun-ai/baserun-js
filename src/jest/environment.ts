import NodeEnvironment from 'jest-environment-node';
import { Circus } from '@jest/types';
import { Baserun } from '../baserun';
import { Run } from '../v1/generated/baserun_pb.js';
import { SpanKind, trace } from '@opentelemetry/api';

export default class BaserunJestEnvironment extends NodeEnvironment {
  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      const namePath = [event.test.name];
      let parent: Circus.DescribeBlock | undefined = event.test.parent;
      while (
        parent?.type === 'describeBlock' &&
        parent.name !== 'ROOT_DESCRIBE_BLOCK'
      ) {
        namePath.unshift(parent.name);
        parent = parent.parent;
      }

      const name = namePath.join(' • ');
      this.global.baserunTestRun = Baserun.getOrCreateCurrentRun({
        name,
        suiteId: global.baserunTestSuite.getId(),
        traceType: Run.RunType.RUN_TYPE_TEST,
      });

      const tracerProvider = trace.getTracerProvider();
      const tracer = tracerProvider.getTracer('baserun');

      this.global.baserunParentSpan = tracer.startSpan(
        `baserun.parent.${name}`,
        {
          kind: SpanKind.CLIENT,
        },
      );
    }

    if (event.name === 'test_done' && event.test) {
      if (event.test.errors[0]) {
        this.global.baserunTestRun.setError(String(event.test.errors[0]));
      }

      if (event.test.status) {
        this.global.baserunTestRun.setResult(event.test.status);
      }

      Baserun.finishRun(this.global.baserunTestRun);
      this.global.baserunParentSpan.end();

      this.global.baserunTestRun = undefined;
      this.global.baserunParentSpan = undefined;
    }
  };
}
