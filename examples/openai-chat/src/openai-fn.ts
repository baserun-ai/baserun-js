import OpenAI from 'openai';
import { baserun } from '../../../src/index.js';

baserun.init();

const openai = new OpenAI();

const cities = [
  'San Francisco',
  'Berlin',
  'Tokyo',
  'Paris',
  'London',
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Philadelphia',
];

const pickRandomCity = () => cities[Math.floor(Math.random() * cities.length)];

async function doItMooIt2() {
  // baserun.log('getting started', { this: 'is json' });

  const res = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `What's the weather like in ${pickRandomCity()}?`,
      },
    ],
    model: 'gpt-3.5-turbo',
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      },
    ],
    // tool_choice: {
    //   function: {
    //     name: 'get_current_weather',
    //   },
    // },
  });

  return res;
}

const getCompletion = baserun.trace(doItMooIt2, {
  name: 'lets test function calling whoooot',
  metadata: {
    weather: 'sunny',
  },
});

async function main() {
  const completion = await getCompletion();
  console.dir(completion, { depth: null });
}

main();
