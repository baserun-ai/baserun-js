import * as NodeEnv from 'jest-environment-node';
import { Circus } from '@jest/types';
// TODO: Make evals work again
// import { Baserun } from '../baserun.js';
// import { TraceType } from '../types.js';

// yes this is sad, but needed due to TypeScript not seeing this as a function type

// const NodeEnvironment = NodeEnv.default as any;

export default class BaserunJestEnvironment extends NodeEnv.TestEnvironment {
  private _baserunTraceStore: Map<string, any> | undefined;

  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      const oldTestFn = event.test.fn;

      event.test.fn = function (this: any, ...args: [any]) {
        // console.log('We are patching the test fn');
        console.log('patching yo');
        console.log({ that: this });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return oldTestFn(...args) as any;
      };

      const namePath = [event.test.name];
      let parent: Circus.DescribeBlock | undefined = event.test.parent;
      while (
        parent?.type === 'describeBlock' &&
        parent.name !== 'ROOT_DESCRIBE_BLOCK'
      ) {
        namePath.unshift(parent.name);
        parent = parent.parent;
      }

      // this._baserunTraceStore = Baserun.markTraceStart(
      //   TraceType.Test,
      //   namePath.join(' • '),
      // );
      // this.global.baserunTraceStore = this._baserunTraceStore;
    }

    if (event.name === 'test_done' && event.test) {
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
