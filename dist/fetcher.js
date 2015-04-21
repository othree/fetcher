/**
 * @preserve jquery-param (c) 2015 KNOWLEDGECODE | MIT
 */
/*jslint forin: true, plusplus: true */
/*global module, define */
(function (global) {
    'use strict';

    var param = function (a) {
        var add = function (s, k, v) {
            v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
            s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }, buildParams = function (prefix, obj, s) {
            var i, len, key;

            if (Object.prototype.toString.call(obj) === '[object Array]') {
                for (i = 0, len = obj.length; i < len; i++) {
                    buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i], s);
                }
            } else if (obj && obj.toString() === '[object Object]') {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (prefix) {
                            buildParams(prefix + '[' + key + ']', obj[key], s, add);
                        } else {
                            buildParams(key, obj[key], s, add);
                        }
                    }
                }
            } else if (prefix) {
                add(s, prefix, obj);
            } else {
                for (key in obj) {
                    add(s, key, obj[key]);
                }
            }
            return s;
        };
        return buildParams('', a, []).join('&').replace(/%20/g, '+');
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = param;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return param;
        });
    } else {
        global.param = param;
    }

}(this));
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
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _param2 = _interopRequire(_jqueryParam);

  var self = this;
  if (typeof global !== 'undefined') {
    self = global;
  }

  // https://github.com/jquery/jquery/blob/master/src/ajax.js#L20
  var rnoContent = /^(?:GET|HEAD)$/;

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
    var xml;
    var type = res.headers.get('Content-Type');
    var mime = type ? type.split(';').unshift() : 'text/xml';
    var text = res.text();
    if (window) {
      // in browser
      // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
      try {
        xml = new window.DOMParser().parseFromString(text, mime);
      } catch (e) {
        xml = undefined;
      }
      if (!xml || xml.getElementsByTagName('parsererror').length) {
        throw new Error('Invalid XML: ' + text);
      }
    } else {
      // node, return plain text
      xml = text;
    }
    return Promise.resolve(xml);
  };

  var resTractors = {
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
    if (self.document && self.document.location && /^\w+:\/\//.test(url)) {
      var frags = url.replace(/^\w+:\/\//, '');
      var index = url.indexOf('/');
      var hostname = frags.substr(0, index);
      if (hostname !== self.document.location.hostname) {
        return true;
      }
    }
    return false;
  };

  var shortContentType = {
    '*': '*/*',
    json: 'application/json',
    text: 'text/plain',
    xml: 'application/xml'
  };

  var normalizeContentType = function normalizeContentType(contentType) {
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
        if (!options.mode && isCORS(url)) {
          options.mode = 'cors';
        }

        // set query parameter
        if (rnoContent.test(options.method)) {
          var query = this.param(data);
          if (query) {
            url = url + (/\?/.test(url) ? '&' : '?') + query;
          }
        }

        if (!rnoContent.test(options.method)) {
          // grab and delete Content-Type header
          // fetch will set Content-Type for common cases
          var contentType = normalizeContentType(headers.get('Content-Type'));
          headers['delete']('Content-Type');

          // set body
          if (typeof data === 'string' || support.formdata && FormData.prototype.isPrototypeOf(data) || support.blob && Blob.prototype.isPrototypeOf(data)) {
            if (contentType) {
              headers.set('Content-Type', contentType);
            }
            options.body = data;
          } else if (contentType === 'application/json') {
            headers.set('Content-Type', contentType);
            options.body = JSON.stringify(data);
          } else if (data) {
            options.body = this.param(data);
          }
        }

        var extractor = null;
        var dataType = options.dataType ? options.dataType.trim() : '*';
        var accept = '*/*';
        if (dataType && shortContentType[dataType]) {
          accept = shortContentType[dataType];
          if (dataType !== '*') {
            accept += ', ' + shortContentType['*'] + '; q=0.01';
            extractor = resTractors[dataType];
          }
        }

        headers.set('Accept', accept);

        return fetch(url, options).then(function (res) {
          if (!extractor) {
            var mimeType = res.headers.get('Content-Type').split(';').shift();
            var dataType = mimeType.split(/[\/+]/).pop();

            extractor = resTractors[dataType] || resTractors.text;
          }
          return Promise.all([extractor(res), res]);
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

