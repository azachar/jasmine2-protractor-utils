[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/protractor-screenshoter-plugin/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm](https://img.shields.io/npm/dm/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![npm](https://img.shields.io/npm/dt/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin)

[![npm](https://img.shields.io/npm/v/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![npm](https://img.shields.io/npm/l/protractor-screenshoter-plugin.svg?style=flat-square)](https://www.npmjs.com/package/protractor-screenshoter-plugin) [![Semver](http://img.shields.io/SemVer/2.0.0.png)](http://semver.org/spec/v2.0.0.html) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![Dependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin) [![devDependency Status](https://david-dm.org/azachar/protractor-screenshoter-plugin/dev-status.svg)](https://david-dm.org/azachar/protractor-screenshoter-plugin#info=devDependencies)

[![Build Status](https://travis-ci.org/azachar/protractor-screenshoter-plugin.svg?branch=master)](https://travis-ci.org/azachar/protractor-screenshoter-plugin)

# protractor-screenshoter-plugin

This plugin captures for each **expectation** or **spec** console **logs** and makes **screenshots** for **each browser** instance. Also it comes with a beautifull angular based [HTML reporter for chat alike apps](https://github.com/azachar/screenshoter-report-analyzer).

1. This plugin can take screenshots for each Jasmine2 expect success/failure on _multiple-browsers instances_ at once.
2. It can take screenshots for each spec failure/success as well
3. For each expectation or spec can capture console logs for each browser instance
4. It can generate a report analyzer - angular+bootstrap HTML reports with active filtering to easy find out why your tests are failing
5. HTML reports allow you to analyze your browser's console logs as well.
6. Supports circleci.com (the report displays a build number, a branch, etc. )
7. Supports parallel tests execution
8. Makes optional Ascii screenshots


## Screenshots

### Reporter Controls

![Screenshoter reporter controlls](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot1.png)

### Expanded Spec

![Screenshoter reporter spec](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot2.png)

### Forked Browser Support

![Screenshoter multi browsers](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot4.png)

### Console log management

![Screenshoter reporter console](https://cdn.rawgit.com/azachar/screenshoter-report-analyzer/master/screenshots/screenshot3.png)

## Motivation

The main motivation to make this fork from <https://github.com/abhishekswain/jasmine2-protractor-utils> was taking screenshots from multiple browsers at once. So it would allow me to test a chat alike apps where 2+ browsers instances are required to be run from one single test.

Later on, I realized that I want to have a quick overview what is happening with my tests on the CI server. Without even re-running them locally. When something goes wrong you are basically unable to discover it. This plugin allows you to do so.

The included HTML reporter is Angular based standalone app with a beautiful Bootstrap theme. It allows filtering and narrows down to the root cause. Each screenshot has attached console logs. And we are making screenshots by every expectation not just when the spec is done (this is usually too late to find out, why your test is failing).

Using this plugin without the HTML report doesn't make sense. The main added value is to have a great analytics tool for your reports that visualize all possible available data to provide a holistic approach.

From the code perspective, I split up the report code from the protractor plugin. Perhaps you can plugin in your reporter instead. Also, I think that any open source project must have good test coverage. So I provided the initial set of unit and integrational tests. :beer:

Also, I created a list of [alternatives](https://github.com/azachar/protractor-screenshoter-plugin/wiki/Alernatives) to this plugin and why I think they are just not good enough.

# How to install

```
npm install protractor-screenshoter-plugin
```

NOTE: This plugin depends on [screenshoter-report-analyzer](https://github.com/azachar/screenshoter-report-analyzer). So sometimes even if this plugin version is not updated, the reporter might be.

# Experimental features

Please always check our branches started with `feat-`. There are some new and shiny features that are working but aren't yet published. Each branch has information how to use it and install it. Once it is stable enough, it will be merged to the master branch.
Feel free to provide feedback to them.

# Usage

Add this plugin to the protractor config file:

```javascript
exports.config = {
       plugins: [{
       package: 'protractor-screenshoter-plugin',
       screenshotOnExpect: {String}    (Default - 'failure+success', 'failure', 'none'),
       screenshotOnSpec: {String}    (Default - 'failure+success', 'failure', 'none'),
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
           }
       }],
       onPrepare: function () {
        // returning the promise makes protractor wait for the reporter config before executing tests
        return global.browser.getProcessedConfig().then(function (config) {
          //it is ok to be empty
        });
       }
     };
```

Example:

```javascript
exports.config = {
    framework: 'jasmine2',

    plugins: [{
        package: 'protractor-screenshoter-plugin',
        screenshotPath: './REPORTS/e2e',
        screenshotOnExpect: 'failure+success',
        screenshotOnSpec: 'none',
        withLogs: 'true',
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
        withLogs: 'true',
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

## htmlReport

If set to 'false', disables HTML report generation.

**NOTE: This tool doesn't really make sense to use without the reports.**

Default: 'true' Valid Options: true/false

## screenshotOnExpect

Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 expect failure or success, depending on value.

Default: 'failure+success' Valid Options: 'failure+success'/'failure'/'none'

## screenshotOnSpec

Takes from each browser instance stored in global.screenshotBrowsers screenshots for each Jasmine2 spec failure or success, depending on value.

Default: 'failure' Valid Options: 'failure+success'/'failure'/'none'

## pauseOn

If fails, pause browser on expectation failure or spec failure or never.

Default: 'never' Valid Options: 'failure'/'spec'

## verbose

If set to ``debug`` display internal logging.

Default: 'info' Valid Options: 'debug'/'info'

## imageToAscii

Additionally, make an ASCII image into the console so you can find the issue of you test in your build easier.

Please note that one of the options of `screenshotOnExpect` or `screenshotOnSpec` must be used to generate the initial screenshot that as additionally transformed into an ASCII image.

If you are using multiple browsers instances you can disable generating ASCII images individually by setting

```js
browser.skipImageToAscii = true;
```
Then this browser instance will be not generated in the log file.

Default: 'failure' Valid Options: 'failure+success'/'failure'/'none'

To use this feature please follow instructions on <https://github.com/IonicaBizau/image-to-ascii/blob/master/INSTALLATION.md>

and also please install the optional dependency
```
npm install image-to-ascii
```

## imageToAsciiOpts

Options for imageToAscii conversion, more info can be found at <https://github.com/IonicaBizau/image-to-ascii>

Default: ``{bg:true}``

## withLogs (Chrome only)

If set to 'true', capture from chrome all logs after each expect or spec

_NOTE: This works only on chrome!_

Default: 'true' Valid Options: true/false

In order to make chrome' console works properly, you need to modify your `protractor.conf` as follows <https://github.com/webdriverio/webdriverio/issues/491#issuecomment-95510796>

## writeReportFreq

By default, the output JSON file with tests results is written at the end of the execution of jasmine tests. However for debug process is better to get it immediately after each expectation - specify the option 'asap'. Also, there is a less usual option to write it after each test - use the option 'spec'. The recommended is to left it out for a CI server and for a local debugging use the option 'asap'.

Default: 'end' Valid Options: 'asap', 'spec', 'end'

## screenshotPath

The path where the final report including screenshots will be saved. If the path does not exist, will be created. e.g './reports/something/samewhere/', please take care of './' and '/' at the beginning and end.

Please note that due to an HTML reporter sugar, the final screenshots are stored in the subfolder relative to this $screenshotPath parameter, e.g. in the folder `$screenshotPath/screenshots'`

Default: 'reports/e2e'

## clearFoldersBeforeTest

If this flag set to true, screenshot and HTML report directories will be emptied before generating new reports and screenshots

Default: false

## failTestOnErrorLog (Chrome only)

Contains a set of configuration for console log. When browser console has errors of a certain log level (default:>900), the spec/test is marked failed along with log in the error report/stacktrace.

_NOTE: This works only on chrome!_

### failTestOnErrorLogLevel

Log level, test fails of the browser console log has logs **more than** this specified level.

Default: 900

### excludeKeywords

An array of keywords to be excluded, while searching for error logs. i.e If a log contains any of these keywords, spec/test will not be marked failed.

Please do not specify this flag, if you don't supply any such keywords.

# Development

After cloning the project you can run tests as follows:

1. `npm install`
2. `npm run setup`
3. `npm run server &`
4. `npm test`

## Committing

Please use `git-cz` to format your commit message.

## Contributing
- Your PR is more than welcome!
- Please include always tests in your PR.
- If you find a bug, please create a test case for it that fails first, then write your fix. If all passes on Travis, feel free to provide PR.

### How to write tests for your contribution

We are testing our plugin for protractor,

1. so we need an e2e protractor test.

  There are already some e2e tests in ``spec/integrational/protractor`` that can be reused. Basically, we run sample e2e tests against http://www.angularjs.org. So if this page is changed or inaccessible our tests will fail too :(

  ***Note***: *Any PR that will create a local dummy server that our sample tests will run against is welcome :)*

2. Then we need a screenshoter configuration that we will run the protractor e2e tests against. Please write your new config in
``spec/integrational/protractor-config\bugXXX.js``

3. Please always specify a unique directory for your new screenshoter config, so it doesn't interfere with the existing tests.

  ```js
  var env = require('../environment');

  exports.config = {
      seleniumAddress: env.seleniumAddress,
      framework: 'jasmine2',
      specs: ['../protractor/angularjs-homepage-test.js'],
      plugins: [{
          path: '../../../index.js',

          screenshotPath: '.tmp/bugXXX',
      }]
  };
  ```

4. write your jasmine test (copy the whole describe block from existing one and modify it to your needs).

  Mainly modify
  ```js
    beforeAll(function() {
        runProtractorWithConfig('bugXXX.js');
    });
  ```

To check results from protractor e2e tests, simply run

```
node_modules/protractor/bin/protractor spec/integrational/protractor-config/bugXXX.js
```

Then you can tweak your jasmine test to check the correct behavior of your screenshoter bugfix or feature.

5. to run jasmine tests use  `npm test` after
  1. `npm install`
  2. `npm run setup` This will install webdriver
  3. `npm run server &` This will run selenium server


### Releasing

To deploy a new version run commands. If all tests are passed it will be published to npm on its own.

```
npm run release
git push --follow-tags origin master
```

## TODO

- Convert to typescript based es6 npm plugin with a proper test infrastructure
- Support Mocha framework
- 100% Test coverage
