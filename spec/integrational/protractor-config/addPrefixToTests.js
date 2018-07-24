var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/addPrefixToTests',
    clearFoldersBeforeTest: false,
    addPrefixToTests: true
  }],
  multiCapabilities: [
    {
      'browserName': 'chrome',
      'name': 'L',
      'chromeOptions': {
        args: ['--window-size=1400,1200']
      },
      specs: ['../protractor/angularjs-homepage-test.js'],
    }, {
      'browserName': 'chrome',
      'name': 'M',
      'chromeOptions': {
        args: ['--window-size=800,1200']
      },
      specs: ['../protractor/angularjs-homepage-test.js'],
    }
  ],
  onPrepare: function() {
      // returning the promise makes protractor wait for the reporter config before executing tests
      return global.browser.getProcessedConfig().then(function(config) {
          //it is ok to be empty
      });
  }
};
