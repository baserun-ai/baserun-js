import { evaluatePrompt } from '../index';

describe('prompt', () => {
  test('evaluatePrompt returns 4', () => {
    expect(evaluatePrompt()).toBe(4);
  });
});
