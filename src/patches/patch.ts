import { Log } from '../types';
import { getTimestamp } from '../helpers';

export type ResolverFn = (
  symbol: string,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  args: any[],
  startTime: number,
  endTime: number,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  response?: any,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  error?: any,
) => Log;

export function generatePatchedMethod(
  symbol: string,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  original: (...args: any[]) => Promise<any>,
  resolver: ResolverFn,
  log: (log: Log) => void,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  processResponse?: (response: any) => Promise<any>,
) {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  return async function (this: any, ...args: any[]) {
    const startTime = getTimestamp();
    let response = null;
    let error = null;
    try {
      const originalResponse = await original.bind(this)(...args);
      response =
        (await processResponse?.(originalResponse)) ?? originalResponse;
      return originalResponse;
    } catch (e) {
      error = e;
      throw e;
    } finally {
      const endTime = getTimestamp();
      const logEntry = resolver(
        symbol,
        args,
        startTime,
        endTime,
        response,
        error,
      );
      log(logEntry);
    }
  };
}

export function patch(
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  module: any,
  symbols: string[],
  resolver: ResolverFn,
  log: (logEntry: Log) => void,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  processResponse?: (response: any) => Promise<any>,
) {
  for (const symbol of symbols) {
    const symbolParts = symbol.split('.');
    const original = symbolParts.reduce((acc, part) => acc[part], module);
    if (symbolParts.length === 1) {
      module[symbolParts[0]] = generatePatchedMethod(
        symbol,
        original,
        resolver,
        log,
        processResponse,
      );
    } else {
      const parent = symbolParts
        .slice(0, -1)
        .reduce((acc, part) => acc[part], module);
      parent[symbolParts[symbolParts.length - 1]] = generatePatchedMethod(
        symbol,
        original,
        resolver,
        log,
        processResponse,
      );
    }
  }
}
