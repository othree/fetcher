require('mocha');

var stream = require('stream');
var should = require('should-promised');
var expect = require('expect');
var sinon  = require('sinon');

global.Promise = require('es6-promise').Promise;
global.fetcher = require('../');

global.Headers = require('node-fetch/lib/headers');
global.Response = require('node-fetch/lib/response');


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
  var opt = args[1];

  url.should.equal('/?abc=123');
  opt.method.should.equal('GET')
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
  var opt = args[1];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('{"abc":123}');
  opt.method.should.equal('POST')
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

it("PUT request without Content-Type", function () {
  var callback = sinon.stub().returns(new Promise(function (resolver) {
    resolve('{"bcd": 234}');
  }));
  global.fetch = once(callback);

  fetcher.put('/', {abc: 123, def: 456});

  callback.called.should.be.true;

  var args = callback.getCall(0).args;
  var url = args[0];
  var opt = args[1];
  url.should.equal('/');

  var body = args[1].body;
  body.should.equal('abc=123&def=456');
  opt.method.should.equal('PUT')
});

it("Response JSON with dataType option", function () {
  var data = {bcd: 456};
  var body = new stream.PassThrough();
  var res = new Response(
    body,
    {
      url: '/',
      status: '200',
      headers: (new Headers()),
      size: 12,
      timeout: 5000
    } 
  );
  var callback = sinon.stub().returns(Promise.resolve(res));
  global.fetch = once(callback);

  var r = fetcher.post('/', {abc: 123, def: 456}, {dataType: 'json'});

  body.end(JSON.stringify(data));

  callback.called.should.be.true;

  r.should.be.fulfilledWith([data, res]);
});

it("Response JSON with Content-Type", function () {
  var data = {bcd: 456};
  var body = new stream.PassThrough();
  var res = new Response(
    body,
    {
      url: '/',
      status: '200',
      headers: (new Headers({
        "Content-Type": 'application/json'
      })),
      size: 12,
      timeout: 5000
    } 
  );
  var callback = sinon.stub().returns(Promise.resolve(res));
  global.fetch = once(callback);

  var r = fetcher.post('/', {abc: 123, def: 456});

  body.end(JSON.stringify(data));

  callback.called.should.be.true;

  r.should.be.fulfilledWith([data, res]);
});

/*
 * Cases
 * response text
 * response form-data encoded string
 */
