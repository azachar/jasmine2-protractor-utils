var fse = require('fs-extra');
var fs = require('fs');
var _ = require('lodash');

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

                var files = fse.walkSync('.tmp/cleanFolders');
                expect(files.length).toBe(2);

                screenshoter.config = {
                    'screenshotPath': screenshotPath
                };
            });

            it("should clean up folders with explicit value", function() {
                screenshoter.config.clearFoldersBeforeTest = true;
                screenshoter.setup();
                var files = fse.walkSync('.tmp/cleanFolders');
                expect(files.length).toBe(0);
            });

            it("should clean up folders default value", function() {
                screenshoter.setup();
                var files = fse.walkSync('.tmp/cleanFolders');
                expect(files.length).toBe(0);
            });
            it("should not clean up folders", function() {
                screenshoter.config.clearFoldersBeforeTest = false;
                screenshoter.setup();
                var files = fse.walkSync('.tmp/cleanFolders');
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

    it("should write user logs", function () {
        screenshoter.config = {
            screenshotPath: 'REPORTS',
        };
        screenshoter.setup();
        screenshoter.log('test');
        var logs = fs.readFileSync(screenshoter.config.screenshotPath + '/logs' + '/log.txt', 'utf-8');
        expect(_.includes(logs, 'test')).toEqual(true);
        screenshoter.log('check');
        logs = fs.readFileSync(screenshoter.config.screenshotPath + '/logs' + '/log.txt', 'utf-8');
        expect(_.includes(logs, 'test')).toEqual(true);
        expect(_.includes(logs, 'check')).toEqual(true);
    });
});