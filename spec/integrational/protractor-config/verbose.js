var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-disabled-test.js'],
  useBlockingProxy: true,
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/verbose',
    verbose: 'debug'
  }]
};
