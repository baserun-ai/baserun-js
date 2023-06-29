import { OpenAIChatMessage, OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAIChatRole, OpenAICompletionPrompt, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { BaserunProvider, BaserunType } from './types';
export { OpenAIChatMessage, OpenAIChatRole, OpenAICompletionPrompt, OpenAIRequestInput, BaserunProvider, BaserunType, };
export declare class Baserun {
    buildChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildCompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
}