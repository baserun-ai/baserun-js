import { AutoLLMLog } from '../types';

export enum EvalType {
  Match = 'match',
  Includes = 'includes',
  FuzzyMatch = 'fuzzy_match',
  NotMatch = 'not_match',
  NotIncludes = 'not_includes',
  NotFuzzyMatch = 'not_fuzzy_match',
  ValidJson = 'valid_json',
  Custom = 'custom',
  CustomAsync = 'custom_async',
  ModelGradedFact = 'model_graded_fact',
  ModelGradedClosedQA = 'model_graded_closedqa',
  ModelGradedSecurity = 'model_graded_security',
}

interface MembershipPayload {
  submission: string;
  expected: string[];
}

interface SubmissionPayload {
  submission: string;
}

interface ModelGradedFactPayload {
  question: string;
  expert: string;
  submission: string;
}

interface ModelGradedClosedQAPayload {
  task: string;
  submission: string;
  criterion: string;
}

export interface EvalPayload {
  [EvalType.Match]: MembershipPayload;
  [EvalType.Includes]: MembershipPayload;
  [EvalType.FuzzyMatch]: MembershipPayload;
  [EvalType.NotMatch]: MembershipPayload;
  [EvalType.NotIncludes]: MembershipPayload;
  [EvalType.NotFuzzyMatch]: MembershipPayload;
  [EvalType.ValidJson]: SubmissionPayload;
  [EvalType.Custom]: SubmissionPayload;
  [EvalType.CustomAsync]: SubmissionPayload;
  [EvalType.ModelGradedFact]: ModelGradedFactPayload & { step: AutoLLMLog };
  [EvalType.ModelGradedClosedQA]: ModelGradedClosedQAPayload & {
    step: AutoLLMLog;
  };
  [EvalType.ModelGradedSecurity]: SubmissionPayload & { step: AutoLLMLog };
}

export interface Eval<T extends EvalType> {
  name: string;
  type: T;
  eval: string;
  score?: number;
  payload: EvalPayload[T];
}
