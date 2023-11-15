import { credentials, Metadata } from '@grpc/grpc-js';
import { SubmissionServiceClient } from '../v1/gen/baserun.grpc-client.js';

let submissionService: SubmissionServiceClient | undefined;

export function getOrCreateSubmissionService() {
  if (submissionService) {
    return submissionService;
  }

  if (!process.env.BASERUN_API_KEY) {
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
      metadata.add('authorization', `Bearer ${process.env.BASERUN_API_KEY}`);
      callback(null, metadata);
    },
  );
  const channelCredentials = credentials.combineChannelCredentials(
    sslCreds,
    callCredentials,
  );

  submissionService = new SubmissionServiceClient(grpcBase, channelCredentials);

  return submissionService;
}
