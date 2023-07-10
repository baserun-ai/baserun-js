import {
  parseVariablesFromTemplateString,
  templatizeString,
} from '../template';

describe('templateizeString', () => {
  test('replaces single variable correctly', () => {
    const template = 'Hello, {{name}}!';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe('Hello, Alice!');
  });

  test('replaces single variable correctly with white space', () => {
    const template = 'Hello, {{  name  }}!';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe('Hello, Alice!');
  });

  test('replaces multiple variables correctly', () => {
    const template = 'Hello, {{name}}! Today is {{day}}.';
    const variables = { name: 'Alice', day: 'Monday' };
    expect(templatizeString(template, variables)).toBe(
      'Hello, Alice! Today is Monday.',
    );
  });

  test('replaces multiple occurrences of the same variable correctly', () => {
    const template = 'Hello, {{name}}! How are you, {{name}}?';
    const variables = { name: 'Alice' };
    expect(templatizeString(template, variables)).toBe(
      'Hello, Alice! How are you, Alice?',
    );
  });

  test('throws error when variable is not found', () => {
    const template = 'Hello, {{name}}! Today is {{day}}.';
    const variables = { name: 'Alice', month: 'May' };
    expect(() => templatizeString(template, variables)).toThrowError(
      new Error("Variable 'month' not found"),
    );
  });
});

describe('parseVariablesFromTemplateString', () => {
  it('should parse single variable correctly', () => {
    const template = 'Hello, {{name}}!';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([
      { type: 'literal', text: 'Hello, ' },
      { type: 'variable', name: 'name' },
      { type: 'literal', text: '!' },
    ]);
  });

  it('should parse multiple variables correctly', () => {
    const template = 'Hello, {{firstName}} {{lastName}}!';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([
      { type: 'literal', text: 'Hello, ' },
      { type: 'variable', name: 'firstName' },
      { type: 'literal', text: ' ' },
      { type: 'variable', name: 'lastName' },
      { type: 'literal', text: '!' },
    ]);
  });

  it('should ignore unmatched curly braces', () => {
    const template = 'Hello, {{firstName, {{lastName}}';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([
      { type: 'literal', text: 'Hello, {{firstName, ' },
      { type: 'variable', name: 'lastName' },
    ]);
  });

  it('should return an empty array if there are no variables', () => {
    const template = 'Hello, world!';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([{ type: 'literal', text: 'Hello, world!' }]);
  });

  it('should handle spaces within braces', () => {
    const template = 'Hello, {{ first name }} {{ last name }}!';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([
      { type: 'literal', text: 'Hello, ' },
      { type: 'variable', name: 'first name' },
      { type: 'literal', text: ' ' },
      { type: 'variable', name: 'last name' },
      { type: 'literal', text: '!' },
    ]);
  });

  it('should ignore spaces outside braces', () => {
    const template = 'Hello, {{firstName}} {{lastName}}!';
    const result = parseVariablesFromTemplateString(template);
    expect(result).toEqual([
      { type: 'literal', text: 'Hello, ' },
      { type: 'variable', name: 'firstName' },
      { type: 'literal', text: ' ' },
      { type: 'variable', name: 'lastName' },
      { type: 'literal', text: '!' },
    ]);
  });
});
