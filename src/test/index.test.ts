import { Baserun } from '../index';
import { Prompts } from './prompts';

describe('Baserun', () => {
  let baserun: Baserun;
  beforeEach(() => {
    baserun = new Baserun();
  });

  describe('chat', () => {
    test('single non template message', () => {
      expect(baserun.buildPrompt(Prompts.static)).toEqual({
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
        baserun.buildPrompt(Prompts.country, {
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
      expect(() => baserun.buildPrompt(Prompts.country)).toThrowError(
        new Error("Variable 'country' was not provided"),
      );
    });

    test('multiple variables in single message', () => {
      expect(
        baserun.buildPrompt(Prompts.ingredients, {
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
        baserun.buildPrompt(Prompts.assistant, {
          company: 'xfinity',
          question: 'Is there an outage in San Francisco?',
        }),
      ).toEqual({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful customer support assistant for xfinity.',
          },
          {
            role: 'user',
            content: 'Is there an outage in San Francisco?',
          },
        ],
      });
    });
  });

  describe('completion', () => {
    test('single variable in prompt', () => {
      expect(
        baserun.buildPrompt(Prompts.completion, {
          country: 'France',
        }),
      ).toEqual({
        model: 'text-davinci-003',
        prompt: 'What is the capital of France?',
      });
    });
  });
});
