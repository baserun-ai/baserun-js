export let openai: any;
export let anthropic: any;

try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  openai = (await import('openai')).default;
  console.log('openai module found');
} catch (e) {
  console.warn('openai module not found');
}

try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  anthropic = (await import('@anthropic-ai/sdk')).default;
} catch (e) {
  console.warn('anthropic module not found');
}
