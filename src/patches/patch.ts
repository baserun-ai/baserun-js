import { Log } from '../types';
import { getTimestamp } from '../helpers';

export type ResolverFn = (
  symbol: string,
  args: any[],
  startTime: number,
  endTime: number,
  response?: any,
  error?: any,
) => Log;

export function generatePatchedMethod({
  symbol,
  original,
  resolver,
  log,
  isStreaming,
  collectStreamedResponse,
  processResponse,
}: {
  symbol: string;
  original: (...args: any[]) => Promise<any>;
  resolver: ResolverFn;
  log: (log: Log) => void;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  processResponse?: (response: any) => Promise<any>;
}) {
  return async function (this: any, ...args: any[]) {
    const startTime = getTimestamp();
    const isStream = isStreaming(symbol, args);
    let response = null;
    let error = null;
    const boundOriginal = original.bind(this);

    if (isStream) {
      /* eslint-disable-next-line  no-inner-declarations */
      async function* streamingWrapper() {
        let streamResponse = null;
        let streamError = null;
        try {
          let collectedResponse = null;
          const originalResponse = await boundOriginal(...args);
          streamResponse =
            (await processResponse?.(originalResponse)) ?? originalResponse;
          for await (const chunk of streamResponse) {
            collectedResponse = collectStreamedResponse(
              symbol,
              collectedResponse,
              chunk,
            );
            yield chunk;
          }
          streamResponse = collectedResponse;
        } catch (streamE) {
          streamError = streamE;
          throw streamE;
        } finally {
          const streamEndTime = getTimestamp();
          const streamLogEntry = resolver(
            symbol,
            args,
            startTime,
            streamEndTime,
            streamResponse,
            streamError,
          );
          log(streamLogEntry);
        }
      }

      return streamingWrapper();
    } else {
      try {
        const originalResponse = await boundOriginal(...args);
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
    }
  };
}

export function patch({
  module,
  symbols,
  resolver,
  log,
  processResponse,
  isStreaming,
  collectStreamedResponse,
}: {
  module: any;
  symbols: string[];
  resolver: ResolverFn;
  log: (logEntry: Log) => void;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  processResponse?: (response: any) => Promise<any>;
}) {
  for (const symbol of symbols) {
    const symbolParts = symbol.split('.');
    const original = symbolParts.reduce((acc, part) => acc[part], module);
    if (symbolParts.length === 1) {
      module[symbolParts[0]] = generatePatchedMethod({
        symbol,
        original,
        resolver,
        log,
        isStreaming,
        collectStreamedResponse,
        processResponse,
      });
    } else {
      const parent = symbolParts
        .slice(0, -1)
        .reduce((acc, part) => acc[part], module);
      parent[symbolParts[symbolParts.length - 1]] = generatePatchedMethod({
        symbol,
        original,
        resolver,
        log,
        isStreaming,
        collectStreamedResponse,
        processResponse,
      });
    }
  }
}
