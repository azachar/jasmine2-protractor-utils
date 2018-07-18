describe('angularjs homepage', function() {

  it('should generate console errors', function() {
    browser.get('http://www.angularjs.org');
    element(by.model('yourName')).sendKeys('Julie');
    var greeting = element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello Julie!');

    browser.executeScript('console.error("sample error")');
    browser.executeScript('console.warn("sample warning")');
    browser.executeScript('console.info("sample info")');
    browser.executeScript('console.log("sample log")');
  });

  it('should generate console errors in 2 browsers', function() {
    browser.get('http://www.angularjs.org');
    screenshotBrowsers.first = browser;

    var b = browser.forkNewDriverInstance();
    screenshotBrowsers.second = b;
    b.get('http://www.angularjs.org');

    element(by.model('yourName')).sendKeys('Julie');
    var greeting = element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello Julie!');

    b.executeScript('console.error("sample second browser error")');
    b.executeScript('console.warn("sample second browser warning")');
    b.executeScript('console.info("sample second browser info")');
    b.executeScript('console.log("sample second browser log")');

  });
});
