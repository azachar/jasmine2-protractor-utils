var env = require('../environment');

exports.config = {
    seleniumAddress: env.seleniumAddress,
    framework: 'jasmine2',
    suites: {
        homepage: '../protractor/angularjs-homepage-test.js',
        console: '../protractor/console-error-test.js',
    },
    specs: ['../protractor/*.js'],
    plugins: [{
        path: '../../../index.js',
        screenshotPath: '.tmp/suitesConsoleErrors',
        failTestOnErrorLog: {
            failTestOnErrorLogLevel: 999, // all errors
            suites: [
                "console"
            ]
        }
    }]
};