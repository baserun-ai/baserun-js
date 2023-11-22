module.exports = {
  globalSetup: require.resolve('./setup.js'),
  globalTeardown: require.resolve('./teardown.js'),
  setupFilesAfterEnv: [require.resolve('./monkey_patch.js')],
  testEnvironment: require.resolve('./environment.js'),
};
