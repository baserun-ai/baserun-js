import { Baserun } from './baserun';

const init = Baserun.init;
const trace = Baserun.trace;
const log = Baserun.log;
const evals = Baserun.evals;

export const baserun = { init, log, trace, evals };
