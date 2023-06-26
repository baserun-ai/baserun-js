"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPrompts = exports.CompletionPrompts = void 0;
const types_1 = require("../types");
exports.CompletionPrompts = {
    completion: {
        config: {
            model: 'text-davinci-003',
        },
        prompt: {
            content: 'What is the capital of {country}?',
            variables: ['country'],
        },
        provider: types_1.BaserunProvider.OpenAI,
        type: types_1.BaserunType.Completion,
    },
};
exports.ChatPrompts = {
    assistant: {
        config: {
            model: 'gpt-4',
        },
        messages: [
            {
                role: 'system',
                content: 'You are a helpful customer support assistant for {company}.',
                variables: ['company'],
            },
            {
                role: 'user',
                content: '{question}',
                variables: ['question'],
            },
        ],
        provider: types_1.BaserunProvider.OpenAI,
        type: types_1.BaserunType.Chat,
    },
    country: {
        config: {
            model: 'gpt-3.5-turbo',
            max_tokens: 100,
            temperature: 0.3,
        },
        messages: [
            {
                role: 'user',
                content: 'What is the capital of {country}?',
                variables: ['country'],
            },
        ],
        provider: types_1.BaserunProvider.OpenAI,
        type: types_1.BaserunType.Chat,
    },
    ingredients: {
        config: {
            model: 'gpt-4',
        },
        messages: [
            {
                role: 'user',
                content: 'Generate a shopping list of the ingredients in {appetizer}, {entree}, and {dessert}.',
                variables: ['appetizer', 'entree', 'dessert'],
            },
        ],
        provider: types_1.BaserunProvider.OpenAI,
        type: types_1.BaserunType.Chat,
    },
    static: {
        config: {
            model: 'gpt-4',
        },
        messages: [
            {
                role: 'user',
                content: 'What is the capital of Portugal?',
            },
        ],
        provider: types_1.BaserunProvider.OpenAI,
        type: types_1.BaserunType.Chat,
    },
};
