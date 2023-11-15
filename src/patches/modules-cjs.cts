export let openai: any;
export let anthropic: any;

try {
  openai = module.require('openai');
} catch (e) {
  console.warn('openai module not found');
}

try {
  anthropic = module.require('@anthropic-ai/sdk');
} catch (e) {
  console.warn('anthropic module not found');
}
