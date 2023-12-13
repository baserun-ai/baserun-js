import { credentials, Metadata } from '@grpc/grpc-js';
import { SubmissionServiceClient } from '../v1/gen/baserun.grpc-client.js';
import { trackFnSync } from '../utils/track.js';

let submissionService: SubmissionServiceClient | undefined;

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const getOrCreateSubmissionService = trackFnSync(
  ({ apiKey, grpcTimeout }: { apiKey: string; grpcTimeout?: number }) => {
    if (submissionService) {
      return submissionService;
    }

    if (!apiKey) {
      throw new Error(
        'Baserun API key is missing. Ensure the BASERUN_API_KEY environment variable is set.',
      );
    }

    const grpcBase = process.env.BASERUN_GRPC_URI ?? 'grpc.baserun.ai:50051';
    const sslCreds = process.env.SSL_KEY_CHAIN
      ? credentials.createSsl(Buffer.from(process.env.SSL_KEY_CHAIN, 'utf-8'))
      : credentials.createSsl();

    const callCredentials = credentials.createFromMetadataGenerator(
      (_unused, callback) => {
        const metadata = new Metadata();
        metadata.add('authorization', `Bearer ${apiKey}`);
        callback(null, metadata);
      },
    );
    const channelCredentials = credentials.combineChannelCredentials(
      sslCreds,
      callCredentials,
    );

    const methods = getAllClassMethods(SubmissionServiceClient);

    // unfortunately grpc-js does not support timeouts.
    // they do support "deadline", which is not doing what we want
    // we want the code to actually timeout to not block the client's code
    for (const method of methods) {
      const oldMethod = (SubmissionServiceClient.prototype as any)[method];

      (SubmissionServiceClient.prototype as any)[method] = function (
        this: any,
        ...args: any[]
      ) {
        const boundOldMethod = oldMethod.bind(this);
        if (args.length > 0 && typeof args[1] === 'function') {
          // add timeout to callback
          const callback = args[1];
          const timeout = grpcTimeout || 20_000;
          // creating an error here to get a sack trace
          // note, that this has a non-zero runtime overhead
          const potentialError = new TimeoutError(
            `baserun: gRPC timeout for ${method} after ${timeout}ms`,
          );
          const timeoutId = setTimeout(() => {
            callback(potentialError);
          }, timeout);

          args[1] = function (...args: any[]) {
            clearTimeout(timeoutId);
            callback(...args);
          };
        }
        return boundOldMethod(...args);
      } as any;
    }

    submissionService = new SubmissionServiceClient(
      grpcBase,
      channelCredentials,
    );

    return submissionService;
  },
  'getOrCreateSubmissionService',
);

const methodDenyList = {
  constructor: true,
  __defineGetter__: true,
  __defineSetter__: true,
  hasOwnProperty: true,
  __lookupGetter__: true,
  __lookupSetter__: true,
  isPrototypeOf: true,
  propertyIsEnumerable: true,
  toString: true,
  valueOf: true,
  toLocaleString: true,
  checkOptionalUnaryResponseArguments: true,
  makeUnaryRequest: true,
};

const filter = new Map(Object.entries(methodDenyList));

function getAllClassMethods(cls: any) {
  const methods = Object.getOwnPropertyNames(cls.prototype);

  return methods.filter(
    (method) =>
      typeof cls.prototype[method] === 'function' && !filter.has(method),
  );
}
