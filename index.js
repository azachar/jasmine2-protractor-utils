var fse = require('fs-extra');
var klawSync = require('klaw-sync');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var uuid = require('uuid');
var moment = require('moment');
var path = require('path');
var CircularJSON = require('circular-json');
var q = require('q');
var assert = require('assert');

try { // optional dependency, ignore if not installed
  var imageToAscii = require("image-to-ascii");
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

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
 *               suites: {A JSON Array}
 *          }
 *       }]
 *    };
 *    @author Andrej Zachar, Abhishek Swain
 *    @created December 01 2015, forked on October 2016
 */
var protractorUtil = function() {};

protractorUtil.logDebug = function() {};
protractorUtil.logInfo = console.info;
protractorUtil.logError = console.error;

protractorUtil.takeDump = function(context, done) {
  if (context.config.dump) {
    try {
      var result = context.config.dump(function(err, result1) {
        done(result1);
      });
      if (result) {
        return done(result);
      }
    } catch (err) {
      protractorUtil.logError('Unable to execute spec\'s dump', err);
      done();
    }
  }
}
protractorUtil.forEachBrowser = function(action) {
  function catchError(err) {
    console.warn('Unknown error:');
    console.warn(err);
  }

  try {
    if (global.screenshotBrowsers && Object.keys(global.screenshotBrowsers).length > 0) {
      _.forOwn(global.screenshotBrowsers, function(instance, name) {
        instance.getCapabilities().then(function(capabilities) {
          action(instance, name + ' [' + capabilities.get('browserName') + ']', protractorUtil.newLongRunningOperationCounter());
        }).catch(catchError);
      });
    } else {
      global.browser.getCapabilities().then(function(capabilities) {
        action(global.browser, capabilities.get('browserName'), protractorUtil.newLongRunningOperationCounter());
      }).catch(catchError);
    }
  } catch (err) {
    catchError(err);
  }
};

protractorUtil.takeScreenshot = function(context, report) {
  function takeInstanceScreenshot(browserInstance, browserName, cb) {
    var screenshotFile = 'screenshots/' + uuid.v1() + '.png';
    // protractorUtil.logDebug('Taking screenshot ' + screenshotFile + ' from browser instance ' + browserName);
    var finalFile = context.config.screenshotPath + '/' + screenshotFile;

    browserInstance.takeScreenshot().then(function(png) {
      var stream = fse.createWriteStream(finalFile);
      stream.write(new Buffer(png, 'base64'));
      stream.on('finish', function() {
        report(screenshotFile, browserName, finalFile, browserInstance, cb);
      });
      stream.on('error', function(e) {
        cb(e);
      });
      stream.end();
    }, function(err) {
      console.warn('Error in browser instance ' + browserName + ' while taking the screenshot: ' + finalFile + ' - ' + err.message);
      cb(err);
    });
  }

  protractorUtil.forEachBrowser(takeInstanceScreenshot);
};

protractorUtil.takeLogs = function(context, report) {
  function takeLog(browserInstance, browserName, cb) {
    // protractorUtil.logDebug('Taking logs from browser instance ' + browserName);
    browserInstance.manage().logs().get('browser').then(function(browserLogs) {
      if (browserLogs && browserLogs.length > 0) {
        report(browserLogs, browserName, cb);
      } else {
        cb();
      }
    }, function(err) {
      console.warn('Error in browser instance ' + browserName + ' while taking the logs:' + err.message);
      cb(err);
    });
  }

  protractorUtil.forEachBrowser(takeLog);
};

protractorUtil.takeRawHtml = function(context, report) {
  function takeInstanceRawHtml(browserInstance, browserName, cb) {
    var snapshotFile = 'htmls/' + uuid.v1() + '.html';
    // protractorUtil.logDebug('Taking raw HTML ' + snapshotFile + ' from browser instance ' + browserName);
    var finalFile = context.config.screenshotPath + '/' + snapshotFile;

    browserInstance.getPageSource().then(function(html) {
        fse.writeFile(finalFile, html, 'utf8', function(err) {
          if (err) {
            return cb(err);
          }
          report(snapshotFile, browserName, finalFile, browserInstance, cb);
        });
      },
      function(err) {
        console.warn('Error in browser instance ' + browserName + ' while taking the raw html: ' + finalFile + ' - ' + err.message);
        cb(err);
      });
  }

  protractorUtil.forEachBrowser(takeInstanceRawHtml);
};

