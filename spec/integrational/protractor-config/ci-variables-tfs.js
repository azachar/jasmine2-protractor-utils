var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/ci-variables-tfs',
    writeReportFreq: 'asap'
  }],
  capabilities: {
    'browserName': env.capabilities.browserName,
    'shardTestFiles': true,
    'maxInstances': 5
  }
};
