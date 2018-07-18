describe('angularjs homepage', function() {
  function generateLogs(index) {
    browser.executeScript('console.error("sample error ' + index + '")');
    browser.executeScript('console.warn("sample warning ' + index + '")');
    browser.executeScript('console.info("sample info ' + index + '")');
    browser.executeScript('console.log("sample log same as info ' + index + '")');
    browser.executeScript('console.debug("sample debug ' + index + '")');
    browser.executeScript('console.trace("sample trace ' + index + '")');
  }
  it('should failure', function() {
    browser.get('http://www.angularjs.org');
    element(by.model('yourName')).sendKeys('Andrej');
    var greeting = element(by.binding('yourName'));
    generateLogs(1);

    expect(greeting.getText()).toEqual('Hello Martin!');

    generateLogs(2);
  });

  it('should pass', function() {
    browser.get('http://www.angularjs.org');
    element(by.model('yourName')).sendKeys('Julie');
    var greeting = element(by.binding('yourName'));

    generateLogs(3);

    expect(greeting.getText()).toEqual('Hello Julie!');

    generateLogs(4);
  });
});
