import NodeEnvironment from 'jest-environment-node';
import { Circus } from '@jest/types';
import { Baserun } from '../baserun';
import { TraceType } from '../types';

export default class BaserunJestEnvironment extends NodeEnvironment {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  private _baserunTraceStore: Map<string, any> | undefined;

  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      this._baserunTraceStore = Baserun.markTraceStart(
        TraceType.Test,
        event.test.name,
      );
      this.global.baserunTraceStore = this._baserunTraceStore;
    }

    if (event.name === 'test_done' && event.test) {
      Baserun.markTraceEnd(
        {
          error: event.test.errors[0],
          result: event.test.status,
        },
        this._baserunTraceStore,
      );
      this._baserunTraceStore = undefined;
      this.global.baserunTraceStore = undefined;
    }
  };
}
