import { expect, describe, test } from 'vitest';
import { FormattedString } from '../utils/formattedString.js';

// I guess it's not expected to pass every test here.
// But pass/fail ratio might be a basic metric to tell how close we are to actually good implementation
describe('formattedString', () => {
  test.each([
    ['asdf', {}, 'asdf'],
    ['asdf asdf', {}, 'asdf asdf'],
    ['asdf {a}', { a: 'abc' }, 'asdf abc'],
    ['asdf {a}', { a: 123 }, 'asdf 123'],
    ['asdf {a} {a}', { a: 'abc' }, 'asdf abc abc'],
    ['a {a}, b {b}', { a: 'aa', b: 'bb' }, 'a aa, b bb'],
    ['a {a}, b {b}', { a: 123, b: 123 }, 'a 123, b 123'],
    ['a {a}, b {b}', { a: 123, b: 'abc' }, 'a 123, b abc'],
    ['a {a}, b {b}', { a: 123, b: 'abc' }, 'a 123, b abc'],
    ['a {1a}', { '1a': 'abc' }, 'a abc'],
    ['{{a}}', { a: 'b' }, '{a}'],
    ['{{{a}}}', { a: 'b' }, '{b}'],
    // test just some of the formatting types supported in python
    ['{a:<8}', { a: 'a' }, 'a       '],
    ['{a:>8}', { a: 'a' }, '        a'],
    ['{a:^8}', { a: 'a' }, '   a    '],
    ['{a:+}', { a: 1 }, '+1'],
    ['{a:x}', { a: 15 }, 'f'],
    ['{a:.03f}', { a: 13 }, '13.000'],
    ['{a:.03f}', { a: 13.0005 }, '13.001'],
  ])('correct input', (input, params, output) => {
    expect(new FormattedString(input).format(params)).toEqual(output);
  });

  test.each([
    ['{a}', {}, 'KeyError'],
    ['{{a}', {}, "Single '{' encountered"],
    ['{a}}', {}, "Single '}' encountered"],
    ['{1}', { '1': 'a' }, 'index 1 out of range'],
  ])('incorrect input', (input, params, err) => {
    expect(() => new FormattedString(input).format(params)).toThrowError(err);
  });
});
