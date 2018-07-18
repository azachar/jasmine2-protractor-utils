var env = require('../environment');

var dumpNo = 0;
exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-simple-failure-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/dump',
    dumpOnExpect: 'failure+success',
    dumpOnSpec: 'failure+success',
    dump: function() {
      return 'extra data captured at ' + ++dumpNo;
    }
  }]
};
