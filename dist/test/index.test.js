"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const prompts_1 = require("./prompts");
describe('Baserun', () => {
    let baserun;
    beforeEach(() => {
        baserun = new index_1.Baserun();
    });
    describe('chat', () => {
        test('single non template message', () => {
            expect(baserun.buildOpenAIChatPrompt(prompts_1.OpenAIChatPrompts.static)).toEqual({
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
            expect(baserun.buildOpenAIChatPrompt(prompts_1.OpenAIChatPrompts.country, {
                country: 'France',
            })).toEqual({
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
            expect(baserun.buildOpenAIChatPrompt(prompts_1.OpenAIChatPrompts.country)).toEqual({
                model: 'gpt-3.5-turbo',
                max_tokens: 100,
                temperature: 0.3,
                messages: [
                    {
                        role: 'user',
                        content: 'What is the capital of ?',
                    },
                ],
            });
        });
        test('multiple variables in single message', () => {
            expect(baserun.buildOpenAIChatPrompt(prompts_1.OpenAIChatPrompts.ingredients, {
                appetizer: 'caesar salad',
                entree: 'spaghetti and meatballs',
                dessert: 'cheesecake',
            })).toEqual({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: 'Generate a shopping list of the ingredients in caesar salad, spaghetti and meatballs, and cheesecake.',
                    },
                ],
            });
        });
        test('multiple messages', () => {
            expect(baserun.buildOpenAIChatPrompt(prompts_1.OpenAIChatPrompts.assistant, {
                company: 'xfinity',
                question: 'Is there an outage in San Francisco?',
            })).toEqual({
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
        test('multiple messages google', () => {
            expect(baserun.buildGoogleChatPrompt(prompts_1.GoogleChatPrompts.chat, {
                company: 'xfinity',
                question: 'Is there an outage in San Francisco?',
            })).toEqual({
                model: 'chat-bison@001',
                parameters: {},
                instances: [
                    {
                        messages: [
                            {
                                author: 'system',
                                content: 'You are a helpful customer support assistant for xfinity.',
                            },
                            {
                                author: 'user',
                                content: 'Is there an outage in San Francisco?',
                            },
                        ],
                    },
                ],
            });
        });
        test('system message llama', () => {
            expect(baserun.buildLlamaChatPrompt(prompts_1.LlamaChatPrompts.chat, {
                company: 'xfinity',
                question: 'Is there an outage in San Francisco?',
            })).toEqual({
                model: 'llama13b-v2-chat',
                input: {
                    prompt: "Is there an outage in San Francisco?",
                    system_prompt: 'You are a helpful customer support assistant for xfinity.',
                },
            });
        });
        test('assistant and user messages llama', () => {
            expect(baserun.buildLlamaChatPrompt(prompts_1.LlamaChatPrompts.assistant, {
                company: 'xfinity',
                question: 'Is there an outage in San Francisco?',
            })).toEqual({
                model: 'llama13b-v2-chat',
                input: {
                    prompt: "User: Is there an outage in San Francisco?\nAssistant: Not too my knowledge\nUser: Can you check again?",
                    system_prompt: 'You are a helpful customer support assistant for xfinity.',
                },
            });
        });
    });
    describe('completion', () => {
        test('single variable in prompt openai', () => {
            expect(baserun.buildOpenAICompletionPrompt(prompts_1.OpenAICompletionPrompts.openai, {
                country: 'France',
            })).toEqual({
                model: 'text-davinci-003',
                prompt: 'What is the capital of France?',
            });
        });
        test('single variable in prompt google', () => {
            expect(baserun.buildGoogleCompletionPrompt(prompts_1.GoogleCompletionPrompts.google, {
                country: 'France',
            })).toEqual({
                model: 'text-bison@001',
                parameters: { temperature: 0.5 },
                instances: [{ prompt: 'What is the capital of France?' }],
            });
        });
    });
});
