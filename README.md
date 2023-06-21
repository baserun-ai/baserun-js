# Baserun
Baserun is the developer platform for AI teams. Visit [https://baserun.ai](https://baserun.ai) to sign up for an account.
This repo provides utilities designed to simplify and centralize the management of prompts for Large Language Models (LLMs).

We want to standardize how prompts are configured and used in order to provide an optimal experience for developing,
iterating on, and evaluating prompts.

---

## Documentation and Usage
To get started with Baserun, you can refer to the official [documentation page](https://baserun.ai/docs).

```sh
npm install @baserun/baserun-js
# or
yarn add @baserun/baserun-js
```


```js
import { Baserun } from "baserun";

const baserun = new Baserun(path.join(__dirname, 'prompts'));
const question = 'Who is the president of the United States?';
const completionRequest = baserun.buildPrompt('assistant', {question});
const completion = await openai.createChatCompletion(completionRequest);
```