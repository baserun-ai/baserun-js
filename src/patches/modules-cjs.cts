import getDebug from 'debug';

const debug = getDebug('baserun:modules-cjs');

export const openai: any[] = [];
export const anthropic: any[] = [];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { resolveAllSync } from '../utils/resolveAll.js';

try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const openaiPaths = resolveAllSync('openai');
  Promise.all(
    openaiPaths.map((path) => {
      try {
        const mod = module.require(path);
        openai.push(mod);
      } catch (e) {
        // fail silently
      }
    }),
  );
} catch (e) {
  debug('openai module not found');
  // fail silently
}
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const anthropicPaths = resolveAllSync('@anthropic-ai/sdk');
  Promise.all(
    anthropicPaths.map(async (path) => {
      try {
        const mod = module.require(path);
        anthropic.push(mod);
      } catch (e) {
        // fail silently
      }
    }),
  );
} catch (e) {
  debug('anthropic module not found');
  // fail silently
}
