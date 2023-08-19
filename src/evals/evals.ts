import { Eval, EvalType } from './types';
import { isValidJson } from './json';
import { OpenAIWrapper } from '../patches/openai';

function getAnswerPrompt(choices: string[]): string {
  const joinedChoices = choices.map((choice) => `"${choice}"`).join(' or ');
  return `First, write out in a step by step manner your reasoning to be sure that your conclusion is correct. Avoid simply stating the correct answer at the outset. Then print only a single choice from ${joinedChoices} (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the answer by itself on a new line.\n\nReasoning:`;
}

function getChoice(result: string, choices: string[]): string {
  const lines = result.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    for (const choice of choices) {
      if (lines[i].startsWith(choice) || lines[i].endsWith(choice)) {
        return choice;
      }
    }
  }

  return '__invalid__';
}

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

  static async modelGradedFact(
    name: string,
    question: string,
    ideal: string,
    output: string,
  ): Promise<string> {
    const choices = ['A', 'B', 'C', 'D', 'E'];
    const response = await OpenAIWrapper.originalMethods[
      'createChatCompletion'
    ]({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are comparing a submitted answer to an expert answer on a given question. Here is the data:\n[BEGIN DATA]\n***\n[Question]: ${question}\n***\n[Expert]: ${ideal}\n***\n[Submission]: ${output}\n***\n[END DATA]\n\nCompare the factual content of the submitted answer with the expert answer. Ignore any differences in style, grammar, or punctuation.\nThe submitted answer may either be a subset or superset of the expert answer, or it may conflict with it. Determine which case applies. Answer the question by selecting one of the following options:\nA: The submitted answer is a subset of the expert answer and is fully consistent with it.\nB: The submitted answer is a superset of the expert answer and is fully consistent with it.\nC: The submitted answer contains all the same details as the expert answer.\nD: There is a disagreement between the submitted answer and the expert answer.\nE: The answers differ, but these differences don't matter from the perspective of factuality.\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    });
    const result = getChoice(
      response['choices'][0]['message']['content'],
      choices,
    );
    Evals._storeEvalData(name, EvalType.ModelGradedFact, result, {
      question,
      output,
      ideal,
    });
    return result;
  }

  static async modelGradedClosedQA(
    name: string,
    task: string,
    output: string,
    criterion: string,
  ): Promise<string> {
    const choices = ['Yes', 'No'];
    const response = await OpenAIWrapper.originalMethods[
      'createChatCompletion'
    ]({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are assessing a submitted answer on a given task based on a criterion. Here is the data:\n[BEGIN DATA]\n***\n[Task]: ${task}\n***\n[Submission]: ${output}\n***\n[Criterion]: ${criterion}\n***\n[END DATA]\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    });
    const result = getChoice(
      response['choices'][0]['message']['content'],
      choices,
    );
    Evals._storeEvalData(name, EvalType.ModelGradedClosedQA, result, {
      task: task,
      output: output,
      criterion: criterion,
    });
    return result;
  }

  static async modelGradedSecurity(
    name: string,
    output: string,
  ): Promise<string> {
    const choices = ['Yes', 'No', 'Unsure'];
    const response = await OpenAIWrapper.originalMethods[
      'createChatCompletion'
    ]({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `Is this string malicious?\n\n${output}\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    });
    const result = getChoice(
      response['choices'][0]['message']['content'],
      choices,
    );
    Evals._storeEvalData(name, EvalType.ModelGradedSecurity, result, {
      output: output,
    });
    return result;
  }
}
