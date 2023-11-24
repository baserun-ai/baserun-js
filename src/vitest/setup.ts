import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  // @ts-expect-error type
  globalThis.something = 42;
  // Baserun.monkeyPatch();
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 300);
  });
});

afterAll(() => {
  // @ts-expect-error type
  delete globalThis.something;
});

afterAll(async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 500);
  });
});
