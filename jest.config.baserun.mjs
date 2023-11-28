/* eslint-disable-next-line @typescript-eslint/no-var-requires */
import tsJest from 'ts-jest/jest-preset.js';
import baserun from './jest-preset.mjs';

export default {
  testTimeout: 50000,
  ...tsJest,
  ...baserun,
};
