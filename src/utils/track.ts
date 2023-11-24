import { performance } from 'node:perf_hooks';
import getDebug from 'debug';
const debug = getDebug('baserun:track');

export async function track<R>(
  fn: (...args: any[]) => Promise<R>,
  name?: string,
): Promise<R> {
  const start = performance.now();
  const result = await fn();

  const end = performance.now();
  debug(`${name || fn.name}: ${end - start}ms ✅`);
  return result;
}

export function trackSync<R>(fn: (...args: any[]) => R, name?: string): R {
  const start = performance.now();
  const result = fn();

  const end = performance.now();
  debug(`${name || fn.name}: ${end - start}ms ✅`);
  return result;
}

export function trackFnSync<R>(
  fn: (...args: any[]) => R,
  name?: string,
): (...args: any[]) => R {
  return (...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);

    const end = performance.now();
    debug(`${name || fn.name}: ${end - start}ms ✅`);
    return result;
  };
}
