var fse = require('fs-extra');
var klawSync = require('klaw-sync');

describe("Screenshoter unit", function() {

  var screenshoter;
  beforeEach(function() {
    screenshoter = require('../../index.js');
    global.browser = jasmine.createSpyObj('browser', ['getProcessedConfig']);
    browser.getProcessedConfig.and.callFake(function() {
      return jasmine.createSpyObj('promise', ['then']);
    });
  });


  it("should be defined", function() {
    expect(screenshoter).toBeDefined();
  });


  ['.tmp/cleanFolders', '.tmp/cleanFolders/'].forEach(function(screenshotPath) {

    describe('cleanup folders for ' + screenshotPath, function() {

      beforeEach(function() {
        fse.ensureDirSync('.tmp/cleanFolders/reports');
        fse.outputFileSync('.tmp/cleanFolders/reports/report.js', '{}');
        fse.outputFileSync('.tmp/cleanFolders/index.html', 'html');

        var files = klawSync('.tmp/cleanFolders', {
          nodir: true
        });
        expect(files.length).toBe(2);

        screenshoter.config = {
          'screenshotPath': screenshotPath
        };
      });

      it("should clean up folders with explicit value", function() {
        screenshoter.config.clearFoldersBeforeTest = true;
        screenshoter.setup();
        var files = klawSync('.tmp/cleanFolders', {
          nodir: true
        });
        expect(files.length).toBe(0);
      });

      it("should clean up folders default value", function() {
        screenshoter.setup();
        var files = klawSync('.tmp/cleanFolders', {
          nodir: true
        });
        expect(files.length).toBe(0);
      });
      it("should not clean up folders", function() {
        screenshoter.config.clearFoldersBeforeTest = false;
        screenshoter.setup();
        var files = klawSync('.tmp/cleanFolders', {
          nodir: true
        });
        expect(files.length).toBe(2);
      });

    });
  });


  it("should resolve a default config", function() {
    screenshoter.config = {};
    screenshoter.setup();
    expect(screenshoter.config.reportFile).toBeDefined();
    delete screenshoter.config.reportFile;
    expect(screenshoter.config).toEqual({
      screenshotPath: './reports/e2e',
      withLogs: true,
      screenshotOnExpect: 'failure+success',
      screenshotOnSpec: 'failure+success',
      htmlOnExpect: 'failure',
      htmlOnSpec: 'failure',
      dump: null,
      dumpOnExpect: 'failure',
      dumpOnSpec: 'none',
      pauseOn: 'never',
      verbose: 'info',
      imageToAscii: 'none',
      imageToAsciiOpts: {
        bg: true
      },
      clearFoldersBeforeTest: true,
      htmlReport: true,
      writeReportFreq: 'end'
    });
  });

  it("should keep framework specific config", function() {
    screenshoter.config = {
      path: './bla/bla'
    };
    screenshoter.setup();
    expect(screenshoter.config.reportFile).toBeDefined();
    delete screenshoter.config.reportFile;
    expect(screenshoter.config).toEqual({
      screenshotPath: './reports/e2e',
      withLogs: true,
      screenshotOnExpect: 'failure+success',
      screenshotOnSpec: 'failure+success',
      htmlOnExpect: 'failure',
      htmlOnSpec: 'failure',
      dump: null,
      dumpOnExpect: 'failure',
      dumpOnSpec: 'none',
      pauseOn: 'never',
      verbose: 'info',
      imageToAscii: 'none',
      imageToAsciiOpts: {
        bg: true
      },
      clearFoldersBeforeTest: true,
      htmlReport: true,
      writeReportFreq: 'end',
      path: './bla/bla'
    });
  });


  it("should merge user config", function() {
    screenshoter.config = {
      screenshotPath: 'REPORTS',
      screenshotOnSpec: 'failure'
    };
    screenshoter.setup();
    expect(screenshoter.config.reportFile).toBeDefined();
    delete screenshoter.config.reportFile;
    expect(screenshoter.config).toEqual({
      screenshotPath: 'REPORTS',
      withLogs: true,
      screenshotOnExpect: 'failure+success',
      screenshotOnSpec: 'failure',
      htmlOnExpect: 'failure',
      htmlOnSpec: 'failure',
      dump: null,
      dumpOnExpect: 'failure',
      dumpOnSpec: 'none',
      imageToAscii: 'none',
      pauseOn: 'never',
      verbose: 'info',
      imageToAsciiOpts: {
        bg: true
      },
      clearFoldersBeforeTest: true,
      writeReportFreq: 'end',
      htmlReport: true
    });
  });

  describe('obtainCIVariables', function() {
    it("should support GITLAB_CI", function() {
      var env = {
        GITLAB_CI: true,
        CI_JOB_ID: '1234',
        CI_COMMIT_REF_NAME: 'branch',
        CI_COMMIT_SHA: 'sha',
        CI_COMMIT_TAG: 'tag',
        CI_PROJECT_PATH: 'a/b',
        CI_COMMIT_MSG: 'commit',
        CI_PROJECT_URL: 'https://gitlab.com/a/b'
      }
      var ci = screenshoter.obtainCIVariables(env);

      expect(ci).toBeDefined();
      expect(ci.build).toEqual('1234');
      expect(ci.tag).toEqual('tag');
      expect(ci.sha).toEqual('sha');
      expect(ci.branch).toEqual('branch');
      expect(ci.name).toEqual('a/b');
      expect(ci.commit).toEqual('commit');
      expect(ci.url).toEqual('https://gitlab.com/a/b/-/jobs/1234');
    });

    it("should support TRAVIS", function() {
      var env = {
        TRAVIS: true,
        TRAVIS_BUILD_ID: '1234',
        TRAVIS_JOB_NUMBER: '1',
        TRAVIS_BRANCH: 'branch',
        TRAVIS_COMMIT: 'sha',
        TRAVIS_TAG: 'tag',
        TRAVIS_REPO_SLUG: 'a/b',
        TRAVIS_COMMIT_MESSAGE: 'commit',
        CI_PROJECT_URL: 'https://gitlab.com/a/b'
      }
      var ci = screenshoter.obtainCIVariables(env);

      expect(ci).toBeDefined();
      expect(ci.build).toEqual('1');
      expect(ci.tag).toEqual('tag');
      expect(ci.sha).toEqual('sha');
      expect(ci.branch).toEqual('branch');
      expect(ci.name).toEqual('a/b');
      expect(ci.commit).toEqual('commit');
      expect(ci.url).toEqual('https://travis-this.ci.org/a/b/builds/1234');
    });

    it("should support CIRCLECI", function() {
      var env = {
        CIRCLECI: true,
        CIRCLE_BUILD_NUM: '1234',
        CIRCLE_BRANCH: 'branch',
        CIRCLE_SHA1: 'sha',
        CIRCLE_TAG: 'tag',
        CIRCLE_PROJECT_REPONAME: 'a/b',
        CIRCLE_MSG: 'commit',
        CIRCLE_BUILD_URL: 'https://circleci.com/some/ulr'
      }
      var ci = screenshoter.obtainCIVariables(env);

      expect(ci).toBeDefined();
      expect(ci.build).toEqual('1234');
      expect(ci.tag).toEqual('tag');
      expect(ci.sha).toEqual('sha');
      expect(ci.branch).toEqual('branch');
      expect(ci.name).toEqual('a/b');
      expect(ci.commit).toEqual('commit');
      expect(ci.url).toEqual('https://circleci.com/some/ulr');
    });

    it("should support Local environment", function() {
      var env = {}
      var ci = screenshoter.obtainCIVariables(env);

      expect(ci).toBeDefined();
      expect(ci.build).toBeUndefined();
      expect(ci.tag).toBeUndefined();
      expect(ci.sha).toBeUndefined();
      expect(ci.branch).toBeUndefined();
      expect(ci.name).toBeUndefined();
      expect(ci.commit).toBeUndefined();
      expect(ci.url).toBeUndefined();
    });
  });
});
