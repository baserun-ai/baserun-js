import stringify from 'json-stringify-safe';
import {
  CompletionAnnotations,
  Check,
  Log,
  Feedback,
  Run,
  SubmitAnnotationsRequest,
} from './v1/gen/baserun.js';
import { Baserun } from './baserun.js';

const DEFAULT_RUN_NAME = 'annotation';

type FeedbackOptions = {
  thumbsup?: boolean;
  stars?: number;
  score?: number;
  metadata?: Record<string, any>;
};

export class Annotation {
  private run: Run;
  private completionId: string;
  private logs: Log[];
  private checks: Check[];
  private feedbackList: Feedback[];

  constructor(completionId = '', run?: Run) {
    this.run = run || Baserun.getOrCreateCurrentRun({ name: DEFAULT_RUN_NAME });
    this.completionId = completionId;
    this.logs = [];
    this.checks = [];
    this.feedbackList = [];
  }

  feedback(name?: string, options?: FeedbackOptions) {
    let { score } = options || {};
    const { thumbsup, stars, metadata } = options || {};

    if (score === undefined) {
      if (thumbsup !== undefined) {
        score = thumbsup ? 1 : 0;
      } else if (stars !== undefined) {
        score = stars / 5;
      } else {
        console.info(
          'Could not calculate feedback score, please pass a score, thumbsup, or stars',
        );
        score = 0;
      }
    }

    // TODO: why not use this.run?
    const run = Baserun.getOrCreateCurrentRun({ name: DEFAULT_RUN_NAME });
    const feedback: Feedback = {
      name: name ?? 'General Feedback',
      score,
      metadata: stringify(metadata ?? {}),
      endUser: undefined,
    };
    if (run.sessionId) {
      const endUser = Baserun.sessionLocalStorage.getStore()?.session?.endUser;
      if (endUser) {
        feedback.endUser = endUser;
      }
    }
    this.feedbackList.push(feedback);
  }

  check(
    name: string,
    methodology: string,
    expected: Record<string, any>,
    actual: Record<string, any>,
    score?: number,
    metadata?: Record<string, any>,
  ) {
    const check: Check = {
      name,
      methodology,
      expected: stringify(expected),
      actual: stringify(actual),
      score: score ?? 0,
      metadata: stringify(metadata ?? {}),
    };
    this.checks.push(check);
  }

  checkIncludes(
    name: string,
    expected: string | string[],
    actual: string,
    metadata?: Record<string, any>,
  ) {
    let expectedList: string[] = [];

    if (Array.isArray(expected)) {
      expectedList = expected;
    } else {
      expectedList = [expected];
    }
    const result = !!expectedList.filter(
      (item) => actual.toLowerCase().indexOf(item.toLowerCase()) > -1,
    ).length;

    this.check(
      name,
      'includes',
      { value: expected },
      { value: actual },
      result ? 1 : 0,
      metadata,
    );
  }

  log(name: string, metadata: Record<string, any>) {
    const log: Log = {
      runId: this.run?.runId ?? '',
      name,
      payload: stringify(metadata ?? {}),
    };
    this.logs.push(log);
  }

  submit() {
    const { completionId, checks, logs, feedbackList, run } = this;
    const annotationMessage: CompletionAnnotations = {
      completionId,
      checks,
      logs,
      feedback: feedbackList,
    };
    const request: SubmitAnnotationsRequest = {
      annotations: annotationMessage,
      run,
    };
    return new Promise((resolve, reject) => {
      Baserun.submissionService.submitAnnotations(request, (error) => {
        if (error) {
          console.error('Failed to submit annotation to Baserun: ', error);
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
