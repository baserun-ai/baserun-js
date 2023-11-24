<!-- Adopted from https://github.com/reactjs/rfcs/blob/main/0000-template.md -->

- Start Date: (fill me in with today's date, YYYY-MM-DD)
- RFC PR: (leave this empty)
- Issue: (leave this empty)

# Summary

Brief explanation of the feature.

# Basic example

```ts
import { baserun } from 'baserun';
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Return a json object`,
      },
    ],
  });

  baserun.checks.json(chatCompletion.id, chatCompletion.choices[0].content);
}

main();
```

# Motivation

Checks enable to both at test and production time make sure that the response of an LLM is what we expect it to respond.
That can be a regex, json or other check to make sure this unwieldy beast of an LLM is not getting out of hand.

# Detailed design

Baserun under the hood will associate the check with the completion so you can see the check associated in the Baserun dashboard.

# Drawbacks

TBD

# Alternatives

TBD

# Adoption strategy

TBD

# How we teach this

TBD

# Unresolved questions

TBD
