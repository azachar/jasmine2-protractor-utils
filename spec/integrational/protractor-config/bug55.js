var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-disabled-test.js'],
  useBlockingProxy: true,
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/bug55',
    screenshotOnExpect: 'failure+success',
    screenshotOnSpec: 'failure+success',
    withLogs: 'true',
    writeReportFreq: 'asap',
    clearFoldersBeforeTest: true
  }]
};
