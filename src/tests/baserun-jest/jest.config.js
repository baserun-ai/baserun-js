// eslint-disable-next-line
const baseConfig = require('../../../jest.config.js');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...baseConfig,
  globalSetup: '../../jest/setup.ts',
  globalTeardown: '../../jest/teardown.ts',
  testEnvironment: '../../jest/environment.ts',
  testEnvironmentOptions: {
    skipFlush: true,
  },
};
