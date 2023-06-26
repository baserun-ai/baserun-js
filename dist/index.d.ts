import { OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { BaserunProvider, BaserunType } from './types';
export { OpenAIRequestInput };
export { BaserunProvider };
export { BaserunType };
export declare class Baserun {
    buildPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
}
