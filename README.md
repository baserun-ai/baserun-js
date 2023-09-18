# Baserun


[![](https://img.shields.io/badge/Visit%20Us-baserun.ai-brightgreen)](https://baserun.ai)
[![](https://img.shields.io/badge/View%20Documentation-Docs-yellow)](https://docs.baserun.ai)
[![](https://img.shields.io/badge/Join%20our%20community-Discord-blue)](https://discord.gg/xEPFsvSmkb)
[![Twitter](https://img.shields.io/twitter/follow/baserun.ai?style=social)](https://twitter.com/baserunai)

**[Baserun](https://baserun.ai)** is the testing and observability platform for LLM apps.

## Quick Start

### 1. Install Baserun

```bash
npm install baserun --save-dev
# or
yarn add baserun --dev
```

### 2. Generate an API key
Create an account at [https://baserun.ai](https://baserun.ai). Then generate an API key for your project in the [settings](https://baserun.ai/settings) tab and set it as an environment variable.

```bash
export BASERUN_API_KEY="your_api_key_here"
```

### 3. Start testing

Use our [Jest](https://jestjs.io/docs) preset and start immediately logging to Baserun. By default all OpenAI completion and chat requests will be logged to Baserun. Logs are aggregated by test.

```typescript
// test_module.spec.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

describe('Baserun end-to-end', () => {
  it('should suggest the Eiffel Tower', async () => {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: "What are three activities to do in Paris?"
        }
      ],
    });

    expect(chatCompletion.choices[0].message!.content!).toContain('Eiffel Tower');
  });
});
```

To run the test and log to baserun:

```bash
jest --preset baserun test_module.spec.ts
...
========================Baserun========================
Test results available at: https://baserun.ai/runs/<id>
=======================================================
```

### Existing presets

If you are already using a Jest preset such as ts-jest you will need to merge the presets in a Jest config

```js
// jest.config.js or jest.config.baserun.js

const tsPreset = require('ts-jest/jest-preset')
const baserunPreset = require('baserun/jest-preset')

module.exports = {
    ...tsPreset,
    ...baserunPreset,
    testTimeout: 10000,
}
```

Then to run a test and log to baserun:

```bash
jest test_modules.spec.ts
...
========================Baserun========================
Test results available at: https://baserun.ai/runs/<id>
=======================================================
```

## Documentation
For a deeper dive on all capabilities and more advanced usage, please refer to our [Documentation](https://docs.baserun.ai).

## License

[MIT License](https://github.com/baserun-ai/baserun-js/blob/main/LICENSE)