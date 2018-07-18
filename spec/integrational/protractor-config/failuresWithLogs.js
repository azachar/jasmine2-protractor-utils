var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/fail-test-with-console-errors.js'],
  capabilities: {
    browserName: env.capabilities.browserName,
    loggingPrefs: {
      browser: 'ALL' // "OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL".
    }
  },
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/failuresWithLogs',
    screenshotOnExpect: 'failure+success',
    screenshotOnSpec: 'failure+success',
    withLogs: true
  }]
};
