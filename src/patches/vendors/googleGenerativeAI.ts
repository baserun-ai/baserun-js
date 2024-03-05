import {
  AutoLLMLog,
  BaserunProvider,
  BaserunStepType,
  BaserunType,
  LLMChatLog,
  Message,
} from '../../types.js';
import { DEFAULT_USAGE } from '../constants.js';
import { patch } from '../patch.js';
import { googleGenerativeAI, modulesPromise } from '../modules.js';
import {
  ChatSession,
  Content,
  EnhancedGenerateContentResponse,
  GenerateContentRequest,
  GenerateContentStreamResult,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import { getTimestamp } from '../../utils/helpers.js';

export class GoogleGenerativeAIWrapper {
  static async resolver(
    _symbol: string,
    patchedObject: GenerativeModel | ChatSession,
    args: any[],
    startTimestamp: Date,
    completionTimestamp: Date,
    isStream: boolean,
    response_?: { response: Promise<EnhancedGenerateContentResponse> },
    error?: any,
  ) {
    const type = BaserunType.Chat;
    const response = await response_?.response;
    let respContent: string | undefined = undefined;
    try {
      respContent = response?.text();
    } catch (err) {
      // it's not possible to have both response and error defined, so we're not losing any error info here
      error = err;
    }
    const isChat = 'sendMessage' in patchedObject;

    const promptMessages: Message[] = [];
    const input: GenerateContentRequest | string | Array<string | Part> =
      args[0];
    if (!isChat) {
      promptMessages.push(
        ...GoogleGenerativeAIWrapper.contentToMessages(
          GoogleGenerativeAIWrapper.formatGenerateContent(input),
        ),
      );
    } else {
      const history = await patchedObject.getHistory();
      // we don't need input from args as it's already in the chat history. and we're removing last entry as it's a response
      if (!error) history.pop();
      //  ... unless there was an error. because then it probably won't be there. and neither the input
      else
        history.push(...GoogleGenerativeAIWrapper.formatGenerateContent(input));
      promptMessages.push(
        ...GoogleGenerativeAIWrapper.contentToMessages(history),
      );
    }

    const generationConfig = isChat
      ? patchedObject.params?.generationConfig
      : patchedObject.generationConfig;
    const config = {
      model: patchedObject.model,
      top_p: generationConfig?.topP,
      top_k: generationConfig?.topK,
      max_tokens: generationConfig?.maxOutputTokens,
      temperature: generationConfig?.temperature,
      stream: isStream,
    };

    if (error) {
      const errorMessage = error?.stack ?? error?.toString() ?? '';
      return {
        stepType: BaserunStepType.AutoLLM,
        type,
        provider: BaserunProvider.GoogleGenerativeAI,
        startTimestamp,
        completionTimestamp,
        usage: DEFAULT_USAGE,
        promptMessages: promptMessages,
        config,
        isStream,
        errorStack: errorMessage,
      } as AutoLLMLog;
    }

    return {
      stepType: BaserunStepType.AutoLLM,
      type,
      provider: BaserunProvider.GoogleGenerativeAI,
      startTimestamp,
      completionTimestamp,
      usage: DEFAULT_USAGE,
      promptMessages: promptMessages,
      config,
      isStream,
      choices: [
        {
          content: respContent,
          finish_reason: response?.candidates?.[0].finishReason,
        },
      ],
    } as LLMChatLog;
  }

  static generateContentStreamWrapper(
    original: (...args: any[]) => Promise<GenerateContentStreamResult>,
    log: (log: AutoLLMLog) => Promise<void>,
  ) {
    return async function (this: GenerativeModel, ...args: any[]) {
      /* eslint-disable-next-line  @typescript-eslint/no-this-alias */
      const patchedObject = this;
      const startTime = getTimestamp();
      const boundOriginal = original.bind(this);
      try {
        const resp = await boundOriginal(...args);
        /* eslint-disable-next-line  no-inner-declarations */
        async function* streamingWrapper() {
          let streamError = null;
          try {
            for await (const chunk of resp.stream) {
              yield chunk;
            }
          } catch (streamE) {
            streamError = streamE;
            throw streamE;
          } finally {
            const streamEndTime = getTimestamp();
            const streamLogEntry = await GoogleGenerativeAIWrapper.resolver(
              'GenerativeModel.prototype.generateContentStream',
              patchedObject,
              args,
              startTime,
              streamEndTime,
              true,
              resp,
              streamError,
            );
            await log(streamLogEntry);
          }
        }

        return {
          response: resp.response,
          stream: streamingWrapper(),
        };
      } catch (error) {
        const streamEndTime = getTimestamp();
        const streamLogEntry = await GoogleGenerativeAIWrapper.resolver(
          'GenerativeModel.prototype.generateContentStream',
          patchedObject,
          args,
          startTime,
          streamEndTime,
          true,
          undefined,
          error,
        );
        await log(streamLogEntry);
        throw error;
      }
    };
  }

  static async init(log: (entry: AutoLLMLog) => Promise<void>) {
    await modulesPromise;
    for (const mod of googleGenerativeAI) {
      GoogleGenerativeAIWrapper.patch(mod, log);
    }
  }

  static patch(mod: any, log: (entry: AutoLLMLog) => Promise<void>) {
    try {
      patch({
        module: mod,
        symbols: [
          'GenerativeModel.prototype.generateContent',
          'ChatSession.prototype.sendMessage',
        ],
        resolver: GoogleGenerativeAIWrapper.resolver,
        log,
        isStreaming: () => false,
        collectStreamedResponse: () => {},
      });
      // not using path.ts helper functions in ths case. it's too much work to adjust it
      mod.GenerativeModel.prototype.generateContentStream =
        GoogleGenerativeAIWrapper.generateContentStreamWrapper(
          mod.GenerativeModel.prototype.generateContentStream,
          log,
        );
      mod.ChatSession.prototype.sendMessageStream =
        GoogleGenerativeAIWrapper.generateContentStreamWrapper(
          mod.ChatSession.prototype.sendMessageStream,
          log,
        );
    } catch (err) {
      /* @google/generative-ai isn't used */
      // not entirely sure if that's actually possible but that's what's done in wrappers to other vendors' libs
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'MODULE_NOT_FOUND'
      ) {
        return;
      }

      throw err;
    }
  }

  static formatContent(request: string | Array<string | Part>, role: string) {
    let newParts = [];
    if (typeof request === 'string') {
      newParts = [{ text: request }];
    } else {
      for (const partOrString of request) {
        if (typeof partOrString === 'string') {
          newParts.push({ text: partOrString });
        } else {
          newParts.push(partOrString);
        }
      }
    }
    return { role, parts: newParts };
  }

  static formatGenerateContent(
    request: GenerateContentRequest | string | Array<string | Part>,
  ) {
    if (typeof request == 'string' || !('contents' in request)) {
      return [GoogleGenerativeAIWrapper.formatContent(request, 'user')];
    }
    return request.contents.map((v) =>
      GoogleGenerativeAIWrapper.formatContent(v.parts, v.role),
    );
  }

  static contentToMessages(content: Content[]) {
    // InlineDataPart has text always undefined. this means we're effectively skipping these
    //  which is a reasonable thing to do as baserun span doesn't currently accept such input
    return content.map((v) => ({
      role: v.role,
      content: v.parts.map((p) => p.text).join(''),
      finish_reason: '',
    }));
  }
}
