import {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/index.js';

import { Eval } from './evals/types.js';

export enum BaserunProvider {
  Anthropic = 'anthropic',
  OpenAI = 'openai',
  GoogleGenerativeAI = 'google',
}

export enum BaserunType {
  Chat = 'chat',
  Completion = 'completion',
}

export enum BaserunStepType {
  Log = 'log',
  AutoLLM = 'auto_llm',
}

export type Message = {
  role: string;
  content: string;
  finish_reason: string;
  tool_calls?: ChatCompletionMessageToolCall[];
};

export interface LLMChatLog {
  stepType: BaserunStepType.AutoLLM;
  type: BaserunType.Chat;
  provider: BaserunProvider;
  config: object;
  promptMessages: Message[];
  choices?: Message[];
  logId: string;
  startTimestamp: Date;
  completionTimestamp: Date;
  isStream: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  errorStack?: string;
  tools?: ChatCompletionTool[];
  toolChoice?: ChatCompletionToolChoiceOption;
  requestId?: string;
  templateId?: string;
}

export interface LLMCompletionLog {
  stepType: BaserunStepType.AutoLLM;
  type: BaserunType.Completion;
  provider: BaserunProvider;
  config: object;
  prompt: { content: string };
  choices?: Message[];
  startTimestamp: Date;
  completionTimestamp: Date;
  logId?: string;
  isStream: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  errorStack?: string;
  requestId?: string;
  templateId?: string;
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

export interface BaseTrace {
  type: TraceType;
  testName: string;
  testInputs: string[];
  id: string;
  startTimestamp: Date;
  completionTimestamp: Date;
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
