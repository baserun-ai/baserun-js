"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template_1 = require("../template");
describe('templateString', () => {
    test('replaces single variable correctly', () => {
        const template = 'Hello, {name}!';
        const variables = { name: 'Alice' };
        expect((0, template_1.templatizeString)(template, variables)).toBe('Hello, Alice!');
    });
    test('replaces single variable correctly with white space', () => {
        const template = 'Hello, {  name  }!';
        const variables = { name: 'Alice' };
        expect((0, template_1.templatizeString)(template, variables)).toBe('Hello, Alice!');
    });
    test('replaces multiple variables correctly', () => {
        const template = 'Hello, {name}! Today is {day}.';
        const variables = { name: 'Alice', day: 'Monday' };
        expect((0, template_1.templatizeString)(template, variables)).toBe('Hello, Alice! Today is Monday.');
    });
    test('replaces multiple occurrences of the same variable correctly', () => {
        const template = 'Hello, {name}! How are you, {name}?';
        const variables = { name: 'Alice' };
        expect((0, template_1.templatizeString)(template, variables)).toBe('Hello, Alice! How are you, Alice?');
    });
    test('throws error when variable is not found', () => {
        const template = 'Hello, {name}! Today is {day}.';
        const variables = { name: 'Alice', month: 'May' };
        expect(() => (0, template_1.templatizeString)(template, variables)).toThrowError(new Error("Variable 'month' not found"));
    });
});
