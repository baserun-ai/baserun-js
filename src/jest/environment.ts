import NodeEnvironment from 'jest-environment-node';
import { Circus } from '@jest/types';
import { Baserun } from '../baserun';

export default class BaserunJestEnvironment extends NodeEnvironment {
  handleTestEvent = (event: Circus.Event) => {
    if (event.name === 'test_start' && event.test) {
      this.global.baserunTestStore = Baserun.markTestStart(event.test.name);
    }

    if (event.name === 'test_done' && event.test) {
      Baserun.markTestEnd({
        error: event.test.errors[0],
        result: event.test.status,
      });
      this.global.baserunTestStore = undefined;
    }
  };
}
