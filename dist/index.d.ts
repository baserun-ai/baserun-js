import { OpenAIChatRequestInput, OpenAIChatRequestOutput, OpenAICompletionRequestInput, OpenAICompletionRequestOutput, OpenAIRequestInput } from './openai';
import { BaserunProvider, BaserunType, Variables } from './types';
export { OpenAIRequestInput };
export { Variables };
export { BaserunProvider };
export { BaserunType };
export declare class Baserun {
    buildPrompt(input: OpenAIChatRequestInput, providedVariables?: Record<string, string>): OpenAIChatRequestOutput;
    buildPrompt(input: OpenAICompletionRequestInput, providedVariables?: Record<string, string>): OpenAICompletionRequestOutput;
}
