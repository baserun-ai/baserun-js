import { OpenAIRequest } from './openai';
export declare class Baserun {
    private _prompts;
    constructor(promptsPath: string);
    buildPrompt(prompt: string, providedVariables?: Record<string, string>): OpenAIRequest;
}
