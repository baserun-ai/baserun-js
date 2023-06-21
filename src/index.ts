import {
  evaluateOpenAIPrompt,
  OpenAIChatRequest,
  OpenAIChatRequestInput,
} from './openai';
import fs from 'fs';
import { Provider } from './provider';

function loadPrompt(path: string): OpenAIChatRequestInput {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  } catch (err) {
    throw new Error(`Unable to prepare prompt at ${path}`);
  }
}

export function preparePrompt(
  path: string,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  variables?: any,
): OpenAIChatRequest {
  const { config, prompts, provider } = loadPrompt(path);
  switch (provider) {
    case Provider.OpenAI: {
      return {
        ...config,
        messages: prompts.map((prompt) =>
          evaluateOpenAIPrompt(prompt, variables),
        ),
      };
    }
  }
}
