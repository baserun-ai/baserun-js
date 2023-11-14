import { Baserun } from './baserun';

const init = Baserun.init;
const trace = Baserun.trace;
const log = Baserun.log;
const evals = Baserun.evals;

export const baserun = { init, log, trace, evals };

const OpenAI = require('openai');

const oldCreate = OpenAI.Completions.prototype.create;

const oai = new OpenAI({});

OpenAI.Completions.prototype.create = async (args: any[]) => {
  console.log('Whoooooooooooot');
  return oldCreate.apply(oai, args);
};