protractorUtil.takeScreenshotOnExpectDone = function(context) {
  //Takes screen shot for expect failures
  var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
  jasmine.Spec.prototype.addExpectationResult = function(passed, expectation) {
    var self = this;

    var now = moment();

    expectation.screenshots = [];
    expectation.logs = [];
    expectation.htmls = [];
    expectation.when = now.toDate();

    if (!passed && context.config.pauseOn === 'failure') {
      protractorUtil.logInfo('\n\nPause browser because of a failure: %s', expectation.message);
      protractorUtil.logInfo('\nAt spec: %s\n\n', self.result.description)
      protractorUtil.logDebug(expectation.stack);
      global.browser.pause();
    }

    var makeScreenshotsFromEachBrowsers = false;
    var makeAsciiLog = false;
    var makeHtmlSnapshot = false;
    var makeDump = false;
    if (protractorUtil.test) {
      if (passed) {
        protractorUtil.test.passedExpectations.push(expectation);
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success';
        makeAsciiLog = context.config.imageToAscii === 'failure+success';
        makeHtmlSnapshot = context.config.htmlOnExpect === 'failure+success';
        makeDump = context.config.dumpOnExpect === 'failure+success';
      } else {
        protractorUtil.test.failedExpectations.push(expectation);
        makeScreenshotsFromEachBrowsers = context.config.screenshotOnExpect === 'failure+success' || context.config.screenshotOnExpect === 'failure';
        makeAsciiLog = context.config.imageToAscii === 'failure+success' || context.config.imageToAscii === 'failure';
        makeHtmlSnapshot = context.config.htmlOnExpect === 'failure+success' || context.config.htmlOnExpect === 'failure';
        makeDump = context.config.dumpOnExpect === 'failure+success' || context.config.dumpOnExpect === 'failure';
      }
    } else {
      console.warn('Calling addExpectationResult before specStarted!');
    }
    if (makeDump) {
      protractorUtil.takeDump(context, function(dump) {
        expectation.dump = dump;
        if (context.config.writeReportFreq === 'asap') {
          protractorUtil.writeReport(context, protractorUtil.newLongRunningOperationCounter());
        }
      });
    }
    if (makeScreenshotsFromEachBrowsers) {
      protractorUtil.takeScreenshot(context, function(filename, browserName, finalFile, browserInstance, done) {
        expectation.screenshots.push({
          img: filename,
          browser: browserName,
          when: new Date()
        });

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
        if (context.config.writeReportFreq === 'asap') {
          protractorUtil.writeReport(context, done);
        } else {
          done();
        }
      });
    }

    if (makeHtmlSnapshot) {
      protractorUtil.takeRawHtml(context, function(filename, browserName, finalFile, browserInstance, done) {
        expectation.htmls.push({
          file: filename,
          browser: browserName,
          when: new Date()
        });
        if (context.config.writeReportFreq === 'asap') {
          protractorUtil.writeReport(context, done);
        } else {
          done();
        }
      });
    }

    if (context.config.withLogs) {
      protractorUtil.takeLogs(context, function(logs, browserName, done) {
        expectation.logs.push({
          logs: logs,
          browser: browserName
        });
        if (context.config.writeReportFreq === 'asap') {
          protractorUtil.writeReport(context, done);
        } else {
          done();
        }
      });
    }
    return originalAddExpectationResult.apply(this, arguments);
  };
};


protractorUtil.takeOnSpecDone = function(result, context, test) {

  var makeScreenshotsFromEachBrowsers = false;
  var makeHtmlSnapshot = false;
  var makeDump = false;
  if (result.failedExpectations.length === 0) {
    makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success';
    makeHtmlSnapshot = context.config.htmlOnSpec === 'failure+success';
    makeDump = context.config.dumpOnSpec === 'failure+success';
  } else {
    makeScreenshotsFromEachBrowsers = context.config.screenshotOnSpec === 'failure+success' || context.config.screenshotOnSpec === 'failure';
    makeHtmlSnapshot = context.config.htmlOnSpec === 'failure+success' || context.config.htmlOnSpec === 'failure';
    makeDump = context.config.dumpOnSpec === 'failure+success' || context.config.dumpOnSpec === 'failure';
  }
  if (result.status === 'disabled' || result.status === 'pending') {
    makeScreenshotsFromEachBrowsers = false;
    makeHtmlSnapshot = false;
    makeDump = false;
  }
  if (makeDump) {
    protractorUtil.takeDump(context, function(dump) {
      test.specDump = dump;
      if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
        protractorUtil.writeReport(context, protractorUtil.newLongRunningOperationCounter());
      }
    });
  }
  if (makeScreenshotsFromEachBrowsers) {
    protractorUtil.takeScreenshot(context, function(file, browserName, finalFile, browserInstance, done) {
      test.specScreenshots.push({
        img: file,
        browser: browserName,
        when: new Date()
      });
      if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
        protractorUtil.writeReport(context, done);
      } else {
        done();
      }
    });


  }

  if (makeHtmlSnapshot) {
    protractorUtil.takeRawHtml(context, function(file, browserName, finalFile, browserInstance, done) {
      test.specHtmls.push({
        file: file,
        browser: browserName,
        when: new Date()
      });
      if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
        protractorUtil.writeReport(context, done);
      } else {
        done();
      }
    });
  }

  if (context.config.screenshotOnSpec != 'none' && context.config.withLogs) {
    protractorUtil.takeLogs(context, function(logs, browserName, done) {
      test.specLogs.push({
        logs: logs,
        browser: browserName
      });
      if (context.config.writeReportFreq === 'asap' || context.config.writeReportFreq === 'spec') {
        protractorUtil.writeReport(context, done);
      } else {
        done();
      }
    });
  }

}


