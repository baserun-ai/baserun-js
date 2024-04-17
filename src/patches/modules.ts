import { resolveAllSync } from '../utils/resolveAll.js';
import getDebug from 'debug';
import { track } from '../utils/track.js';
// import OpenAI from 'openai';

const debug = getDebug('baserun:modules');

export const openai: any[] = [];
// debug({ OpenAI });
export const anthropic: any[] = [];
export const googleGenerativeAI: any[] = [];
export const llamaindex: any[] = [];

const resolveOpenai = () =>
  track(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const openaiPaths = await track(async () => {
        return resolveAllSync('openai');
      }, 'resolveAllSync(openai)');

      await Promise.all(
        openaiPaths.map(async (path) => {
          let mod;
          try {
            mod = await import(path);
            openai.push(mod.default);
          } catch (e) {
            debug(e);
          }
          if (!mod) {
            try {
              mod = module.require(path);
              openai.push(mod);
            } catch (e) {
              debug(e);
            }
          }
          if (!mod) {
            try {
              mod = require(path);
              openai.push(mod);
            } catch (e) {
              debug(e);
            }
          }
        }),
      );
    } catch (e) {
      debug(e);
    }
  }, 'resolveOpenai');

async function resolveAnthropic() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const anthropicPaths = resolveAllSync('@anthropic-ai/sdk');
    await Promise.all(
      anthropicPaths.map(async (path) => {
        try {
          const mod = await import(path);
          anthropic.push(mod.default);
        } catch (e) {
          debug(e);
        }
      }),
    );
  } catch (e) {
    debug(e);
  }
}

async function resolveGoogleGenerativeAI() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const geminiPaths = resolveAllSync('@google/generative-ai');
    await Promise.all(
      geminiPaths.map(async (path) => {
        try {
          const mod = await import(path);
          googleGenerativeAI.push(mod);
        } catch (e) {
          debug(e);
        }
      }),
    );
  } catch (e) {
    debug(e);
  }
}

async function resolveLlamaIndex() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const llamaPaths = resolveAllSync('llamaindex');
    await Promise.all(
      llamaPaths.map(async (path) => {
        try {
          const mod = await import(path);
          llamaindex.push(mod);
        } catch (e) {
          debug(e);
        }
      }),
    );
  } catch (e) {
    debug(e);
  }
}

// get them in parallel
export const modulesPromise = Promise.all([
  resolveOpenai(),
  resolveAnthropic(),
  resolveGoogleGenerativeAI(),
  resolveLlamaIndex(),
]);
