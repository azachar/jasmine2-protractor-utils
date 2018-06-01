var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/ci-variables-tfs',
    writeReportFreq: 'asap',
    clearFoldersBeforeTest: true
  }],
  capabilities: {
    'browserName': env.capabilities.browserName
  }
};