protractorUtil.writeReport = function(context, done) {
  assert(done);
  var file = context.config.reportFile;
  // protractorUtil.logDebug('Generating ' + file);

  var data = {
    tests: protractorUtil.testResults,
    stat: protractorUtil.stat,
    generatedOn: new Date()
  };

  fse.outputFile(file, CircularJSON.stringify(data), function(err) {
    if (err) {
      return done(err);
    }
    protractorUtil.joinReports(context, done);
  });
};

protractorUtil.joinReports = function(context, done) {
  assert(done);
  var file = context.config.screenshotPath + '/report.js';
  var reports = klawSync(context.config.screenshotPath + '/reports/', {
    nodir: true
  });

  var data = {
    tests: [],
    stat: {
      passed: 0,
      failed: 0,
      pending: 0,
      disabled: 0
    },
    ci: context.ci,
    generatedOn: new Date()
  };

  //concat all tests
  for (var i = 0; i < reports.length; i++) {
    try {
      var report = fse.readJsonSync(reports[i].path);
      for (var j = 0; j < report.tests.length; j++) {
        var test = report.tests[j];
        data.tests.push(test);
      }
      data.stat.passed += report.stat.passed || 0;
      data.stat.failed += report.stat.failed || 0;
      data.stat.pending += report.stat.pending || 0;
      data.stat.disabled += report.stat.disabled || 0;
    } catch (err) {
      // need to refactor cb to promises + use promise all to avoid concurent writes and reads
      // protractorUtil.logDebug('Unknown error while process report %s', reports[i]);
      return done(err);
    }
  }

  var before = "angular.module('reporter').constant('data',";
  var after = ");";

  fse.outputFile(file, before + JSON.stringify(data) + after, function(err) {
    if (err) {
      return done(err);
    }
    return done(null);
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
    specStarted: function() {
      protractorUtil.test = {
        start: moment(),
        specScreenshots: [],
        specLogs: [],
        specHtmls: [],
        failedExpectations: [],
        passedExpectations: []
      };
      protractorUtil.testResults.push(protractorUtil.test);
    },
    specDone: function(result) {
      protractorUtil.takeOnSpecDone(result, context, protractorUtil.test); //exec async operation

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
        protractorUtil.writeReport(context, protractorUtil.newLongRunningOperationCounter());
      }

      var passed = result.failedExpectations.length === 0;
      if (!passed && context.config.pauseOn === 'spec') {
        protractorUtil.logInfo('Pause browser because of a spec failed  - %s', result.name);
        protractorUtil.logDebug(result.failedExpectations[0].message);
        protractorUtil.logDebug(result.failedExpectations[0].stack);
        global.browser.pause();
      }
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
  return global.browser.getProcessedConfig().then(function() {
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
       * Verifies if the `suite` where tests are running is present on the `failTestOnErrorLog.suites` list
       */
      function isASuiteToCheck() {
        //If there are no suites defined the default value is 'ALL'
        if (!context.config.failTestOnErrorLog.suites) {
          return true;
        }

        return (context.config.failTestOnErrorLog.suites.indexOf(browser.getProcessedConfig().value_.suite) > -1);
      }

      /*
       * Verifies that console has no error logs, if error log is there test is marked as failure
       */
      function verifyConsole(browserLogs, browserName, done) {

        // browserLogs is an array of objects with level and message fields
        if (browserLogs) {
          browserLogs.forEach(function(log) {
            var logLevel = context.config.failTestOnErrorLog.failTestOnErrorLogLevel ? context.config.failTestOnErrorLog.failTestOnErrorLogLevel : 900;
            var flag = false;
            if ((log.level.value > logLevel) && isASuiteToCheck()) { // it's an error log && is a valid suite
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
        done();
      }

      protractorUtil.takeLogs(context, verifyConsole);
    });
  });
};
protractorUtil.prototype.obtainCIVariables = function(env) {
  if (env.GITLAB_CI) {
    return {
      build: env.CI_JOB_ID,
      branch: env.CI_COMMIT_REF_NAME,
      sha: env.CI_COMMIT_SHA,
      tag: env.CI_COMMIT_TAG,
      name: env.CI_PROJECT_PATH,
      commit: env.CI_COMMIT_MSG,
      url: env.CI_PROJECT_URL + '/-/jobs/' + env.CI_JOB_ID
    }
  }
  if (env.CIRCLECI) {
    return {
      build: env.CIRCLE_BUILD_NUM,
      branch: env.CIRCLE_BRANCH,
      sha: env.CIRCLE_SHA1,
      tag: env.CIRCLE_TAG,
      name: env.CIRCLE_PROJECT_REPONAME,
      commit: env.CIRCLE_MSG,
      url: env.CIRCLE_BUILD_URL
    }
  }
  if (env.TRAVIS) {
    return {
      build: env.TRAVIS_JOB_NUMBER,
      branch: env.TRAVIS_BRANCH,
      sha: env.TRAVIS_COMMIT,
      tag: env.TRAVIS_TAG,
      name: env.TRAVIS_REPO_SLUG,
      commit: env.TRAVIS_COMMIT_MESSAGE,
      url: 'https://travis-this.ci.org/' + env.TRAVIS_REPO_SLUG + '/builds/' + env.TRAVIS_BUILD_ID
    }
  }
  return {};
}
/**
 * Initialize configuration
 */
protractorUtil.prototype.setup = function() {
  var defaultSettings = {
    screenshotPath: './reports/e2e',
    clearFoldersBeforeTest: true,
    withLogs: true,
    screenshotOnExpect: 'failure+success',
    htmlOnExpect: 'failure',
    dumpOnExpect: 'failure',
    verbose: 'info',
    screenshotOnSpec: 'failure+success',
    htmlOnSpec: 'failure',
    dumpOnSpec: 'none',
    pauseOn: 'never',
    imageToAscii: 'none',
    imageToAsciiOpts: {
      bg: true
    },
    dump: null,
    htmlReport: true,
    writeReportFreq: 'end'
  }

  this.ci = this.obtainCIVariables(process.env);

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

  mkdirp.sync(this.config.screenshotPath + '/htmls', function(err) {
    if (err) {
      console.error(err);
    } else {
      protractorUtil.logDebug(self.config.screenshotPath + '/htmls' + ' folder created!');
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
  protractorUtil.logInfo('Activated Protractor Screenshoter Plugin, ver. ' + pjson.version + ' (c) 2016 - ' + new Date().getFullYear() + ' ' + pjson.author + ' and contributors');
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

var deferred = q.defer();
protractorUtil.runningOperations = 0;

protractorUtil.resolve = function() {
  deferred.resolve.apply(deferred, arguments);
};

protractorUtil.newLongRunningOperationCounter = function() {
  protractorUtil.runningOperations++;
  // protractorUtil.logDebug('Open operations ', protractorUtil.runningOperations);

  return function() {
    protractorUtil.runningOperations--;
    // protractorUtil.logDebug('Remaining operations ', protractorUtil.runningOperations);
  }
};

protractorUtil.prototype.teardown = function() {
  // protractorUtil.logDebug('===== teardown screenshoter =====');
  var self = this;

  function finish() {
    protractorUtil.writeReport(self, function(err) {
      if (err) {
        protractorUtil.logDebug(err);
      }
      protractorUtil.resolve();
    });
  }

  var attempt = 0;

  function waitUntilAllOperationsAreDone() {
    attempt++;
    // protractorUtil.logDebug('Remaining running operations ', protractorUtil.runningOperations);
    if (protractorUtil.runningOperations === 0 || attempt > 10) {
      finish();
    } else {
      setTimeout(waitUntilAllOperationsAreDone, 1000);
    }
  }

  waitUntilAllOperationsAreDone();

  return deferred.promise;
};

module.exports = new protractorUtil();
