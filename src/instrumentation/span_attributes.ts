import { createContextKey } from '@opentelemetry/api';

export enum SpanAttributeName {
  // Matches opentelemetry-semconv-llm
  LLM_VENDOR = 'llm.vendor',
  LLM_REQUEST_TYPE = 'llm.request.type',
  LLM_REQUEST_MODEL = 'llm.request.model',
  LLM_RESPONSE_MODEL = 'llm.response.model',
  LLM_REQUEST_MAX_TOKENS = 'llm.request.max_tokens',
  LLM_USAGE_TOTAL_TOKENS = 'llm.usage.total_tokens',
  LLM_USAGE_COMPLETION_TOKENS = 'llm.usage.completion_tokens',
  LLM_USAGE_PROMPT_TOKENS = 'llm.usage.prompt_tokens',
  LLM_TEMPERATURE = 'llm.temperature',
  LLM_TOP_P = 'llm.top_p',
  LLM_TOP_K = 'llm.top_k',
  LLM_FREQUENCY_PENALTY = 'llm.frequency_penalty',
  LLM_PRESENCE_PENALTY = 'llm.presence_penalty',
  LLM_PROMPTS = 'llm.prompts',
  LLM_COMPLETIONS = 'llm.completions',
  LLM_CHAT_STOP_SEQUENCES = 'llm.chat.stop_sequences',
  LLM_FUNCTION_CALL = 'llm.function_call',
  LLM_FUNCTIONS = 'llm.functions',
  LLM_N = 'llm.n',
  LLM_STREAM = 'llm.stream',
  LLM_STOP = 'llm.stop',
  LLM_LOGIT_BIAS = 'llm.logit_bias',
  LLM_USER = 'llm.user',
  LLM_BEST_OF = 'llm.best_of',
  LLM_LOGPROBS = 'llm.logprobs',
  LLM_SUFFIX = 'llm.suffix',
  LLM_ECHO = 'llm.echo',

  OPENAI_API_VERSION = 'openai.api_version',
  OPENAI_API_BASE = 'openai.api_base',
  OPENAI_API_TYPE = 'openai.api_type',

  ANTHROPIC_LOG_ID = 'anthropic.log_id',
}

export const ANTHROPIC_VENDOR_NAME = 'Anthropic';
export const OPENAI_VENDOR_NAME = 'OpenAI';
export const BASERUN_RUN_KEY = createContextKey('baserun.run');
