# Baserun

[![](https://img.shields.io/badge/Visit%20Us-baserun.ai-brightgreen)](https://baserun.ai)
[![](https://img.shields.io/badge/View%20Documentation-Docs-yellow)](https://docs.baserun.ai)
[![](https://img.shields.io/badge/Join%20our%20community-Discord-blue)](https://discord.gg/xEPFsvSmkb)
[![Twitter](https://img.shields.io/twitter/follow/baserun.ai?style=social)](https://twitter.com/baserunai)

**[Baserun](https://baserun.ai)** is the testing and observability platform for LLM apps.

## Quick Start

### 1. Install Baserun

```bash
npm install baserun
# or
yarn add baserun
```

### 2. Generate an API key

Create an account at [https://baserun.ai](https://baserun.ai). Then generate an API key for your project in the [settings](https://baserun.ai/settings) tab and set it as an environment variable.

```bash
export BASERUN_API_KEY="your_api_key_here"
```

### 3. Start monitoring

```typescript
import OpenAI from 'openai';
import { baserun } from 'baserun';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

await baserun.init();

const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  messages: [
    {
      role: 'user',
      content: 'What are three activities to do in Paris?',
    },
  ],
});
```

### 4. Check out the logs

Now head over to [https://www.baserun.ai/monitoring/traces](https://www.baserun.ai/monitoring/traces) and have a look at the logs that were just created.

## Documentation

For a deeper dive on all capabilities and more advanced usage, please refer to our [Documentation](https://docs.baserun.ai).

## License

[MIT License](https://github.com/baserun-ai/baserun-js/blob/main/LICENSE)
