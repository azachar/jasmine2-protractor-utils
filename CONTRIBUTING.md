# Contributing
- Your PR is more than welcome!
- Please include always tests in your PR.
- If you find a bug, please create a test case for it that fails first, then write your fix. If all passes on Travis, feel free to provide your PR.

## Bug fixing
- Please provide us steps to reproduce. Here is a quick checklist how to do it:

- [ ] create a test config file in https://github.com/azachar/protractor-screenshoter-plugin/blob/master/spec/integrational/protractor-config such bugXX.js

    1. modify the screenshot path from `.tmp/bug55` to `.tmp/bugXX`

    2. pick a protractor's spec to run with or keep the same like in `bug55.js`

- [ ] duplicate a whole `describe` section from https://github.com/azachar/protractor-screenshoter-plugin/blob/f6bded9639ddb80a5855270910b2961de74e4011/spec/integrational/screenshoter.int.spec.js#L1280
     1. modify the path to the reporter
https://github.com/azachar/protractor-screenshoter-plugin/blob/f6bded9639ddb80a5855270910b2961de74e4011/spec/integrational/screenshoter.int.spec.js#L1282

     2. modify your test according to your expectations, in this case, we expected that there will be no protractor errors (thus `toBeTruthy()`). If your protractor test should fail instead, then modify expectation to `toBeFalsy()`

- [ ] run that test, when it fails, push your changes to your fork, so we can look at your problem and reproduce it.

If you need to go deeper into testing, read the following section:

## How to write tests for your contribution

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

### How to debug screenshoter plugin

You can debug this plugin by running protractor in a debug mode like this:
```
 node --inspect-brk node_modules/protractor/bin/protractor ./spec/integrational/protractor-config/default.js
```
**NOTE**
  Where `./spec/integrational/protractor-config/default.js` is a sample e2e test. You can choose another one or write one yourself.

Then open ``chrome://inspect`` in your Chrome and press `inspect` on the remote target.

Here is more information how to debug protractor - https://github.com/angular/protractor/blob/master/docs/debugging.md

# Running test

After cloning the project you can run tests as follows:

1. `npm install`
2. `npm run setup`
3. `npm run server &`
4. `npm test`

To run without coverage report including some debug logging use  `npm run testing`


# Committing
Please use `git-cz` to format your commit message.

Before committing, please check your changes with
```
npm run lint
```
and fix your code style issues.

### Releasing

To deploy a new version run commands. If all tests are passed it will be published to npm on its own.

```
npm run release
git push --follow-tags origin master
```

# TODO
- Use promises instead of callbacks
   - Refactor `asap/spec/end` report writing at the end of each promise.all, instead of after each callback
- Get rid of workaround for long-running operations
   - Make a command line tool to collect particular json reports and to combine them into to the final `report.js` to avoid race conditions with multi snapshots/protractor/browsers instances writing to the same `report.js` or reading from unfinished particular report json to produce `report.js`.
- Refactor data structure of `report.js` (breaking change)
   - Get rid of spec and expect duality (needs to be refactored the reporter plugin too)
- 100% Test coverage
- Convert to typescript based es6 npm plugin with a proper test infrastructure
- Support Mocha framework
