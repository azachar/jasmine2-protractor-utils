var fse = require('fs-extra');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var uuid = require('uuid');
var moment = require('moment');
var path = require('path');
var imageToAscii = require("image-to-ascii");
var CircularJSON = require('circular-json');

/**
 * This plugin does few things:
 *   1. Takes a screenshot for each jasmine expect/matcher failure
 *   2. Takes a screenshot for each test/spec failure
 *   3. Generates a HTML report
 *   4. Marks the test as failure if browser console log has error - Chrome only
 *
 *    exports.config = {
 *      plugins: [{
 *      package: 'protractor-screenshoter-plugin',
 *      screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
 *      withLogs: {Boolean}       (Default - true),
 *      htmlReport: {Boolean}      (Default - true),
 *      writeReportFreq: {String}      (Default - 'end', 'spec', 'asap'),
 *      screenshotPath: {String}                (Default - 'reports/screenshots')
 *      clearFoldersBeforeTest: {Boolean}       (Default - false),
 *      failTestOnErrorLog: {
 *               failTestOnErrorLogLevel: {Number},  (Default - 900)
 *               excludeKeywords: {A JSON Array}
 *          }
 *       }]
 *    };
 *    @author Andrej Zachar, Abhishek Swain
 *    @created December 01 2015, forked on October 2016
 */
var protractorUtil = function() {};

protractorUtil.logDebug = function() {};
protractorUtil.logInfo = console.info;

protractorUtil.forEachBrowser = function(action) {
    try {
        if (global.screenshotBrowsers && Object.keys(global.screenshotBrowsers).length > 0) {
            _.forOwn(global.screenshotBrowsers, function(instance, name) {
                action(instance, name);
            });
        } else {
            action(global.browser, 'default');
        }
    } catch (err) {
        console.warn('Unknown error:');
        console.warn(err);
    }
};

protractorUtil.takeScreenshot = function(context, report) {

    function takeInstanceScreenshot(browserInstance, browserName) {
        var screenshotFile = 'screenshots/' + uuid.v1() + '.png';
        // protractorUtil.logDebug('Taking screenshot ' + screenshotFile + ' from browser instance ' + browserName);
        var finalFile = context.config.screenshotPath + '/' + screenshotFile;

        browserInstance.takeScreenshot().then(function(png) {
            var stream = fse.createWriteStream(finalFile);
            stream.write(new Buffer(png, 'base64'));
            stream.end();
            stream.on('finish', function() {
                report(screenshotFile, browserName, finalFile, browserInstance);
            });
        }, function(err) {
            console.warn('Error in browser instance ' + browserName + ' while taking the screenshot: ' + finalFile + ' - ' + err.message);
        });
    }

    protractorUtil.forEachBrowser(takeInstanceScreenshot);
};

protractorUtil.takeLogs = function(context, report) {

    function takeLog(browserInstance, browserName) {
        // protractorUtil.logDebug('Taking logs from browser instance ' + browserName);
        browserInstance.manage().logs().get('browser').then(function(browserLogs) {
            if (browserLogs && browserLogs.length > 0) {
                report(browserLogs, browserName);
            }
        }, function(err) {
            console.warn('Error in browser instance ' + browserName + ' while taking the logs:' + err.message);
        });
    }

    protractorUtil.forEachBrowser(takeLog);
};

protractorUtil.takeScreenshotOnExpectDone = function(context) {
    //Takes screen shot for expect failures
    var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = function(passed, expectation) {
        var self = this;

        var now = moment();

        expectation.screenshots = [];
        expectation.logs = [];
        expectation.when = now.toDate();

        if (!passed && context.config.pauseOn === 'failure') {
            protractorUtil.logInfo('Pause browser because of a failure: %s', expectation.message);
            protractorUtil.logDebug(expectation.stack);
            global.browser.pause();
        }

        var makeScreenshotsFromEachBrowsers = false;
        var makeAsciiLog = false;
        if (protractorUtil.test) {
            if (passed) {
                protractorUtil.test.passedExpectations.push(expectation);
                makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success';
                makeAsciiLog = context.config.imageToAscii === 'failure+success';
            } else {
                protractorUtil.test.failedExpectations.push(expectation);
                makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success' || context.config.screenshotOnExpect === 'failure';
                makeAsciiLog = context.config.imageToAscii === 'failure+success' || context.config.imageToAscii === 'failure';
            }
        } else {
            console.warn('Calling addExpectationResult before specStarted!');
        }
        if (makeScreenshotsFromEachBrowsers) {
            protractorUtil.takeScreenshot(context, function(filename, browserName, finalFile, browserInstance) {
                expectation.screenshots.push({
                    img: filename,
                    browser: browserName,
                    when: new Date()
                });
                if (context.config.writeReportFreq === 'asap') {
                    protractorUtil.writeReport(context);
                }
                if (makeAsciiLog && !browserInstance.skipImageToAscii) {
                    try {
                        imageToAscii(finalFile, context.config.imageToAsciiOpts, function(err, converted) {
                            var asciImage;
                            asciImage += '\n\n============================\n';
                            asciImage += browserName + ' ' + now.format() + ' ' + expectation.message;
                            asciImage += '\n============================\n';
                            asciImage += err || converted;
                            protractorUtil.logDebug(asciImage);
                        });
                    } catch (err) {
                        console.warn(err);
                        console.warn('Please check the installation at https://github.com/IonicaBizau/image-to-ascii/blob/master/INSTALLATION.md');
                    }
                }
            });
        }
        if (context.config.withLogs) {
            protractorUtil.takeLogs(context, function(logs, browserName) {
                expectation.logs.push({
                    logs: logs,
                    browser: browserName
                });
                if (context.config.writeReportFreq === 'asap') {
                    protractorUtil.writeReport(context);
                }
            });
        }
        return originalAddExpectationResult.apply(this, arguments);
    };
};


