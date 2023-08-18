export enum EvalType {
  Equals = 'equals',
  Match = 'match',
  Includes = 'includes',
  FuzzyMatch = 'fuzzy_match',
  NotEquals = 'not_equals',
  NotMatch = 'not_match',
  NotIncludes = 'not_includes',
  NotFuzzyMatch = 'not_fuzzy_match',
  ValidJson = 'valid_json',
  Custom = 'custom',
  CustomAsync = 'custom_async',
}

export interface Eval {
  name: string;
  type: EvalType;
  eval: string;
  payload: object;
}
