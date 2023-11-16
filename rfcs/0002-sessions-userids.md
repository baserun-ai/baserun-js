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
  const { result, sessionId } = await baserun.session({
    user: 'bob@alice.com',
    async session(b) {
      const chatCompletion = await b.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Return a json object`,
          },
        ],
      });

      b.checks.json(chatCompletion.id, chatCompletion.choices[0].content);
      return chatCompletion;
    },
  });

  // we can continue a session later
  const { result: result2 } = await baserun.session(
    async () => {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Return a json object`,
          },
        ],
      });

      baserun.log(
        `In case we want to log without creating a trace, Baserun will create the trace in the session context`,
      );

      baserun.checks.json(chatCompletion.id, chatCompletion.choices[0].content);
      return chatCompletion;
    },
    {
      user: 'bob@alice.com',
      sessionId,
    },
  );

  // one session can also have multiple traces inside of it
  const { result: result3 } = await baserun.session(
    async () => {
      await baserun.trace(async () => {
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Return a json object`,
            },
          ],
        });
        baserun.checks.json(
          chatCompletion.id,
          chatCompletion.choices[0].content,
        );
        baserun.log('We can log inside this trace here');
      }, 'this trace is all about getting json');

      await baserun.trace(async () => {
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Return "my-regex"`,
            },
          ],
        });
        baserun.checks.regex(
          chatCompletion.id,
          chatCompletion.choices[0].content,
          /my-regex/,
        );
      }, 'in this trace we just want to focus on regexes');
    },
    {
      user: 'bob@alice.com',
      sessionId,
    },
  );
}

main();
```

### No-callback design

```ts
import { baserun } from 'baserun';
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const { result, sessionId } = await baserun.session({
    user: 'bob@alice.com',
    async session(b) {
      const chatCompletion = await b.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Return a json object`,
          },
        ],
      });

      b.checks.json(chatCompletion.id, chatCompletion.choices[0].content);
      return chatCompletion;
    },
  });
}

main();
```

# Motivation

Sessions enable to have a view across multiple traces.

# Detailed design

Baserun under the hood will associate the check with the sessions so you can see the check associated in the Baserun dashboard.

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
