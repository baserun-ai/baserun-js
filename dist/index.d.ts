import { OpenAIChatMessage, OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAIChatRole, OpenAICompletionPrompt, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { GoogleCompletionPrompt, GoogleCompletionRequestInput, GoogleRequestInput, GoogleRequestOutput } from "./google";
import { BaserunProvider, BaserunType } from './types';
import { parseVariablesFromTemplateString, Segment } from './template';
type AIRequestInput = OpenAIRequestInput | GoogleRequestInput;
export { AIRequestInput, GoogleCompletionPrompt, GoogleCompletionRequestInput, GoogleRequestInput, GoogleRequestOutput, OpenAIChatMessage, OpenAIChatRole, OpenAICompletionPrompt, OpenAIRequestInput, BaserunProvider, BaserunType, Segment, parseVariablesFromTemplateString, };
export declare class Baserun {
    buildOpenAIChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildOpenAICompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
    buildGoogleCompletionPrompt(input: GoogleCompletionRequestInput, providedVariables?: Record<string, string>): GoogleRequestOutput;
}
