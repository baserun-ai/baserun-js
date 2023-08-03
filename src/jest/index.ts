export = {
  globalSetup: require.resolve('./setup'),
  globalTeardown: require.resolve('./teardown'),
  setupFilesAfterEnv: [require.resolve('./monkey_patch')],
  testEnvironment: require.resolve('./environment'),
};
