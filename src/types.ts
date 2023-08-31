import { Eval } from './evals/types';

export enum BaserunProvider {
  Anthropic = 'anthropic',
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
  stepType: BaserunStepType.AutoLLM;
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
  stepType: BaserunStepType.AutoLLM;
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

export type AutoLLMLog = LLMChatLog | LLMCompletionLog;

export interface StandardLog {
  stepType: BaserunStepType.Log;
  name: string;
  payload: object | string;
  timestamp: number;
}

export type Log = StandardLog | AutoLLMLog;

export enum TraceType {
  Test = 'Test',
  Production = 'Production',
}

interface BaseTrace {
  type: TraceType;
  testName: string;
  testInputs: string[];
  id: string;
  startTimestamp: number;
  completionTimestamp: number;
  steps: Log[];
  metadata?: object;
  evals?: Eval<any>[];
}

interface TraceSuccess extends BaseTrace {
  result: string;
}

interface TraceError extends BaseTrace {
  error: string;
}

export type Trace = TraceSuccess | TraceError;
