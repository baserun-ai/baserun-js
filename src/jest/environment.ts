import * as NodeEnv from 'jest-environment-node';
import { Circus } from '@jest/types';
import { Baserun } from '../baserun.js';

function getTestName(testEntry: Circus.TestEntry) {
  const namePath = [testEntry.name];
  let parent: Circus.DescribeBlock | undefined = testEntry.parent;
  while (
    parent?.type === 'describeBlock' &&
    parent.name !== 'ROOT_DESCRIBE_BLOCK'
  ) {
    namePath.unshift(parent.name);
    parent = parent.parent;
  }

  return namePath.join(' > ');
}

export default class BaserunJestEnvironment extends NodeEnv.TestEnvironment {
  async setup(): Promise<void> {
    await super.setup();
    Baserun.forceTestEnv = true;
  }
  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      const oldTestFn = event.test.fn;

      const testName = getTestName(event.test);

      event.test.fn = Baserun.trace(function (this: any, ...args: [any]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return oldTestFn(...args) as any;
      }, testName) as any;
    }

    if (event.name === 'test_done' && event.test) {
      // TODO: Remove -> nothing to do here
      // Baserun.markTraceEnd(
      //   {
      //     error: event.test.errors[0],
      //     result: event.test.status,
      //   },
      //   this._baserunTraceStore,
      // );
      // this._baserunTraceStore = undefined;
      // this.global.baserunTraceStore = undefined;
    }
  };
}
