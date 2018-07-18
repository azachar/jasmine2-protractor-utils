[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/protractor-screenshoter-plugin/Lobby)
[![Open Source Helpers](https://www.codetriage.com/azachar/protractor-screenshoter-plugin/badges/users.svg)](https://www.codetriage.com/azachar/protractor-screenshoter-plugin)

[![npm](https://img.shields.io/npm/dm/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![npm](https://img.shields.io/npm/dt/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)

[![npm](https://img.shields.io/npm/v/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![npm](https://img.shields.io/npm/l/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Dependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin) [![devDependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin/dev-status.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/package/npm/protractor-screenshoter-plugin/badge.svg)](https://snyk.io/package/npm/protractor-screenshoter-plugin)

[![Build Status](https://travis-ci.org/azachar/protractor-screenshoter-plugin.svg?branch=master)](https://travis-ci.org/azachar/protractor-screenshoter-plugin)
[![Coverage Status](https://img.shields.io/codecov/c/github/azachar/protractor-screenshoter-plugin.svg?style=flat-square)](http://codecov.io/github/azachar/protractor-screenshoter-plugin?branch=master)


# protractor-screenshoter-plugin

**It captures screenshots, console logs, raw HTMLs and DB dumps in your e2e protractor tests out-of-box.**

**All is then visualized in a beautiful [HTML5 report analyzer](https://github.com/azachar/screenshoter-report-analyzer).**

**We support multi capabilities and multi browsers instances, too.**

## Features

1. This plugin can take screenshots of each **Jasmine2** expect **success/failure** on _multiple-browsers instances_ at once.
2. It can take **screenshots** of each **spec** failure/success as well
3. For each **expectation** or spec can capture console logs for **each browser instance**
4. It can generate a report analyzer - angular+bootstrap **HTML reports** with active filtering to easily find out why your tests are failing
5. HTML reports allow you to analyze your browser's **console logs** as well.
6. Supports extracting build information (the report displays a build number, a branch, etc. ) for [GitLab](https://gitlab.com) **CI/CD**, [CircleCI](https://circleci.com) and [Travis](https://travis-ci.org/).
7. Supports parallel tests execution
8. Makes optional **Ascii** screenshots
9. **Multi capabilities** are supported
10. For each expectation or spec can capture **raw HTML** for each browser instance
11. For each expectation or spec can obtain a **DB dump** via a function returning ``callback(err, dumpAsString)``


Additional HTML reporter features:

1. domain log filter (to narrow down your test classes faster)
2. excludes certain repetitive logs
3. opens for each screenshot its rendered HTML code

## Screenshots

### Reporter Controls

![Screenshoter reporter controlls](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot1.png)

### Expanded Spec

![Screenshoter reporter spec](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot2.png)

### Forked Browser Support

![Screenshoter multi browsers](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot4.png)

### Console log management

![Screenshoter reporter console](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot3.png)

####  Stacktrace filtering
![Screenshoter reporter stacktrace filtering](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot5.png)


## Motivation

The main motivation to make this fork from <https://github.com/abhishekswain/jasmine2-protractor-utils> was taking screenshots from multiple browsers at once. So it would allow me to test a chat alike apps where 2+ browsers instances are required to be run from one single test.

Later on, I realized that I want to have a quick overview what is happening with my tests on the CI server. Without even re-running them locally. When something goes wrong you are basically unable to discover it. This plugin allows you to do so.

The included HTML reporter is Angular based standalone app with a beautiful Bootstrap theme. It allows filtering and narrows down to the root cause. Each screenshot has attached console logs. And we are making screenshots by every expectation not just when the spec is done (this is usually too late to find out, why your test is failing).

Using this plugin without the HTML report doesn't make sense. The main added value is to have a great analytics tool for your reports that visualize all possible available data to provide a holistic approach.

From the code perspective, I split up the report code from the protractor plugin. Perhaps you can plugin in your reporter instead. Also, I think that any open source project must have good test coverage. So I provided the initial set of unit and integrational tests. :beer:

Also, I created a list of [alternatives](https://github.com/azachar/protractor-screenshoter-plugin/wiki/Alernatives) to this plugin and why I think they are just not good enough.

# How to install

If your protractor is installed locally, then

```
npm install protractor-screenshoter-plugin
```

If your protractor is installed globally, then
```
npm install --global protractor-screenshoter-plugin
```

or install this plugin locally, but then you must specify the plugin's path like this:

```
    plugins: [{
        package: 'node_modules/protractor-screenshoter-plugin/index.js',
        ...
    }],
```
as mentioned in #37.

**NOTE**:

1. This plugin depends on [screenshoter-report-analyzer](https://github.com/azachar/screenshoter-report-analyzer). So sometimes even if this plugin version is not updated, the reporter might be.

2. If you want to use the option `imageToAscii`, then you need to install additional dependencies depending on your OS. By default is this option turned off.
```sh
  # Ubuntu
  sudo apt-get install graphicsmagick

  # Fedora
  sudo dnf install GraphicsMagick

  # CentOS / RHEL
  sudo yum install --enablerepo epel GraphicsMagick

  # OS X
  brew install graphicsmagick

  # Windows users can install the binaries from http://www.graphicsmagick.org/
  # ...or using the command line:
  # Chocolatey (package manager for Windows)
  # (Restart of cmd/PowerShell is required)
  choco install graphicsmagick
```

  Then, install this optional package
```sh
  npm install image-to-ascii@3.0.11
```

# Experimental features

Please always check our branches started with `feat-`. There are some new and shiny features that are working but aren't yet published. Each branch has information how to use it and install it. Once it is stable enough, it will be merged into the master branch.
Feel free to provide feedback to them.

# Usage

Add this plugin to the protractor config file:

Example:

```javascript
exports.config = {
    framework: 'jasmine2',

    plugins: [{
        package: 'protractor-screenshoter-plugin',
        screenshotPath: './REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'none',
        withLogs: true,
        writeReportFreq: 'asap',
        imageToAscii: 'none',
        clearFoldersBeforeTest: true
      }],

      onPrepare: function() {
          // returning the promise makes protractor wait for the reporter config before executing tests
          return global.browser.getProcessedConfig().then(function(config) {
              //it is ok to be empty
          });
      }
};
```

Here is the full list of possible options, more details see below in the [config reference](#config-reference) section.

```javascript
exports.config = {
       plugins: [{
       package: 'protractor-screenshoter-plugin',
       screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
       screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
       htmlOnExpect: {String}    (Default - 'failure', 'failure+success', 'none'),
       htmlOnSpec: {String}    (Default - 'failure', 'failure+success', 'none'),
       withLogs: {Boolean}      (Default - true),
       htmlReport: {Boolean}      (Default - true),
       screenshotPath: {String}                (Default - '<reports/e2e>/screenshots')
       writeReportFreq: {String}      (Default - 'end', 'spec', 'asap'),
       verbose: {String} (Default - 'info', 'debug'),
       pauseOn: {String}    (Default - 'never', 'failure', 'spec'),
       imageToAscii: {String}    (Default - 'none', 'failure+success', 'failure'),
       imageToAsciiOpts:{Obbject} (Default - {bg:true})
       clearFoldersBeforeTest: {Boolean}       (Default - false),
       failTestOnErrorLog: {
                failTestOnErrorLogLevel: {Number},  (Default - 900)
                excludeKeywords: {A JSON Array}
                suites: {A JSON Array}
           }
       }],
       dumpOnExpect: {String}    (Default - 'failure', 'failure+success', 'none'),
       dumpOnSpec: {String}    (Default - 'none', 'failure+success', 'failure'),
       dump: {Function} (Default - null),
       onPrepare: function () {
        // returning the promise makes protractor wait for the reporter config before executing tests
        return global.browser.getProcessedConfig().then(function (config) {
          //it is ok to be empty
        });
       }
     };
```


## Single browser app

No need to setup anything special to make screenshots or capture console logs.

## Multi-browser chat alike app

In order to use multi-browser chat alike testing, you need to keep a track of all browser instances by yourself:

You can do it like this

```javascript
var a  = browser.forkNewDriverInstance();
var b  = browser.forkNewDriverInstance();

global.screenshotBrowsers['anyCustomNameOfBrowserDisplayedInReports'] = a;
global.screenshotBrowsers.userB = b;
```

if you close the browser, remove it also from global.screenshotBrowsers After closing browser making screenshots won't work. Make sense, right no browser no screenshot.

```
delete global.screenshotBrowsers.userB;
```

to reset screenshotBrowsers from your previous spec use this code

```javascript
beforeAll(function() {
    global.screenshotBrowsers = {};
  });
```

## Running tests in parallel

For each run of Protractor, it creates separate tests results that are in the end merged into one report.

The configuration such as this one are supported as of version 0.3.x:

```javascript
exports.config = {
    framework: 'jasmine2',
    //like usual (no change in config api)
    plugins: [{
        package: 'protractor-screenshoter-plugin',
        screenshotPath: './REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'none',
        withLogs: true,
        writeReportFreq: 'asap',
        clearFoldersBeforeTest: true
    }],
    //this is new and supported
    capabilities: {
        'browserName':'chrome',
        'shardTestFiles': true,
        'maxInstances': 5
    }
};
```


## Ascii screenshots
If there is a failure (based on the config) it creates also an ASCII image into a log file. For this feature, you need to install additional OS dependent libraries. For more information read the [doc imageToAscii](#imagetoascii) bellow.


# Config reference

## Environmental variables

Screenshoter out-of-box obtains build information. However, some CI does not have an environmental variable for a commit message. Thus you need to obtain it manually:

**GitLab**
```sh
   export CI_COMMIT_MSG=$(git log -1 --pretty=%B)
```

**CircleCI**
```sh
   export CIRCLE_MSG=$(git log -1 --pretty=%B)
```

If CI will support one day these variables, you won't need to enter anything in your build process.

Do you want to see exactly what is extracted, consult the code directly [obtainCIVariables](index.js#L551)

## dump
If set a function, allows you to run extra command that produce a dump. The dump is taken depending on value in [dumpOnSpec](#dumponspec) or [dumpOnExpect](#dumponexpect).

This allows you to greater examine your failed expectation/spec from multiple perspectives,

one is a screenshot (unfortunately selenium cannot make a whole page screenshot, only what is in the visible browser's window),

the second is a whole page raw HTML  ( this helps to overcome limitations in seeing only screenshots)

and the third could be for example a DB dump that is all nicely linked to expectations.

_Note_: Implementation of the **dump function** is up to you, you provide any function that **must return a string** directly or in a `callback(err, dumpString)`.

Default: `null`

Valid Options: `null` / `Function`

## dumpOnExpect

Calls the `dump` function for each Jasmine2 expect failure or success, depending on value.

Default: `'failure'`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## dumpOnSpec

Calls the `dump` function for each Jasmine2 spec failure or success, depending on value.

Default: `none`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## htmlReport

If set to `false`, disables HTML report generation.

**NOTE: This tool doesn't really make sense to use without the reports.**

Default: `true`

Valid Options:
`true`/`false`

## screenshotOnExpect

Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 expect failure or success, depending on value.

Default: `'failure+success'`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## screenshotOnSpec

Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 spec failure or success, depending on value.

Default: `failure+success`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## htmlOnExpect

Takes from each browser instance stored in global.screenshotBrowsers raw html for each Jasmine2 expect failure or success, depending on value.

Default: `'failure'`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## htmlOnSpec

Takes from each browser instance stored in global.screenshotBrowsers raw html for each Jasmine2 spec failure or success, depending on value.

Default: `'failure'`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

## pauseOn

If fails, pause browser on expectation failure or spec failure or never.

Default: `'never'`

Valid Options: `'failure'`/`'spec'`

## verbose

If set to ``debug`` display internal logging.

Default: `'info'`

Valid Options: `'debug'`/`'info'`

## imageToAscii

Additionally, make an ASCII image into the console so you can find the issue of you test in your build easier.

Please note that one of the options of `screenshotOnExpect` or `screenshotOnSpec` must be used to generate the initial screenshot that as additionally transformed into an ASCII image.

If you are using multiple browsers instances you can disable generating ASCII images individually by setting

```js
browser.skipImageToAscii = true;
```
Then this browser instance will be not generated in the log file.

Default: `'failure'`

Valid Options: `'failure+success'`/`'failure'`/`'none'`

To use this feature please follow instructions on <https://github.com/IonicaBizau/image-to-ascii/blob/master/INSTALLATION.md>

and also please install the optional dependency
```
npm install image-to-ascii
```

## imageToAsciiOpts

Options for imageToAscii conversion, more info can be found at <https://github.com/IonicaBizau/image-to-ascii>

Default: ``{bg:true}``

## withLogs (Chrome only)

If set to `true`, capture from chrome all logs after each expect or spec

_NOTE: This works only on chrome!_

Default: `true`

Valid Options: `true`/`false`

In order to make chrome' console works properly, you need to modify your `protractor.conf` as follows <https://github.com/webdriverio/webdriverio/issues/491#issuecomment-95510796>

## writeReportFreq

By default, the output JSON file with tests results is written at the end of the execution of jasmine tests. However, for debugging, is better to get it written immediately after each expectation - specify the option 'asap'. Also, there is a less usual option to write it after each test - use the option 'spec'. The recommended is to left it out for a CI server and for a local debugging use the option 'asap'.

Default: `'end'`

Valid Options: `'asap'`, `'spec'`, `'end'`

_NOTE: Using option ASAP might introduce unpredictable race conditions if multiple browsers are tested at once. It happens when we automatically collect results of all particulars JSON report files into one final.

## screenshotPath

The path where the final report including screenshots will be saved. If the path does not exist, will be created. e.g `./reports/something/samewhere/`, please take care of `./` and `/` at the beginning and end.

Please note that due to an HTML reporter sugar, the final screenshots are stored in the subfolder relative to this $screenshotPath parameter, e.g. in the folder `$screenshotPath/screenshots'`

Default: `'reports/e2e'`

## clearFoldersBeforeTest

If this flag set to true, screenshot and HTML report directories will be emptied before generating new reports and screenshots

Default: `false`

## failTestOnErrorLog (Chrome only)

Contains a set of configuration for console log. When browser console has errors of a certain log level (default:>900), the spec/test is marked failed along with log in the error report/stacktrace.

_NOTE: This works only on chrome!_

### failTestOnErrorLogLevel

Log level, the test fails of the browser console log has logs **more than** this specified level.

Default: `900`

### excludeKeywords

An array of keywords to be excluded while searching for error logs. i.e If a log contains any of these keywords, spec/test will not be marked failed.

Please do not specify this flag, if you don't supply any such keywords.

### suites

An array of `suites` (protractor.config.suites) where the failTestOnErrorLog will run.

Please do not specify this flag, if you want all your tests to run through this failTestOnErrorLog validation.

# Development

Please follow [CONTRIBUTING.md](https://github.com/azachar/protractor-screenshoter-plugin/blob/master/CONTRIBUTING.md).
