import { OpenAIRequest, OpenAIRequestInput } from './openai';
import fs from 'fs';
import path from 'path';
import { Provider } from './provider';
import { pickKeys, templatizeString } from './template';

export type AIRequest = OpenAIRequest;
export type AIRequestInput = OpenAIRequestInput;

export class Baserun {
  private _prompts: Map<string, AIRequestInput> = new Map();
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
            console.error(`Unable to read prompt '${file}'`);
          }
        }
      }
    } catch (err) {
      throw new Error('Prompt path invalid.');
    }
  }

  buildPrompt(
    prompt: string,
    providedVariables?: Record<string, string>,
  ): AIRequest {
    const input = this._prompts.get(prompt);
    if (!input) {
      throw new Error(`Unable to find prompt '${prompt}'`);
    }

    const { provider } = input;
    switch (provider) {
      case Provider.OpenAI: {
        if ('messages' in input) {
          const { config, messages } = input;
          return {
            ...config,
            messages: messages.map(({ content, variables, ...rest }) => {
              return {
                ...rest,
                content: content
                  ? templatizeString(
                      content,
                      pickKeys(variables, providedVariables),
                    )
                  : undefined,
              };
            }),
          };
        }

        const {
          config,
          prompt: { content, variables },
        } = input;
        return {
          ...config,
          prompt: templatizeString(
            content,
            pickKeys(variables, providedVariables),
          ),
        };
      }
    }
  }
}
