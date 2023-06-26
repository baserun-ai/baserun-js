import { templatizeString } from '../template';

describe('templateString', () => {
  test('replaces single variable correctly', () => {
    const template = 'Hello, {name}!';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe('Hello, Alice!');
  });

  test('replaces single variable correctly with white space', () => {
    const template = 'Hello, {  name  }!';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe('Hello, Alice!');
  });

  test('replaces multiple variables correctly', () => {
    const template = 'Hello, {name}! Today is {day}.';
    const variables = { name: 'Alice', day: 'Monday' };
    expect(templatizeString(template, variables)).toBe(
      'Hello, Alice! Today is Monday.',
    );
  });

  test('replaces multiple occurrences of the same variable correctly', () => {
    const template = 'Hello, {name}! How are you, {name}?';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe(
      'Hello, Alice! How are you, Alice?',
    );
  });

  test('throws error when variable is not found', () => {
    const template = 'Hello, {name}! Today is {day}.';
    const variables = { name: 'Alice', month: 'May' };
    expect(() => templatizeString(template, variables)).toThrowError(
      new Error("Variable 'month' not found"),
    );
  });
});
