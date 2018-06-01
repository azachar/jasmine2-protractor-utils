var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/tfs-ci-variables.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/tfs-ci-variables',
    writeReportFreq: 'asap'
  }],
  capabilities: {
    'browserName': env.capabilities.browserName,
    'shardTestFiles': true,
    'maxInstances': 5
  }
};
