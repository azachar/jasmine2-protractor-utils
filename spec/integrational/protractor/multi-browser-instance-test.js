describe('angularjs homepage', function() {
  it('should open two browsers', function() {
    browser.get('http://www.angularjs.org');
    screenshotBrowsers.first = browser;

    var b = browser.forkNewDriverInstance();
    screenshotBrowsers.second = b;
    b.get('http://www.angularjs.org');

    element(by.model('yourName')).sendKeys('First Browser');
    var greeting = element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello First Browser!');

    b.element(by.model('yourName')).sendKeys('Second Browser');
    greeting = b.element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello Second Browser!');
  });
});
