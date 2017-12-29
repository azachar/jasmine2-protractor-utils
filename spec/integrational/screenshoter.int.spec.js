var env = require('./environment');
var path = require('path');

var fs = require('fs-extra');
var cp = require('child_process');

function runProtractorWithConfig(configName, params) {
  var command = 'node_modules/protractor/bin/protractor ./spec/integrational/protractor-config/' + configName;
  if (env.coverage) {
    command = 'nyc --reporter lcov ' + command;
  }

  params = params ? ' ' + params : '';
  command += params;

  console.info('Running command ' + command);
  try {
    cp.execSync(command, {
      // stdio: [0, 1, 2] //for full debug
      stdio: env.debug ? [0, 1, 2] : [2]
    });
    console.info('Done with command ' + command);
    return true;
  } catch (er) {
    //console.log(er.stack);
    if (er.pid) {
      console.log('%s (pid: %d) exited with status %d',
        er.file, er.pid, er.status);
    }
    return false;
  }
}

function installOptionaDependencies() {
  var command = 'npm install image-to-ascii';
  console.info('Running command ' + command);
  try {
    cp.execSync(command, {
      // stdio: [0, 1, 2] //for full debug
      stdio: env.debug ? [0, 1, 2] : [2]
    });
    console.info('Done with command ' + command);
    return true;
  } catch (er) {
    //console.log(er.stack);
    if (er.pid) {
      console.log('%s (pid: %d) exited with status %d',
        er.file, er.pid, er.status);
    }
    return false;
  }
}

function getReportAsJson(data) {
  var before = "angular.module('reporter').constant('data',";
  var after = ");";
  var content = data.substr(before.length, data.length - after.length - before.length);
  return JSON.parse(content);
}

