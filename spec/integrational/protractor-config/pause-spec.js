var env = require('../environment');

exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-pause-on-spec-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/pause-spec',
    pauseOn: 'spec',
    verbose: 'debug',
    clearFoldersBeforeTest: true
  }]
};
