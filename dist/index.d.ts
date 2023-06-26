import { OpenAIRequest, OpenAIRequestInput } from './openai';
export type AIRequest = OpenAIRequest;
export type AIRequestInput = OpenAIRequestInput;
export declare class Baserun {
    private _prompts;
    constructor(promptsPath: string);
    buildPrompt(prompt: string, providedVariables?: Record<string, string>): AIRequest;
}
