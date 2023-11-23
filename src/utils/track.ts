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