protractorUtil.takeScreenshotOnSpecDone = function(result, context, test) {

    var makeScreenshotsFromEachBrowsers = false;
    if (result.failedExpectations.length === 0) {
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success';
    } else {
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success' || context.config.screenshotOnSpec === 'failure';
    }
    if (makeScreenshotsFromEachBrowsers) {
        protractorUtil.takeScreenshot(context, function(file, browserName) {
            test.specScreenshots.push({
                img: file,
                browser: browserName,
                when: new Date()
            });
            if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec' || protractorUtil.jasmineDone) {
                protractorUtil.writeReport(context);
            }
        });
    }
    if (context.config.withLogs) {
        protractorUtil.takeLogs(context, function(logs, browserName) {
            test.specLogs.push({
                logs: logs,
                browser: browserName
            });
            if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec' || protractorUtil.jasmineDone) {
                protractorUtil.writeReport(context);
            }
        });
    }

}


protractorUtil.writeReport = function(context) {
    var file = context.config.reportFile;
    // protractorUtil.logDebug('Generating ' + file);

    var data = {
        tests: protractorUtil.testResults,
        stat: protractorUtil.stat,
        generatedOn: new Date()
    };

    fse.outputFile(file, CircularJSON.stringify(data), function(err) {
        if (err) protractorUtil.logDebug(err);
        protractorUtil.joinReports(context);
    });
};

protractorUtil.joinReports = function(context) {
    var file = context.config.screenshotPath + '/report.js';
    var reports = fse.walkSync(context.config.screenshotPath + '/reports/')

    var ci = {
        build: process.env.CIRCLE_BUILD_NUM || 'N/A',
        branch: process.env.CIRCLE_BRANCH || 'N/A',
        sha: process.env.CIRCLE_SHA1 || 'N/A',
        tag: process.env.CIRCLE_TAG || 'N/A',
        name: process.env.CIRCLE_PROJECT_REPONAME || 'N/A'
    };

    var data = {
        tests: [],
        stat: {
            passed: 0,
            failed: 0,
            pending: 0,
            disabled: 0
        },
        ci: ci,
        generatedOn: new Date()
    };

    //concat all tests
    for (var i = 0; i < reports.length; i++) {
        try {
            var report = fse.readJsonSync(reports[i]);
            for (var j = 0; j < report.tests.length; j++) {
                var test = report.tests[j];
                data.tests.push(test);
            }
            data.stat.passed += report.stat.passed || 0;
            data.stat.failed += report.stat.failed || 0;
            data.stat.pending += report.stat.pending || 0;
            data.stat.disabled += report.stat.disabled || 0;
        } catch (err) {
            // console.warn('Unknown error while process report %s', reports[i]);
            // protractorUtil.logDebug(err);
        }
    }

    var before = "angular.module('reporter').constant('data',";
    var after = ");";

    fse.outputFile(file, before + JSON.stringify(data) + after, function(err) {
        if (err) protractorUtil.logDebug(err);
    });
};

protractorUtil.installReporter = function(context) {
    var dest = context.config.screenshotPath + '/';
    protractorUtil.logInfo('Creating reporter at ' + dest);
    try {
        var src = path.join(require.resolve('screenshoter-report-analyzer/dist/index.html'), '../');
        fse.copy(src, dest);
    } catch (err) {
        console.error(err);
        return;
    }
};

protractorUtil.registerJasmineReporter = function(context) {

    jasmine.getEnv().addReporter({
        jasmineStarted: function() {
            global.screenshotBrowsers = {};

            protractorUtil.testResults = [];
            protractorUtil.stat = {};
            if (context.config.htmlReport) {
                protractorUtil.installReporter(context);
            }
        },
        specStarted: function(result) {
            protractorUtil.test = {
                start: moment(),
                specScreenshots: [],
                specLogs: [],
                failedExpectations: [],
                passedExpectations: []
            };
            protractorUtil.testResults.push(protractorUtil.test);
        },
        specDone: function(result) {
            if (context.config.screenshotOnSpec != 'none') {
                protractorUtil.takeScreenshotOnSpecDone(result, context, protractorUtil.test);
            }

            var passed = result.failedExpectations.length === 0;
            if (!passed && context.config.pauseOn === 'failure') {
                protractorUtil.logInfo('Pause browser because of a spec failed  - %s', result.name);
                protractorUtil.logDebug(result.failedExpectations[0].message);
                protractorUtil.logDebug(result.failedExpectations[0].stack);
                global.browser.pause();
            }

            //calculate total fails, success and so on
            if (!protractorUtil.stat[result.status]) {
                protractorUtil.stat[result.status] = 0;
            }
            protractorUtil.stat[result.status]++;
            //calculate diff
            protractorUtil.test.end = moment();
            protractorUtil.test.diff = protractorUtil.test.end.diff(protractorUtil.test.start, 'ms');
            protractorUtil.test.timeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

            _.merge(protractorUtil.test, result);
            if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
                protractorUtil.writeReport(context);
            }
        },
        jasmineDone: function() {
            protractorUtil.jasmineDone = true; //taking screenshots after the spec might be not finished since it is an async operation
            protractorUtil.writeReport(context);
        }
    });
};

