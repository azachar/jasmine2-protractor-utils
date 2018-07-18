var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/console-error-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/failTestOnErrorLogExclude',
    screenshotOnExpect: 'failure',
    screenshotOnSpec: 'failure',
    failTestOnErrorLog: {
      failTestOnErrorLogLevel: 999, // all errors
      excludeKeywords: ['sample']
    }
  }],
  onPrepare: function() {
    // returning the promise makes protractor wait for the reporter config before executing tests
    return global.browser.getProcessedConfig().then(function() {
      //it is ok to be empty
    });
  }
};
