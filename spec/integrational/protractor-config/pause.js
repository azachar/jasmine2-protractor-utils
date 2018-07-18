var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-pause-on-failure-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/pause',
    pauseOn: 'failure',
    verbose: 'debug'
  }]
};
