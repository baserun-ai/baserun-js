import { OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAIChatRole, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { GoogleCompletionRequestInput, GoogleRequestInput, GoogleCompletionRequestOutput, GoogleChatRequestInput, GoogleChatRequestOutput, GoogleRequestOutput } from './google';
import { BaserunProvider, BaserunType, BaserunChatMessage, BaserunPrompt } from './types';
import { parseVariablesFromTemplateString, Segment } from './template';
type AIRequestInput = OpenAIRequestInput | GoogleRequestInput;
export { AIRequestInput, GoogleChatRequestInput, GoogleCompletionRequestInput, GoogleRequestInput, GoogleCompletionRequestOutput, GoogleChatRequestOutput, GoogleRequestOutput, OpenAIChatRole, OpenAIRequestInput, BaserunProvider, BaserunType, BaserunPrompt, BaserunChatMessage, Segment, parseVariablesFromTemplateString, };
export declare class Baserun {
    buildOpenAIChatPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildOpenAICompletionPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
    buildGoogleCompletionPrompt(input: GoogleCompletionRequestInput, providedVariables?: Record<string, string>): GoogleCompletionRequestOutput;
    buildGoogleChatPrompt(input: GoogleChatRequestInput, providedVariables?: Record<string, string>): GoogleChatRequestOutput;
}
