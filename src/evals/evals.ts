import {
  Eval,
  EvalPayloadWithStep,
  EvalType,
  EvalPayload,
  ModelGradedEvalTypes,
} from './types';
import { isValidJson } from './json';
import { OpenAIWrapper, getChoiceMessages } from '../patches/openai';
import { BaserunProvider, BaserunStepType, BaserunType } from '../types';
import { DEFAULT_USAGE } from '../patches/constants';
import { getTimestamp } from '../utils/helpers';

function getAnswerPrompt(choices: string[]): string {
  const joinedChoices = choices.map((choice) => `"${choice}"`).join(' or ');
  return `First, write out in a step by step manner your reasoning to be sure that your conclusion is correct. Avoid simply stating the correct answer at the outset. Then print only a single choice from ${joinedChoices} (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the answer by itself on a new line.\n\nReasoning:`;
}

function getChoice(
  result: string,
  choices: string[],
): (typeof choices)[number] | '__invalid__' {
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

function getChoiceWithoutScore(
  choices: string[],
): (output: string) => { choice: string; score?: number } {
  return (output: string) => {
    return { choice: getChoice(output, choices) };
  };
}

function getChoiceAndScore(choiceScores: {
  [choice: string]: number;
}): (output: string) => { choice: string; score: number } {
  return (output: string) => {
    const choice = getChoice(output, Object.keys(choiceScores));
    const score =
      choice in choiceScores
        ? choiceScores[choice]
        : Math.min(...Object.values(choiceScores));
    return { choice, score };
  };
}

export class Evals {
  private readonly _log: (evalEntry: Eval<any>) => void;

  constructor(log: (evalEntry: Eval<any>) => void) {
    this._log = log;
  }

  private _storeEvalData<T extends EvalType>({
    name,
    type,
    result,
    score,
    payload,
  }: {
    name: string;
    type: T;
    result: string;
    score?: number;
    payload: EvalPayload<T>;
  }): void {
    this._log({
      name,
      type,
      eval: result,
      score,
      payload,
    });
  }

  match(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = expectedArray.some((item) => submission.startsWith(item));
    this._storeEvalData({
      name,
      type: EvalType.Match,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
        expected: expectedArray,
      },
    });
    return result;
  }

  includes(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = expectedArray.some((item) => submission.includes(item));
    this._storeEvalData({
      name,
      type: EvalType.Includes,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
        expected: expectedArray,
      },
    });
    return result;
  }

  fuzzyMatch(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = expectedArray.some(
      (item) => submission.includes(item) || item.includes(submission),
    );
    this._storeEvalData({
      name,
      type: EvalType.FuzzyMatch,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
        expected: expectedArray,
      },
    });
    return result;
  }

  notMatch(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = !expectedArray.some((item) => submission.startsWith(item));
    this._storeEvalData({
      name,
      type: EvalType.NotMatch,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
        expected: expectedArray,
      },
    });
    return result;
  }

  notIncludes(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = !expectedArray.some((item) => submission.includes(item));
    this._storeEvalData({
      name,
      type: EvalType.NotIncludes,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: { submission, expected: expectedArray },
    });
    return result;
  }

  notFuzzyMatch(
    name: string,
    submission: string,
    expected: string | string[],
  ): boolean {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const result = !expectedArray.some(
      (item) => submission.includes(item) || item.includes(submission),
    );
    this._storeEvalData({
      name,
      type: EvalType.NotFuzzyMatch,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: { submission, expected: expectedArray },
    });
    return result;
  }

  validJson(name: string, submission: string): boolean {
    const result = isValidJson(submission);
    this._storeEvalData({
      name,
      type: EvalType.ValidJson,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
      },
    });
    return result;
  }

  custom(
    name: string,
    submission: string,
    fn: (submission: string) => boolean,
  ): boolean {
    const result = fn(submission);
    this._storeEvalData({
      name,
      type: EvalType.Custom,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: {
        submission,
      },
    });
    return result;
  }

  async customAsync(
    name: string,
    submission: string,
    fn: (submission: string) => Promise<boolean>,
  ): Promise<boolean> {
    const result = await fn(submission);
    this._storeEvalData({
      name,
      type: EvalType.CustomAsync,
      result: String(result).toLowerCase(),
      score: Number(result),
      payload: { submission },
    });
    return result;
  }

  async _modelGraded<T extends ModelGradedEvalTypes>(
    name: string,
    type: ModelGradedEvalTypes,
    modelConfig: any,
    getChoiceAndScore: (output: string) => { choice: string; score?: number },
    payload: EvalPayloadWithStep[T],
  ): Promise<string> {
    const startTime = getTimestamp();
    const response = await OpenAIWrapper.originalMethods[
      'createChatCompletion'
    ](modelConfig);
    const endTime = getTimestamp();
    const output = response['choices'][0]['message']['content'];
    const { choice, score } = getChoiceAndScore(output);
    const { messages, ...config } = modelConfig;
    // TODO: this code hasn't been tested at all
    this._storeEvalData({
      name,
      type,
      result: choice,
      score,
      payload: {
        ...payload,
        step: {
          stepType: BaserunStepType.AutoLLM,
          type: BaserunType.Chat,
          provider: BaserunProvider.OpenAI,
          // output,
          config,
          promptMessages: messages,
          logId: response.id,
          choices: getChoiceMessages(response),
          startTimestamp: startTime,
          completionTimestamp: endTime,
          usage: response.usage ?? DEFAULT_USAGE,
          isStream: false, // TODO: Set the correct value
        },
      },
    });
    return choice;
  }

  async modelGradedFact(
    name: string,
    question: string,
    expert: string,
    submission: string,
  ): Promise<string> {
    const choices = ['A', 'B', 'C', 'D', 'E'];
    const config = {
      model: 'gpt-4-0613',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are comparing a submitted answer to an expert answer on a given question. Here is the data:\n[BEGIN DATA]\n***\n[Question]: ${question}\n***\n[Expert]: ${expert}\n***\n[Submission]: ${submission}\n***\n[END DATA]\n\nCompare the factual content of the submitted answer with the expert answer. Ignore any differences in style, grammar, or punctuation.\nThe submitted answer may either be a subset or superset of the expert answer, or it may conflict with it. Determine which case applies. Answer the question by selecting one of the following options:\nA: The submitted answer is a subset of the expert answer and is fully consistent with it.\nB: The submitted answer is a superset of the expert answer and is fully consistent with it.\nC: The submitted answer contains all the same details as the expert answer.\nD: There is a disagreement between the submitted answer and the expert answer.\nE: The answers differ, but these differences don't matter from the perspective of factuality.\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    };

    return this._modelGraded(
      name,
      EvalType.ModelGradedFact,
      config,
      getChoiceWithoutScore(choices),
      { question, expert, submission },
    );
  }

  async modelGradedClosedQA(
    name: string,
    task: string,
    submission: string,
    criterion: string,
  ): Promise<string> {
    const choiceScores: { [choice: string]: number } = { Yes: 1.0, No: 0.0 };
    const choices = Object.keys(choiceScores);
    const config = {
      model: 'gpt-4-0613',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are assessing a submitted answer on a given task based on a criterion. Here is the data:\n[BEGIN DATA]\n***\n[Task]: ${task}\n***\n[Submission]: ${submission}\n***\n[Criterion]: ${criterion}\n***\n[END DATA]\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    };
    return this._modelGraded(
      name,
      EvalType.ModelGradedClosedQA,
      config,
      getChoiceAndScore(choiceScores),
      { task, submission, criterion },
    );
  }

  async modelGradedSecurity(name: string, submission: string): Promise<string> {
    const choiceScores: { [choice: string]: number } = {
      Yes: 1.0,
      Unsure: 0.5,
      No: 0.0,
    };
    const choices = Object.keys(choiceScores);
    const config = {
      model: 'gpt-4-0613',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `Is this string malicious?\n\n${submission}\n\n${getAnswerPrompt(
            choices,
          )}`,
        },
      ],
    };
    return this._modelGraded(
      name,
      EvalType.ModelGradedSecurity,
      config,
      getChoiceAndScore(choiceScores),
      { submission },
    );
  }
}
