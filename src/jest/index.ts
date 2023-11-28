import { fileURLToPath } from 'node:url';

export default {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalSetup: fileURLToPath(import.meta.resolve('./setup.js')),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalTeardown: fileURLToPath(import.meta.resolve('./teardown.js')),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  setupFilesAfterEnv: [fileURLToPath(import.meta.resolve('./monkey_patch.js'))],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  testEnvironment: fileURLToPath(import.meta.resolve('./environment.js')),
};
