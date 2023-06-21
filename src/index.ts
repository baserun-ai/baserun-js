import {
  evaluateOpenAIPrompt,
  OpenAIChatPrompt,
  OpenAIChatRequest,
  OpenAIChatRequestInput,
} from './openai';
import fs from 'fs';
import path from 'path';
import { Provider } from './provider';

export class Baserun {
  private _prompts: Map<string, OpenAIChatRequestInput> = new Map();
  constructor(promptsPath: string) {
    try {
      const files = fs.readdirSync(promptsPath);
      for (const file of files) {
        if (path.extname(file) === '.json') {
          try {
            const json = fs.readFileSync(path.join(promptsPath, file), 'utf-8');
            const data = JSON.parse(json);
            const promptName = path.basename(file, '.json');
            this._prompts.set(promptName, data);
          } catch (err) {
            console.error(`Unable to read prompt: ${file}`);
          }
        }
      }
    } catch (err) {
      throw new Error('Prompt path invalid.');
    }
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  buildPrompt(prompt: string, variables?: any): OpenAIChatRequest {
    const input = this._prompts.get(prompt);
    if (!input) {
      throw new Error(`Unable to find prompt: ${prompt}`);
    }
    const { config, prompts, provider } = input;
    switch (provider) {
      case Provider.OpenAI: {
        return {
          ...config,
          messages: prompts.map((prompt: OpenAIChatPrompt) =>
            evaluateOpenAIPrompt(prompt, variables),
          ),
        };
      }
    }
  }
}
