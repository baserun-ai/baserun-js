export enum BaserunProvider {
  Google = 'google',
  Llama = 'llama',
  OpenAI = 'openai',
}

export enum BaserunType {
  Chat = 'chat',
  Completion = 'completion',
}

export enum BaserunStepType {
  Log = 'log',
  AutoLLM = 'auto_llm',
  CustomLLM = 'custom_llm',
}

interface LLMChatLog {
  type: BaserunType;
  provider: BaserunProvider;
  config: object;
  messages: Array<{ role: string; content: string }>;
  output: string;
  startTimestamp: number;
  completionTimestamp: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LLMCompletionLog {
  type: BaserunType;
  provider: BaserunProvider;
  config: object;
  prompt: { content: string };
  output: string;
  startTimestamp: number;
  completionTimestamp: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StandardLog {
  name: string;
  payload: object | string;
  timestamp: number;
}

export type Log = StandardLog | LLMChatLog | LLMCompletionLog;

interface TestSuccess {
  testName: string;
  testInputs: string[];
  id: string;
  result: string;
  startTimestamp: number;
  completionTimestamp: number;
  steps: Log[];
}

interface TestError {
  testName: string;
  testInputs: string[];
  id: string;
  error: string;
  startTimestamp: number;
  completionTimestamp: number;
  steps: Log[];
}

export type Test = TestSuccess | TestError;
