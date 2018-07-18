/*The MIT License, Copyright (c) 2010-2016 Google, Inc.*/
var fs = require('fs-extra');

describe('angularjs homepage', function() {
  it('should failure', function() {
    browser.pause = function() {
      fs.outputFileSync('.tmp/pause-spec/paused-workaround.txt', 'hit');
    };
    browser.get('http://www.angularjs.org');
    element(by.model('yourName')).sendKeys('Andrej');
    var greeting = element(by.binding('yourName'));
    expect(greeting.getText()).toEqual('Hello Martin!');
  });
});
