(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define('fetcher', ['exports', 'module', 'jquery-param'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('jquery-param'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.param);
    global.fetcher = mod.exports;
  }
})(this, function (exports, module, _jqueryParam) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _param2 = _interopRequire(_jqueryParam);

  // https://github.com/github/fetch/blob/master/fetch.js#L113
  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    })(),
    formData: 'FormData' in self
  };

  var parseXML = function parseXML(res) {
    // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
    try {
      xml = new window.DOMParser().parseFromString(res.text(), 'text/xml');
    } catch (e) {
      xml = undefined;
    }

    if (!xml || xml.getElementsByTagName('parsererror').length) {
      throw new Error('Invalid XML: ' + data);
    }
    return xml;
  };

  var res = {
    arrayBuffer: function arrayBuffer(res) {
      return res.arrayBuffer();
    },
    blob: function blob(res) {
      return res.blob();
    },
    formData: function formData(res) {
      return res.formData();
    },
    html: parseXML,
    json: function json(res) {
      return res.json();
    },
    plain: function plain(res) {
      return res.text();
    },
    text: function text(res) {
      return res.text();
    },
    xml: parseXML
  };

  var isCORS = function isCORS(url) {
    if (document && document.location && /^\w+:\/\//.test(url)) {
      var frags = url.replace(/^\w+:\/\//, '');
      var index = url.indexOf('/');
      var hostname = frags.substr(0, index);
      if (hostname !== document.location.hostname) {
        return true;
      }
    }
    return false;
  };

  var shortContentType = {
    '*': '*/*',
    json: 'application/json',
    xml: 'application/xml'
  };

  var normalizeContentType = function normalizeContentType() {
    var contentType = arguments[0] === undefined ? 'application/x-www-form-urlencoded; charset=UTF-8' : arguments[0];

    var normalized = shortContentType[contentType];
    return normalized || contentType;
  };

  var Fetcher = (function () {
    function Fetcher() {
      _classCallCheck(this, Fetcher);
    }

    _createClass(Fetcher, [{
      key: 'param',
      value: (function (_param) {
        function param(_x) {
          return _param.apply(this, arguments);
        }

        param.toString = function () {
          return _param.toString();
        };

        return param;
      })(function (data) {
        return _param2(data);
      })
    }, {
      key: 'request',
      value: function request(method, url, data) {
        var options = arguments[3] === undefined ? {} : arguments[3];

        options.method = method;

        var headers = new Headers(options.headers || {});
        options.headers = headers;

        // auto set to cors if hotname is different
        if (!options.mode) {
          options.mode = isCORS(url) ? 'cors' : 'no-cors';
        }

        // set query parameter
        if (options.method === 'GET') {
          var urldata = this.param(data);
          if (/\?/.test(url)) {
            url = url + '?' + urldata;
          } else {
            url = url + '&' + urldata;
          }
        }

        // set Content-Type header
        if (options.method === 'POST' || options.method === 'PUT') {
          headers.set('Content-Type', normalizeContentType(headers.get('Content-Type')));
        }

        // set body
        if (options.method === 'POST' || options.method === 'PUT') {
          if (typeof data === 'string' || support.formdata && FormData.prototype.isPrototypeOf(data) || support.blob && Blob.prototype.isPrototypeOf(data)) {
            options.body = data;
          } else {
            options.body = this.param(data);
          }
        }

        var extractor = null;
        var dataType = options.dataType ? options.dataType.trim() : '*';
        var accept = '*/*';
        if (dataType && shortContentType[dataType]) {
          accept = shortContentType[dataType];
          if (dataType !== '*') {
            accept += ',' + shortContentType['*'] + '; q=0.01';
            extractor = res[options.dataType];
          }
        }

        headers.set('Accept', accept);

        return fetch(url, options).then(function (res) {
          if (!responseValue) {
            var mimeType = res.headers.get('Content-Type').split(';')[0];
            var dataType = mimeType.split('/')[1] || 'text';
            if (/\+/.test(dataType)) {
              dataType = dataType.split('+')[1];
            }

            extractor = res[dataType] || res.text;
          }
          return [extractor(res), res];
        });
      }
    }, {
      key: 'delete',
      value: function _delete(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('DELETE', url, data, options);
      }
    }, {
      key: 'get',
      value: function get(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('GET', url, data, options);
      }
    }, {
      key: 'getJSON',
      value: function getJSON(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        options.dataType = 'json';
        return this.get(url, data, options);
      }
    }, {
      key: 'head',
      value: function head(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('HEAD', url, data, options);
      }
    }, {
      key: 'options',
      value: (function (_options) {
        function options(_x2, _x3) {
          return _options.apply(this, arguments);
        }

        options.toString = function () {
          return _options.toString();
        };

        return options;
      })(function (url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('OPTIONS', url, data, options);
      })
    }, {
      key: 'post',
      value: function post(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('POST', url, data, options);
      }
    }, {
      key: 'put',
      value: function put(url, data) {
        var options = arguments[2] === undefined ? {} : arguments[2];

        return this.request('PUT', url, data, options);
      }
    }]);

    return Fetcher;
  })();

  ;

  module.exports = new Fetcher();
});

