import { ChatCompletionRequestMessage } from 'openai';
export declare enum BaserunProvider {
    OpenAI = "openai",
    Google = "google",
    Llama = "llama"
}
export declare enum BaserunType {
    Chat = "chat",
    Completion = "completion"
}
export interface Variables {
    variables?: string[];
}
export type BaserunChatMessage = ChatCompletionRequestMessage & Variables;
export type BaserunPrompt = {
    content: string;
} & Variables;
