require('mocha');

var should = require('should');
var expect = require('expect');
var sinon  = require('sinon');

var Promise = require('es6-promise').Promise;
var fetcher = require('../');

global.Headers = require('node-fetch/lib/headers');


function once(fn) {
  var returnValue, called = false;
  return function () {
    if (!called) {
      called = true;
      returnValue = fn.apply(this, arguments);
    }
    return returnValue;
  };
}

it("GET request parameter", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.get('/', {abc: 123});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];

  url.should.equal('/?abc=123');
});
