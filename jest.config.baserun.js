import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const tsPreset = require('ts-jest/jest-preset');
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const baserunPreset = require('./jest-preset');

module.exports = {
  ...tsPreset,
  ...baserunPreset,
  testTimeout: 50000,
};
