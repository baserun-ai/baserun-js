export = {
  globalSetup: require.resolve('./setup'),
  globalTeardown: require.resolve('./teardown'),
  setupFilesAfterEnv: [require.resolve('./instrument')],
  testEnvironment: require.resolve('./environment'),
};