describe("Screenshoter running under protractor", function() {

  beforeAll(function clearTmpFolder() {
    try {
      fs.removeSync('.tmp');
    } catch (err) {
      console.error(err);
    }
  });

  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  beforeAll(function() {
    fs.removeSync('.tmp');
    fs.removeSync('reports');
  });

  describe("out of box configuration - default", function() {

    beforeAll(function() {
      runProtractorWithConfig('default.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('./reports/e2e/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(3);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(3);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(1);
        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(1);
        expect(report.tests[1].specScreenshots[0].img).toBeDefined();
        expect(report.tests[1].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[1].specScreenshots[0].when).toBeDefined();

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(2);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].when).toBeDefined();

        expect(report.tests[2].specLogs.length).toBe(0);
        expect(report.tests[2].specScreenshots.length).toBe(1);
        expect(report.tests[2].specScreenshots[0].img).toBeDefined();
        expect(report.tests[2].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[2].specScreenshots[0].when).toBeDefined();

        expect(report.tests[2].failedExpectations.length).toBe(0);
        expect(report.tests[2].passedExpectations.length).toBe(2);
        expect(report.tests[2].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[2].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].when).toBeDefined();

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('./reports/e2e/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(8);
        done();
      });
    });


    it("should install reporter", function(done) {
      fs.readFile('./reports/e2e/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });

  });

  describe("suggested configuration from readme", function() {

    beforeAll(function() {
      runProtractorWithConfig('readme.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/readme/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(3);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(3);
        expect(report.tests[0].specScreenshots.length).toBe(0);
        expect(report.tests[0].specLogs.length).toBe(0);

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specScreenshots.length).toBe(0);
        expect(report.tests[1].specLogs.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(2);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].when).toBeDefined();

        expect(report.tests[2].specScreenshots.length).toBe(0);
        expect(report.tests[2].specLogs.length).toBe(0);

        expect(report.tests[2].failedExpectations.length).toBe(0);
        expect(report.tests[2].passedExpectations.length).toBe(2);
        expect(report.tests[2].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[2].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].when).toBeDefined();

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/readme/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(5);
        done();
      });
    });

    it("should install reporter", function(done) {
      fs.readFile('.tmp/readme/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });
  });

  describe("bug #4", function() {
    it("should run without errors", function() {
      expect(runProtractorWithConfig('bug4.js')).toBeTruthy();
    });
  });

  describe("nohtml", function() {

    beforeAll(function() {
      runProtractorWithConfig('nohtml.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/nohtml/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(3);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(3);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(0);

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(2);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].when).toBeDefined();

        expect(report.tests[2].specLogs.length).toBe(0);
        expect(report.tests[2].specScreenshots.length).toBe(0);

        expect(report.tests[2].failedExpectations.length).toBe(0);
        expect(report.tests[2].passedExpectations.length).toBe(2);
        expect(report.tests[2].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[2].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].when).toBeDefined();

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/nohtml/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(5);
        done();
      });
    });

    it("should not install reporter", function(done) {
      fs.readFile('.tmp/nohtml/index.html', 'utf8', function(err, data) {
        if (err) {
          return done();
        }
        done.fail('should skip generating reporter');
      });
    });
  });

  describe("failures", function() {

    beforeAll(function() {
      runProtractorWithConfig('failures.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/failures/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(1);
        expect(report.stat.failed).toBe(1);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(2);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(1);
        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].passedExpectations.length).toBe(0);
        expect(report.tests[0].failedExpectations.length).toBe(1);
        expect(report.tests[0].failedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].failedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].failedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].failedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].failedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(0);

        done();
      });
    });

    it("should generate failure screenshots", function(done) {
      fs.readdir('.tmp/failures/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(2);
        done();
      });
    });
  });

  describe("none", function() {

    beforeAll(function() {
      runProtractorWithConfig('none.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/none/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(1);
        expect(report.stat.failed).toBe(1);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(2);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(0);

        expect(report.tests[0].passedExpectations.length).toBe(0);
        expect(report.tests[0].failedExpectations.length).toBe(1);
        expect(report.tests[0].failedExpectations[0].logs).toBeUndefined();
        expect(report.tests[0].failedExpectations[0].screenshots).toBeUndefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].logs).toBeUndefined();
        expect(report.tests[1].passedExpectations[0].screenshots).toBeUndefined();

        done();
      });
    });

    it("should not generate screenshots", function(done) {
      fs.readdir('.tmp/none/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(0);
        done();
      });
    });
  });

  describe("multi browser support", function() {

    beforeAll(function() {
      runProtractorWithConfig('multi.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/multi/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(1);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(1);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(2);

        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBe('first');
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].specScreenshots[1].img).toBeDefined();
        expect(report.tests[0].specScreenshots[1].browser).toBe('second');
        expect(report.tests[0].specScreenshots[1].when).toBeDefined();

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(2);


        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(2);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(2);

        expect(report.tests[0].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].browser).toBe('first');
        expect(report.tests[0].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[0].passedExpectations[0].screenshots[1].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[1].browser).toBe('second');
        expect(report.tests[0].passedExpectations[0].screenshots[1].when).toBeDefined();

        expect(report.tests[0].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[1].screenshots[0].browser).toBe('first');
        expect(report.tests[0].passedExpectations[1].screenshots[0].when).toBeDefined();

        expect(report.tests[0].passedExpectations[1].screenshots[1].img).toBeDefined();
        expect(report.tests[0].passedExpectations[1].screenshots[1].browser).toBe('second');
        expect(report.tests[0].passedExpectations[1].screenshots[1].when).toBeDefined();

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/multi/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(6);
        done();
      });
    });

    it("should install reporter", function(done) {
      fs.readFile('.tmp/multi/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });
  });

  describe("failTestOnErrorLog", function() {

    beforeAll(function() {
      runProtractorWithConfig('failTestOnErrorLog.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/failTestOnErrorLog/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.failed).toBe(2);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(2);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(1);

        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBe('default');
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].failedExpectations.length).toBe(1);

        expect(report.tests[0].failedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].failedExpectations[0].screenshots[0].browser).toBe('default');
        expect(report.tests[0].failedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[0].passedExpectations.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(0);

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(2);

        expect(report.tests[1].specScreenshots[0].img).toBeDefined();
        expect(report.tests[1].specScreenshots[0].browser).toBe('first');
        expect(report.tests[1].specScreenshots[0].when).toBeDefined();

        expect(report.tests[1].specScreenshots[1].img).toBeDefined();
        expect(report.tests[1].specScreenshots[1].browser).toBe('second');
        expect(report.tests[1].specScreenshots[1].when).toBeDefined();

        expect(report.tests[1].failedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[1].failedExpectations[0].screenshots[0].browser).toBe('first');
        expect(report.tests[1].failedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].failedExpectations[0].screenshots[1].img).toBeDefined();
        expect(report.tests[1].failedExpectations[0].screenshots[1].browser).toBe('second');
        expect(report.tests[1].failedExpectations[0].screenshots[1].when).toBeDefined();

        expect(report.tests[1].passedExpectations.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(0);

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/failTestOnErrorLog/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(6);
        done();
      });
    });

    it("should install reporter", function(done) {
      fs.readFile('.tmp/failTestOnErrorLog/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });
  });

  describe("failTestOnErrorLogExclude", function() {

    beforeAll(function() {
      runProtractorWithConfig('failTestOnErrorLogExclude.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/failTestOnErrorLogExclude/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(2);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(2);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(0);

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(0);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[1].screenshots.length).toBe(0);
        expect(report.tests[0].passedExpectations[1].logs.length).toBeLessThan(2);

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(2);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(0);
        expect(report.tests[1].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[1].screenshots.length).toBe(0);

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/failTestOnErrorLogExclude/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(0);
        done();
      });
    });

    it("should install reporter", function(done) {
      fs.readFile('.tmp/failTestOnErrorLogExclude/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });
  });

  describe("parallel testing", function() {

    beforeAll(function() {
      runProtractorWithConfig('parallel.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/parallel/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(6);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(6);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(1);
        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[0].passedExpectations.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(1);
        expect(report.tests[1].specScreenshots[0].img).toBeDefined();
        expect(report.tests[1].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[1].specScreenshots[0].when).toBeDefined();

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(2);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[1].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[1].passedExpectations[1].screenshots[0].when).toBeDefined();

        expect(report.tests[2].specLogs.length).toBe(0);
        expect(report.tests[2].specScreenshots.length).toBe(1);
        expect(report.tests[2].specScreenshots[0].img).toBeDefined();
        expect(report.tests[2].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[2].specScreenshots[0].when).toBeDefined();

        expect(report.tests[2].failedExpectations.length).toBe(0);
        expect(report.tests[2].passedExpectations.length).toBe(2);
        expect(report.tests[2].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[2].passedExpectations[1].logs.length).toBeLessThan(2);
        expect(report.tests[2].passedExpectations[1].screenshots.length).toBe(1);
        expect(report.tests[2].passedExpectations[1].screenshots[0].img).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].browser).toBeDefined();
        expect(report.tests[2].passedExpectations[1].screenshots[0].when).toBeDefined();

        done();
      });
    });

    it("should generate screenshots", function(done) {
      fs.readdir('.tmp/parallel/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(16);
        done();
      });
    });


    it("should install reporter", function(done) {
      fs.readFile('.tmp/parallel/index.html', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain('ui-view');
        expect(data).toContain('html');
        done();
      });
    });

  });

  describe("optional configuration with imageToAscii 'failure'", function() {

    beforeAll(function() {
      installOptionaDependencies();
      runProtractorWithConfig('imageToAscii.js');
    });

    it("should generate report.js", function(done) {
      fs.readFile('.tmp/imageToAscii/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");

        var report = getReportAsJson(data);
        expect(report.stat.passed).toBe(1);
        expect(report.stat.failed).toBe(1);
        expect(report.generatedOn).toBeDefined();
        expect(report.ci).toBeDefined();
        expect(report.ci.build).toBeDefined();
        expect(report.ci.tag).toBeDefined();
        expect(report.ci.sha).toBeDefined();
        expect(report.ci.branch).toBeDefined();
        expect(report.ci.name).toBeDefined();

        expect(report.tests.length).toBe(2);
        expect(report.tests[0].specLogs.length).toBe(0);
        expect(report.tests[0].specScreenshots.length).toBe(1);
        expect(report.tests[0].specScreenshots[0].img).toBeDefined();
        expect(report.tests[0].specScreenshots[0].browser).toBeDefined();
        expect(report.tests[0].specScreenshots[0].when).toBeDefined();

        expect(report.tests[0].passedExpectations.length).toBe(0);
        expect(report.tests[0].failedExpectations.length).toBe(1);
        expect(report.tests[0].failedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[0].failedExpectations[0].screenshots.length).toBe(1);
        expect(report.tests[0].failedExpectations[0].screenshots[0].img).toBeDefined();
        expect(report.tests[0].failedExpectations[0].screenshots[0].browser).toBeDefined();
        expect(report.tests[0].failedExpectations[0].screenshots[0].when).toBeDefined();

        expect(report.tests[1].specLogs.length).toBe(0);
        expect(report.tests[1].specScreenshots.length).toBe(0);

        expect(report.tests[1].failedExpectations.length).toBe(0);
        expect(report.tests[1].passedExpectations.length).toBe(1);
        expect(report.tests[1].passedExpectations[0].logs.length).toBeLessThan(2);
        expect(report.tests[1].passedExpectations[0].screenshots.length).toBe(0);

        done();
      });
    });

    it("should generate failure screenshots", function(done) {
      fs.readdir('.tmp/imageToAscii/screenshots', function(err, items) {
        if (err) {
          return done.fail(err);
        }
        expect(items.length).toEqual(2);
        done();
      });
    });
  });

  describe("bug #55", function() {
    it("should run without errors", function() {
      expect(runProtractorWithConfig('bug55.js')).toBeTruthy();
    });
  });

  describe("suitesConsoleErrors", function() {

    it("should fail if the console-error suite is specified in 'suites'", function(done) {
      runProtractorWithConfig('suitesConsoleErrors.js', '--suite=\"console\"');

      fs.readFile('.tmp/suitesConsoleErrors/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");
        
        var report = getReportAsJson(data);
        expect(report.tests[0].failedExpectations.length).toBe(1); //Console-error
        expect(report.tests[1].failedExpectations.length).toBe(1); //Console-error
        done();
      });
    });
  });

  describe("suitesHomepage", function() {
      
    it("should pass if the console-error suite is not specified in 'suites'", function(done) {
      runProtractorWithConfig('suitesHomepage.js', '--suite=console');
      
      fs.readFile('.tmp/suitesHomepage/report.js', 'utf8', function(err, data) {
        if (err) {
          return done.fail(err);
        }
        expect(data).toContain("angular.module('reporter').constant('data'");
        
        var report = getReportAsJson(data);
        expect(report.tests[0].failedExpectations.length).toBe(0);
        expect(report.tests[1].failedExpectations.length).toBe(0);
        done();
      });
    });
  });
});
