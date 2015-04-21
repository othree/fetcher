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

it("POST request parameter, use 'application/json'", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.post('/', {abc: 123}, {headers: {"Content-Type": "application/json"}});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('{"abc":123}');
});

it("POST request parameter, use 'json'", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.post('/', {abc: 123}, {headers: {"Content-Type": "json"}});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('{"abc":123}');
});

it("POST request parameter, use json string", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.post('/', JSON.stringify({abc: 123}), {headers: {"Content-Type": "application/json"}});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('{"abc":123}');
});

it("POST request without Content-Type", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.post('/', {abc: 123, def: 456});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('abc=123&def=456');
});

/*
 * Cases
 * response json, known by dataType option
 * response json, known by content-type header
 * response text
 * response form-data encoded string
 */
