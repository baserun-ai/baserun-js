export let openai: any;
export let anthropic: any;

try {
  // @ts-ignore
  openai = (await import('openai')).default;
} catch (e) {
  console.warn('openai module not found');
}

try {
  // @ts-ignore
  anthropic = (await import('@anthropic-ai/sdk')).default;
} catch (e) {
  console.warn('anthropic module not found');
}
