import { Baserun, AssignMetadataFunc as AssignMetadataFn } from './baserun.js';
import {
  getTemplates,
  formatPrompt,
  formatPromptFromTemplate,
  registerTemplate,
  formatPromptFromTemplateName,
  getTemplate,
} from './templates.js';
import { Template_TemplateType } from './v1/gen/baserun.js';

const init = Baserun.init;
const trace = Baserun.trace;
const log = Baserun.log;
const evals = Baserun.evals;
const session = Baserun.session;
const flush = Baserun.flush;
const annotate = Baserun.annotate;
const submitInputVariable = Baserun.submitInputVariable;
const TemplateType = Template_TemplateType;

export type AssignMetadataFunc = AssignMetadataFn;

export const baserun = {
  init,
  log,
  trace,
  evals,
  session,
  flush,
  annotate,
  submitInputVariable,
  getTemplates,
  getTemplate,
  formatPrompt,
  formatPromptFromTemplate,
  formatPromptFromTemplateName,
  registerTemplate,
  TemplateType,
};
