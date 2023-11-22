export const openai: any[] = [];
export const anthropic: any[] = [];

const modulesPromise = import('../utils/resolveAll.js').then(
  async ({ resolveAllSync }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const openaiPaths = await resolveAllSync('openai');
      Promise.all(
        openaiPaths.map((path) => {
          try {
            const mod = module.require(path);
            openai.push(mod);
          } catch (e) {
            // fail silently
          }
        }),
      );
    } catch (e) {
      console.warn('openai module not found');
      // fail silently
    }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const anthropicPaths = await resolveAllSync('@anthropic-ai/sdk');
      Promise.all(
        anthropicPaths.map(async (path) => {
          try {
            const mod = module.require(path);
            anthropic.push(mod);
          } catch (e) {
            // fail silently
          }
        }),
      );
    } catch (e) {
      console.warn('anthropic module not found');
      // fail silently
    }
  },
);

export { modulesPromise };
