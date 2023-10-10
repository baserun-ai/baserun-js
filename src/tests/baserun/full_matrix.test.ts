/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Anthropic, HUMAN_PROMPT, AI_PROMPT } from '@anthropic-ai/sdk';
import { baserun } from 'baserun';
import {
  Configuration as EdgeConfiguration,
  OpenAIApi as EdgeOpenAIApi,
} from 'openai-edge';

import OpenAI from 'openai';
const api = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiEdge = new EdgeOpenAIApi(
  new EdgeConfiguration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

describe('Baserun end-to-end', () => {
  describe('openai-edge', () => {
    it('should suggest the Eiffel Tower', async () => {
      const completion = await openaiEdge.createCompletion({
        model: 'text-davinci-003',
        prompt: 'What are three activities to do in Paris?',
        temperature: 0.7,
      });

      const data = await completion.json();
      baserun.evals.includes('Includes Eiffel Tower', data.choices[0].text!, [
        'Eiffel Tower',
      ]);
      baserun.evals.notIncludes('AI Language check', data.choices[0].text!, [
        'AI Language',
      ]);
      await baserun.evals.modelGradedSecurity(
        'Malicious',
        data.choices[0].text!,
      );
    });

    it('should suggest the pyramid', async () => {
      const chatCompletion = await openaiEdge.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'What are three activities to do in Egypt?',
          },
        ],
        temperature: 0.7,
      });

      const data = await chatCompletion.json();
      baserun.evals.includes(
        'Includes Pyramid',
        data.choices[0].message.content!,
        ['Pyramid'],
      );
      baserun.evals.notIncludes(
        'AI Language check',
        data.choices[0].message.content!,
        ['AI Language'],
      );
      await baserun.evals.modelGradedSecurity(
        'Malicious',
        data.choices[0].message.content!,
      );
    });
  });

  describe('openai-v4', () => {
    it('should suggest the Eiffel Tower', async () => {
      const completion = await api.completions.create({
        model: 'text-davinci-003',
        temperature: 0.7,
        prompt: 'What are three activities to do in Paris?',
      });

      baserun.evals.includes(
        'Includes Eiffel Tower',
        completion.choices[0].text,
        ['Eiffel Tower'],
      );
      baserun.evals.notIncludes(
        'AI Language check',
        completion.choices[0].text,
        ['AI Language'],
      );
    });

    it('should suggest the Eiffel Tower Streaming', async () => {
      const completion = await api.completions.create({
        model: 'text-davinci-003',
        temperature: 0.7,
        prompt: 'What are three activities to do in Paris?',
        stream: true,
      });

      for await (const part of completion) {
        console.log(part.choices[0]?.text);
      }
    });

    it('should suggest the pyramid', async () => {
      const chatCompletion = await api.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: 'What are three activities to do in Egypt?',
          },
        ],
      });

      baserun.evals.includes(
        'Includes Pyramid',
        chatCompletion.choices[0].message!.content!,
        ['Pyramid'],
      );
      baserun.evals.notIncludes(
        'AI Language check',
        chatCompletion.choices[0].message!.content!,
        ['AI Language'],
      );

      baserun.log('Whatever', 'Dude');
    });

    it('should suggest the pyramid streaming', async () => {
      const chatCompletion = await api.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: 'What are three activities to do in Egypt?',
          },
        ],
        stream: true,
      });

      for await (const part of chatCompletion) {
        console.log(part.choices[0]?.delta.content);
      }

      baserun.log('Whatever', 'Dude');
    });

    it('should fail', async () => {
      const chatCompletion = await api.chat.completions.create({
        model: 'random-model',
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: 'What are three activities to do in Egypt?',
          },
        ],
      });

      baserun.evals.includes(
        'Includes Pyramid',
        chatCompletion.choices[0].message!.content!,
        ['Pyramid'],
      );
      baserun.evals.notIncludes(
        'AI Language check',
        chatCompletion.choices[0].message!.content!,
        ['AI Language'],
      );
    });
  });

  describe('anthropic', () => {
    it('dog toes', async () => {
      const stream = await anthropic.completions.create({
        model: 'claude-2',
        max_tokens_to_sample: 300,
        prompt: `${HUMAN_PROMPT} How many toes do dogs have?${AI_PROMPT}`,
        stream: true,
      });

      for await (const completion of stream) {
        console.log(completion.completion);
      }
    });

    it('should fail', async () => {
      const completion = await anthropic.completions.create({
        model: 'claude-2',
        max_tokens_to_sample: 300,
        prompt: `${HUMAN_PROMPT} How many toes do dogs have?${AI_PROMPT}`,
      });

      baserun.evals.includes('Dog toe count', completion.completion, ['18']);
      baserun.evals.notIncludes('AI Language check', completion.completion, [
        'AI Language',
      ]);
    });
  });
});
