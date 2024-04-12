import getDebug from 'debug';

const debug = getDebug('baserun:modules-cjs');

export const openai: any[] = [];
export const anthropic: any[] = [];
export const googleGenerativeAI: any[] = [];
export const llamaindex: any[] = [];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { resolveAllSync } from '../utils/resolveAll.js';

try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const openaiPaths = resolveAllSync('openai');
  openaiPaths.map((path) => {
    try {
      const mod = module.require(path);
      openai.push(mod);
    } catch (e) {
      // fail silently
    }
  });
} catch (e) {
  debug('openai module not found');
  // fail silently
}
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const anthropicPaths = resolveAllSync('@anthropic-ai/sdk');
  anthropicPaths.map((path) => {
    try {
      const mod = module.require(path);
      anthropic.push(mod);
    } catch (e) {
      // fail silently
    }
  });
} catch (e) {
  debug('anthropic module not found');
  // fail silently
}
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const geminiPaths = resolveAllSync('@google/generative-ai');
  geminiPaths.map((path) => {
    try {
      const mod = module.require(path);
      googleGenerativeAI.push(mod);
    } catch (e) {
      // fail silently
    }
  });
} catch (e) {
  debug('google/generative-ai module not found');
  // fail silently
}
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const llamaPaths = resolveAllSync('llamaindex');
  llamaPaths.map((path) => {
    try {
      const mod = module.require(path);
      llamaindex.push(mod);
    } catch (e) {
      // fail silently
    }
  });
} catch (e) {
  debug('llamaindex module not found');
  // fail silently
}


// just a polyfill
export const modulesPromise = Promise.resolve();
