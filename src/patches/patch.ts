import { AutoLLMLog } from '../types.js';
import { getTimestamp } from '../utils/helpers.js';
import { track } from '../utils/track.js';

export type ResolverFn = (
  symbol: string,
  args: any[],
  startTime: Date,
  endTime: Date,
  isStream: boolean,
  response?: any,
  error?: any,
) => AutoLLMLog;

export function generatePatchedMethod({
  symbol,
  original,
  resolver,
  log,
  isStreaming,
  collectStreamedResponse,
  processUnawaitedResponse,
  processResponse,
}: {
  symbol: string;
  original: (...args: any[]) => Promise<any>;
  resolver: ResolverFn;
  log: (log: AutoLLMLog) => Promise<void>;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  processUnawaitedResponse?: (response: any) => Promise<any>;
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
          const unawaitedResponse = boundOriginal(...args);
          const originalResponse = await (processUnawaitedResponse?.(
            unawaitedResponse,
          ) ?? unawaitedResponse);
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
            isStream,
            streamResponse,
            streamError,
          );
          await log(streamLogEntry);
        }
      }

      return streamingWrapper();
    } else {
      try {
        const unawaitedResponse = boundOriginal(...args);
        const originalResponse = await track(
          () =>
            processUnawaitedResponse?.(unawaitedResponse) ?? unawaitedResponse,
          `patch: ${symbol}`,
        );
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
          isStream,
          response,
          error,
        );
        await track(() => log(logEntry), 'patch: log');
      }
    }
  };
}

export function patch({
  module,
  symbols,
  resolver,
  log,
  processUnawaitedResponse,
  processResponse,
  isStreaming,
  collectStreamedResponse,
}: {
  module: any;
  symbols: string[];
  resolver: ResolverFn;
  log: (logEntry: AutoLLMLog) => Promise<void>;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  processUnawaitedResponse?: (response: any) => Promise<any>;
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
        processUnawaitedResponse,
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
        processUnawaitedResponse,
        processResponse,
      });
    }
  }
}
