var env = require('../environment');

exports.config = {
    seleniumAddress: env.seleniumAddress,
    framework: 'jasmine2',
    specs: ['../protractor/multi-browser-instance-test.js'],
    plugins: [{
        path: '../../../index.js',
        htmlOnExpect: 'failure+success',
        htmlOnSpec: 'failure+success',
        screenshotPath: '.tmp/htmlSnapshots'
    }]
};
