import { resolveAllSync } from '../utils/resolveAll.js';

export const openai: any[] = [];
export const anthropic: any[] = [];

async function resolveOpenai() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const openaiPaths = await resolveAllSync('openai');
    await Promise.all(
      openaiPaths.map(async (path) => {
        try {
          const mod = await import(path);
          openai.push(mod.default);
        } catch (e) {
          // fail silently
        }
      }),
    );
  } catch (e) {
    // fail silently
  }
}

async function resolveAnthropic() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const anthropicPaths = await resolveAllSync('@anthropic-ai/sdk');
    await Promise.all(
      anthropicPaths.map(async (path) => {
        try {
          const mod = await import(path);
          anthropic.push(mod.default);
        } catch (e) {
          // fail silently
        }
      }),
    );
  } catch (e) {
    // fail silently
  }
}

// get them in parallel
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
await Promise.all([resolveOpenai(), resolveAnthropic()]);
