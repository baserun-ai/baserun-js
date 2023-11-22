import { Baserun } from './baserun.js';

const init = Baserun.init;
const trace = Baserun.trace;
const log = Baserun.log;
const evals = Baserun.evals;
const session = Baserun.session;
const flush = Baserun.flush;

export const baserun = { init, log, trace, evals, session, flush };
