import NodeEnvironment from 'jest-environment-node';
import { Circus } from '@jest/types';
import { Baserun } from '../baserun';

export default class BaserunJestEnvironment extends NodeEnvironment {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  private _baserunTestStore: Map<string, any> | undefined;

  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      this._baserunTestStore = Baserun.markTestStart(event.test.name);
      this.global.baserunTestStore = this._baserunTestStore;
    }

    if (event.name === 'test_done' && event.test) {
      Baserun.markTestEnd(
        {
          error: event.test.errors[0],
          result: event.test.status,
        },
        this._baserunTestStore,
      );
      this._baserunTestStore = undefined;
      this.global.baserunTestStore = undefined;
    }
  };
}
