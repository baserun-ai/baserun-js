import { OpenAIChatMessage, OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAIChatRole, OpenAICompletionPrompt, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { GoogleChatMessages, GoogleCompletionPrompt, GoogleCompletionRequestInput, GoogleRequestInput, GoogleCompletionRequestOutput, GoogleChatRequestInput, GoogleChatRequestOutput, GoogleRequestOutput } from './google';
import { BaserunProvider, BaserunType } from './types';
import { parseVariablesFromTemplateString, Segment } from './template';
type AIRequestInput = OpenAIRequestInput | GoogleRequestInput;
export { AIRequestInput, GoogleChatMessages, GoogleChatRequestInput, GoogleCompletionPrompt, GoogleCompletionRequestInput, GoogleRequestInput, GoogleCompletionRequestOutput, GoogleChatRequestOutput, GoogleRequestOutput, OpenAIChatMessage, OpenAIChatRole, OpenAICompletionPrompt, OpenAIRequestInput, BaserunProvider, BaserunType, Segment, parseVariablesFromTemplateString, };
export declare class Baserun {
    buildOpenAIChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildOpenAICompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
    buildGoogleCompletionPrompt(input: GoogleCompletionRequestInput, providedVariables?: Record<string, string>): GoogleCompletionRequestOutput;
    buildGoogleChatPrompt(input: GoogleChatRequestInput, providedVariables?: Record<string, string>): GoogleChatRequestOutput;
}
