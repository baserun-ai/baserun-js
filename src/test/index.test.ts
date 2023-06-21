import { Baserun } from '../index';
import path from 'path';

describe('evaluateLLMRequest', () => {
  let baserun: Baserun;
  beforeEach(() => {
    baserun = new Baserun(path.join(__dirname, 'prompts'));
  });

  test('single non template message', () => {
    expect(baserun.buildPrompt('static')).toEqual({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: 'What is the capital of Portugal?',
        },
      ],
    });
  });

  test('single variable in single message', () => {
    expect(
      baserun.buildPrompt('country', {
        country: 'France',
      }),
    ).toEqual({
      model: 'gpt-3.5-turbo',
      max_tokens: 100,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: 'What is the capital of France?',
        },
      ],
    });
  });

  test('missing variable', () => {
    expect(() => baserun.buildPrompt('country')).toThrowError(
      new Error("Variable 'country' not found"),
    );
  });

  test('multiple variables in single message', () => {
    expect(
      baserun.buildPrompt('ingredients', {
        appetizer: 'caesar salad',
        entree: 'spaghetti and meatballs',
        dessert: 'cheesecake',
      }),
    ).toEqual({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content:
            'Generate a shopping list of the ingredients in caesar salad, spaghetti and meatballs, and cheesecake.',
        },
      ],
    });
  });

  test('multiple messages', () => {
    expect(
      baserun.buildPrompt('assistant', {
        company: 'xfinity',
        question: 'Is there an outage in San Francisco?',
      }),
    ).toEqual({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful customer support assistant for xfinity.',
        },
        {
          role: 'user',
          content: 'Is there an outage in San Francisco?',
        },
      ],
    });
  });
});
