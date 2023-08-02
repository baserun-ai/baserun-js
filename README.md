# Baserun

**[Baserun](https://baserun.ai)** is the collaborative workspace for AI teams. Our mission is to simplify the testing, debugging, and evaluation of LLM features to help you get your app production-ready.

## Quick Start

Install `baserun`

```bash
npm install baserun --save-dev
# or
yarn add baserun --dev
```

Get your API key from the [Baserun dashboard](https://baserun.ai/settings) and set it as an environment variable:

```bash
export BASERUN_API_KEY="your_api_key_here"
```

Use our Jest preset and start immediately logging to Baserun. By default all OpenAI completion and chat requests will be logged to Baserun. Logs are aggregated by test.

```typescript
// test_module.spec.ts

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

describe('Baserun end-to-end', () => {
  it('should suggest the Eiffel Tower', async () => {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: "What are three activities to do in Paris?"
        }
      ],
    });

    expect(chatCompletion.data.choices[0].message!.content!).toContain('Eiffel Tower');
  });
});
```

To run the test and log to baserun:

```bash
jest --preset baserun test_modules.spec.ts
...
========================Baserun========================
Test results available at: https://baserun.ai/runs/<id>
=======================================================
```

## Custom logs

### log
Logs a custom message to Baserun. If Baserun is not initialized, this function will have no effect.

#### Parameters
* message (string): The custom log message to be recorded.
* payload (string | object): The log's additional data, which can be either a string or an object.

```typescript
import baserun from 'baserun';

describe("Baserun end-to-end tests", () => {
  it('should log custom events', () => {
    ...
    baserun.log("CustomEvent", { key: "value" });
  });
})
```