/**
 * Fails the test/spec if browser has console logs
 *
 * @param {Object} context The plugin context object
 * @return {!webdriver.promise.Promise.<R>} A promise
 */
protractorUtil.failTestOnErrorLog = function(context) {
    return global.browser.getProcessedConfig().then(function(config) {
        beforeEach(function() {
            /*
             * A Jasmine custom matcher
             */
            var matchers = {
                toEqualBecause: function() {

                    return {
                        compare: function(actual, expected, custMsg) {
                            var result = {
                                pass: jasmine.pp(actual) === jasmine.pp(expected),
                                message: 'Expected ' + jasmine.pp(actual) + ' to equal ' + jasmine.pp(expected) + ' Because: ' + custMsg
                            };
                            return result;
                        }
                    };
                }
            };
            global.jasmine.addMatchers(matchers);

        });

        afterEach(function() {
            /*
             * Verifies that console has no error logs, if error log is there test is marked as failure
             */
            function verifyConsole(browserLogs, browserName) {

                // browserLogs is an array of objects with level and message fields
                if (browserLogs) {
                    browserLogs.forEach(function(log) {
                        var logLevel = context.config.failTestOnErrorLog.failTestOnErrorLogLevel ? context.config.failTestOnErrorLog.failTestOnErrorLogLevel : 900;
                        var flag = false;
                        if (log.level.value > logLevel) { // it's an error log
                            if (context.config.failTestOnErrorLog.excludeKeywords) {
                                context.config.failTestOnErrorLog.excludeKeywords.forEach(function(keyword) {
                                    if (log.message.search(keyword) > -1) {
                                        flag = true;
                                    }
                                });
                            }
                            expect(log.level.value > logLevel && flag).toEqualBecause(true, 'Browser instance ' + browserName + ': Error logs present in console:' + require('util').inspect(log));
                        }
                    });
                }
            }

            protractorUtil.takeLogs(context, verifyConsole);
        });
    });
};

/**
 * Initialize configurtion
 */
protractorUtil.prototype.setup = function() {
    var defaultSettings = {
        screenshotPath: './reports/e2e',
        clearFoldersBeforeTest: true,
        withLogs: true,
        screenshotOnExpect: 'failure+success',
        verbose: 'info',
        screenshotOnSpec: 'failure+success',
        pauseOn: 'never',
        imageToAscii: 'failure',
        imageToAsciiOpts: {
            bg: true
        },
        htmlReport: true,
        writeReportFreq: 'end'
    }

    this.config = _.merge({}, defaultSettings, this.config);
    this.config.reportFile = this.config.screenshotPath + '/reports/' + uuid.v1() + '.js';

    if (this.config.verbose === 'debug') {
        protractorUtil.logDebug = console.log;
        protractorUtil.logInfo = console.info;
    }

    if (this.config.clearFoldersBeforeTest) {
        try {
            fse.removeSync(this.config.screenshotPath);
        } catch (err) {
            console.error(err);
        }
    }
    var self = this;
    mkdirp.sync(this.config.screenshotPath + '/screenshots', function(err) {
        if (err) {
            console.error(err);
        } else {
            protractorUtil.logDebug(self.config.screenshotPath + '/screenshots' + ' folder created!');
        }
    });

    mkdirp.sync(this.config.screenshotPath + '/reports', function(err) {
        if (err) {
            console.error(err);
        } else {
            protractorUtil.logDebug(self.config.screenshotPath + '/reports' + ' folder created!');
        }
    });


    var pjson = require(__dirname + '/package.json');
    protractorUtil.logInfo('Activated Protractor Screenshoter Plugin, ver. ' + pjson.version + ' (c) 2016 ' + pjson.author + ' and contributors');
    protractorUtil.logDebug('The resolved configuration is:');
    protractorUtil.logDebug(this.config);
};

/**
 * Sets reporter hooks based on the configurtion
 */
protractorUtil.prototype.onPrepare = function() {
    protractorUtil.registerJasmineReporter(this);

    if (this.config.screenshotOnExpect != 'none') {
        protractorUtil.takeScreenshotOnExpectDone(this);
    }

    if (this.config.failTestOnErrorLog) {
        return protractorUtil.failTestOnErrorLog(this);
    }
}

module.exports = new protractorUtil();
