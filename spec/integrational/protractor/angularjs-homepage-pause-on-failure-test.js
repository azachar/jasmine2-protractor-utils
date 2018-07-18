/*The MIT License, Copyright (c) 2010-2016 Google, Inc.*/

describe('angularjs homepage', function() {
  it('should failure', function() {
    browser.pause = function() {
      browser.executeScript('console.warn("browser was paused")'); //will work fine for pauseOn:'failure' but for pauseOn:'spec' is too late to capture logs
    };
    browser.get('http://www.angularjs.org');
    element(by.model('yourName')).sendKeys('Andrej');
    var greeting = element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello Martin!');
  });
});
