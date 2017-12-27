var path = require('path');

module.exports = {
  // The address of a running selenium server.
  seleniumAddress:
    (process.env.SELENIUM_URL || 'http://localhost:4444/wd/hub'),

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName':
      (process.env.TEST_BROWSER_NAME || 'chrome'),
    'version':
      (process.env.TEST_BROWSER_VERSION || 'ANY')
  },

  debug: (process.env.TEST_DEBUG || false),
  coverage: !process.env.TEST_COVERAGE_SKIP,
};
