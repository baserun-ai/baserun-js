import { AutoLLMLog } from '../types.js';
import { getTimestamp } from '../utils/helpers.js';
import { track } from '../utils/track.js';
import { TemplateMessage, TemplateMessageWithMetadata } from '../templates.js';
import { Baserun } from '../baserun.js';

export type ResolverFn = (
  symbol: string,
  patchedObject: any,
  args: any[],
  startTime: Date,
  endTime: Date,
  isStream: boolean,
  response?: any,
  error?: any,
) => Promise<AutoLLMLog>;

export type generatePatchedMethodArgs = {
  symbol: string;
  original: (...args: any[]) => Promise<any>;
  resolver: ResolverFn;
  log: (log: AutoLLMLog) => Promise<void>;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  getMessages: (_symbol: string, args: any[]) => TemplateMessage[];
  preprocessArgs?: (_symbol: string, args: any[]) => any[];
  processUnawaitedResponse?: (response: any) => Promise<any>;
  processResponse?: (response: any) => Promise<any>;
};

async function handleFormattedTemplate(
  messages: TemplateMessageWithMetadata[],
) {
  // returns id of found template or undefined if not found any
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.baserunFormatMetadata) {
      const ann = Baserun.annotate();
      for (const k in msg.baserunFormatMetadata.args) {
        const v = msg.baserunFormatMetadata.args[k];
        ann.input(k, v);
      }
      await ann.submit();
      return msg.baserunFormatMetadata.templateId;
    }
  }
}

async function handleNotFormattedTemplate(messages: TemplateMessage[]) {
  for (const [, template] of Baserun.templates) {
    const templateMsgs =
      template.templateVersions[template.templateVersions.length - 1]
        .templateMessages;
    if (templateMsgs.length !== messages.length) {
      continue;
    }
    let ok = true;
    const vars: Record<string, any> = {};
    for (let i = 0; i < templateMsgs.length; i++) {
      const templateMsg = templateMsgs[i];
      const msg = messages[i];
      const escaped = templateMsg.message.replaceAll(
        /([[\].*+?^=!:${}()|\\/])/gm,
        '\\$1',
      );
      const pattern = escaped.replaceAll(
        /\\\{([a-zA-Z0-9_-]+)\\}/gm,
        '(?<$1>.*)',
      );
      // this pattern building is very, very fragile. therefore try catch is a must
      try {
        const re = new RegExp(`^${pattern}$`, 's');
        const res = re.exec(msg.content);
        if (!res) {
          ok = false;
          break;
        }
        for (const varName in res.groups) {
          vars[varName] = res.groups[varName];
        }
      } catch (e) {
        ok = false;
        break;
      }
    }
    if (ok) {
      // we can have multiple templates matches, and we have no way of knowing which one this was in reality,
      // so we're just taking the first match we encounter.
      if (Object.keys(vars).length) {
        const ann = Baserun.annotate();
        for (const varName in vars) {
          ann.input(varName, vars[varName]);
        }
        await ann.submit();
      }
      return template.id;
    }
  }
}

export async function handleTemplates(
  messages: TemplateMessage[],
): Promise<string | undefined> {
  const templateId = await handleFormattedTemplate(messages);
  if (templateId) {
    return templateId;
  }
  return await handleNotFormattedTemplate(messages);
}

export function generatePatchedMethod({
  symbol,
  original,
  resolver,
  log,
  isStreaming,
  collectStreamedResponse,
  getMessages,
  preprocessArgs,
  processUnawaitedResponse,
  processResponse,
}: generatePatchedMethodArgs) {
  return async function (this: any, ...args: any[]) {
    /* eslint-disable-next-line  @typescript-eslint/no-this-alias */
    const patchedObject = this;
    const startTime = getTimestamp();
    const isStream = isStreaming(symbol, args);
    let response = null;
    let error = null;

    const boundOriginal = original.bind(this);

    const templateId = await handleTemplates(getMessages(symbol, args));
    args = preprocessArgs ? preprocessArgs(symbol, args) : args;

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
          const streamLogEntry = await resolver(
            symbol,
            patchedObject,
            args,
            startTime,
            streamEndTime,
            isStream,
            streamResponse,
            streamError,
          );
          streamLogEntry.templateId = templateId;
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
        const logEntry = await resolver(
          symbol,
          patchedObject,
          args,
          startTime,
          endTime,
          isStream,
          response,
          error,
        );
        logEntry.templateId = templateId;
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
  isStreaming,
  collectStreamedResponse,
  getMessages,
  preprocessArgs,
  processUnawaitedResponse,
  processResponse,
}: {
  module: any;
  symbols: string[];
  resolver: ResolverFn;
  log: (logEntry: AutoLLMLog) => Promise<void>;
  isStreaming: (_symbol: string, args: any[]) => boolean;
  collectStreamedResponse: (symbol: string, response: any, chunk: any) => any;
  getMessages: (_symbol: string, args: any[]) => TemplateMessage[];
  preprocessArgs?: (_symbol: string, args: any[]) => any[];
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
        getMessages,
        preprocessArgs,
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
        getMessages,
        preprocessArgs,
        processUnawaitedResponse,
        processResponse,
      });
    }
  }
}
