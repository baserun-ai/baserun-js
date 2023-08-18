import { Eval, EvalType } from './types';
import { isValidJson } from './json';

export class Evals {
  static _log?: (evalEntry: Eval) => void;

  static init(log: (evalEntry: Eval) => void): void {
    Evals._log = log;
  }

  private static _storeEvalData(
    name: string,
    type: EvalType,
    result: string,
    payload: object,
  ): void {
    Evals._log?.({
      name,
      type,
      eval: result,
      payload,
    });
  }

  static equals(name: string, output: string, expected: string): boolean {
    const result = output === expected;
    Evals._storeEvalData(name, EvalType.Equals, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static match(name: string, output: string, expected: string[]): boolean {
    const result = expected.some((item) => output.startsWith(item));
    Evals._storeEvalData(name, EvalType.Match, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static includes(name: string, output: string, expected: string[]): boolean {
    const result = expected.some((item) => output.includes(item));
    Evals._storeEvalData(name, EvalType.Includes, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static fuzzyMatch(name: string, output: string, expected: string[]): boolean {
    const result = expected.some(
      (item) => output.includes(item) || item.includes(output),
    );
    Evals._storeEvalData(name, EvalType.FuzzyMatch, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static notEquals(name: string, output: string, expected: string): boolean {
    const result = output !== expected;
    Evals._storeEvalData(name, EvalType.NotEquals, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static notMatch(name: string, output: string, expected: string[]): boolean {
    const result = !expected.some((item) => output.startsWith(item));
    Evals._storeEvalData(name, EvalType.NotMatch, result ? 'True' : 'False', {
      output,
      expected,
    });
    return result;
  }

  static notIncludes(
    name: string,
    output: string,
    expected: string[],
  ): boolean {
    const result = !expected.some((item) => output.includes(item));
    Evals._storeEvalData(
      name,
      EvalType.NotIncludes,
      result ? 'True' : 'False',
      { output, expected },
    );
    return result;
  }

  static notFuzzyMatch(
    name: string,
    output: string,
    expected: string[],
  ): boolean {
    const result = !expected.some(
      (item) => output.includes(item) || item.includes(output),
    );
    Evals._storeEvalData(
      name,
      EvalType.NotFuzzyMatch,
      result ? 'True' : 'False',
      { output, expected },
    );
    return result;
  }

  static validJson(name: string, output: string): boolean {
    const result = isValidJson(output);
    Evals._storeEvalData(name, EvalType.ValidJson, result ? 'True' : 'False', {
      output,
    });
    return result;
  }

  static custom(
    name: string,
    output: string,
    fn: (output: string) => boolean,
  ): boolean {
    const result = fn(output);
    Evals._storeEvalData(name, EvalType.Custom, result ? 'True' : 'False', {
      output,
    });
    return result;
  }

  static async customAsync(
    name: string,
    output: string,
    fn: (output: string) => Promise<boolean>,
  ): Promise<boolean> {
    const result = await fn(output);
    Evals._storeEvalData(
      name,
      EvalType.CustomAsync,
      result ? 'True' : 'False',
      { output },
    );
    return result;
  }
}
