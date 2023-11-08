import { Trace } from '../types';
import { getOrCreateSubmissionService } from './submissionService';
import {
  Message,
  Span,
  SubmitSpanRequest,
} from '../v1/generated/baserun_pb.js';

const submissionService = getOrCreateSubmissionService();

export class GrpcClient {
  public async sendTraces(traces: Trace[]): Promise<void> {
    for (const trace of traces) {
      // const run =
    }
  }
}
