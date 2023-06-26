import { OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { BaserunProvider, BaserunType } from './types';
export { OpenAIRequestInput };
export { BaserunProvider };
export { BaserunType };
export declare class Baserun {
    buildChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildCompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
}
