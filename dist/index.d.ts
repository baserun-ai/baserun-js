import { OpenAIChatMessage, OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAIChatRole, OpenAICompletionPrompt, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { BaserunProvider, BaserunType } from './types';
import { parseVariablesFromTemplateString } from './template';
export { OpenAIChatMessage, OpenAIChatRole, OpenAICompletionPrompt, OpenAIRequestInput, BaserunProvider, BaserunType, parseVariablesFromTemplateString, };
export declare class Baserun {
    buildChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildCompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
}
