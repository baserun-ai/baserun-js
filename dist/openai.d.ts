import { ChatCompletionRequestMessage, CreateCompletionRequest, CreateChatCompletionRequest } from 'openai';
import { Provider } from './provider';
interface Variables {
    variables?: string[];
}
export type OpenAIChatMessage = ChatCompletionRequestMessage & Variables;
type OpenAICompletionPrompt = {
    content: string;
} & Variables;
interface OpenAIChatRequestInput {
    config: Omit<CreateChatCompletionRequest, 'messages'>;
    messages: OpenAIChatMessage[];
    provider: Provider.OpenAI;
}
interface OpenAICompletionRequestInput {
    config: Omit<CreateCompletionRequest, 'prompt'>;
    prompt: OpenAICompletionPrompt;
    provider: Provider.OpenAI;
}
export type OpenAIRequestInput = OpenAIChatRequestInput | OpenAICompletionRequestInput;
export type OpenAIRequest = CreateChatCompletionRequest | CreateCompletionRequest;
export {};
