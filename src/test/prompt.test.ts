import { evaluatePrompt } from '../index';
import intent from './prompts/intent.json';

describe('prompt', () => {
  test('evaluatePrompt with intentPrompt', () => {
    expect(evaluatePrompt(intent)).toBe(4);
  });
});
