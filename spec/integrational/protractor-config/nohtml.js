var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/nohtml',
    screenshotOnExpect: 'failure+success',
    screenshotOnSpec: 'none',
    writeReportFreq: 'spec',
    htmlReport: false,
    withLogs: true
  }],
  onPrepare: function() {
    // returning the promise makes protractor wait for the reporter config before executing tests
    return global.browser.getProcessedConfig().then(function() {
      //it is ok to be empty
    });
  }
};
