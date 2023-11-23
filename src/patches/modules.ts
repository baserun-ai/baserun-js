import { resolveAllSync } from '../utils/resolveAll.js';
import getDebug from 'debug';
// import OpenAI from 'openai';

const debug = getDebug('baserun:modules');

export const openai: any[] = [];
// debug({ OpenAI });
export const anthropic: any[] = [];

async function resolveOpenai() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const openaiPaths = resolveAllSync('openai');
    await Promise.all(
      openaiPaths.map(async (path) => {
        let mod;
        try {
          mod = await import(path);
          debug('imported', mod, mod.default);
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
}

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

// get them in parallel
export const modulesPromise = Promise.all([
  resolveOpenai(),
  resolveAnthropic(),
]);
