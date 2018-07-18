var env = require('../environment');

var dumpNo = 0;
exports.config = {
  seleniumAddress: env.seleniumAddress,
  framework: 'jasmine2',
  specs: ['../protractor/angularjs-homepage-simple-failure-test.js'],
  plugins: [{
    path: '../../../index.js',
    screenshotPath: '.tmp/dump-cb',
    dumpOnExpect: 'failure+success',
    dumpOnSpec: 'failure+success',
    dump: function(cb) {
      cb(null, 'extra data captured at ' + ++dumpNo);
    }
  }]
};
