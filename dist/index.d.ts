import { OpenAIRequest, OpenAIRequestInput } from './openai';
export type AIRequest = OpenAIRequest;
export type AIRequestInput = OpenAIRequestInput;
export declare class Baserun {
    private _prompts;
    constructor(promptsPath?: string);
    buildPrompt(input: string, providedVariables?: Record<string, string>): AIRequest;
    buildPrompt(input: AIRequestInput, providedVariables?: Record<string, string>): AIRequest;
}
