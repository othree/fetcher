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
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _param2 = _interopRequire(_jqueryParam);

  var self = undefined;
  if (typeof global !== 'undefined') {
    self = global;
  }
  if (typeof window !== 'undefined') {
    self = window;
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

  var parseXML = function parseXML(res, mimeType) {
    var xml;
    var type = mimeType;
    var mime = type ? type.split(';').unshift() : 'text/xml';
    var text = res.text();
    if (self) {
      // in browser
      // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
      try {
        xml = new self.DOMParser().parseFromString(text, mime);
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

  var resText = function resText(res) {
    return res.text();
  };

  var resTractors = {
    arraybuffer: function arraybuffer(res) {
      return res.arrayBuffer();
    },
    blob: function blob(res) {
      return res.blob();
    },
    formdata: function formdata(res) {
      return res.formData();
    },
    html: resText,
    json: function json(res) {
      return res.json();
    },
    plain: resText,
    text: resText,
    xml: parseXML
  };

  var isCORS = function isCORS(url) {
    if (self.document && self.document.location && /^\w+:\/\//.test(url)) {
      var frags = url.replace(/^\w+:\/\//, '');
      var index = url.indexOf('/');
      var hostname = frags.substr(0, index);
      return hostname !== self.document.location.hostname;
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
    return shortContentType[contentType] || contentType;
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

        options.method = method.toUpperCase();

        if (options.headers && options.headers['Content-Type']) {
          options.headers['Content-Type'] = normalizeContentType(options.headers['Content-Type']);
        }
        var headers = new Headers(options.headers || {});
        options.headers = headers;

        // auto set to cors if hotname is different
        if (!options.mode && isCORS(url)) {
          options.mode = 'cors';
        }

        if (rnoContent.test(options.method)) {
          // set query parameter got GET/HEAD
          var query = this.param(data);
          if (query) {
            url = url + (/\?/.test(url) ? '&' : '?') + query;
          }
        } else {
          // Other method will have request body

          // grab and delete Content-Type header
          // fetch will set Content-Type for common cases
          var contentType = options.contentType || headers.get('Content-Type');
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
            // x-www-form-urlencoded is default in fetch
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
            extractor = resTractors[dataType.toLowerCase()];
          }
        }

        if (options.mimeType) {
          var mimeType = options.mimeType.trim();
        }

        delete options.dataType;
        delete options.mimeType;

        headers.set('Accept', accept);

        var racers = [];
        if (options.timeout) {
          if (typeof options.timeout === 'number') {
            racers.push(new Promise(function (resolve, reject) {
              setTimeout(function () {
                reject([new Error('timeout')]);
              }, options.timeout);
            }));
          }
          delete options.timeout;
        }

        racers.push(fetch(url, options).then(function (res) {
          var statusText = res.statusText;
          if (!res.ok && res.status !== 304) {
            return Promise.reject([statusText, res]);
          }

          if (res.status === 204 || options.method === 'HEAD') {
            // if no content
            statusText = 'nocontent';
          } else if (res.status === 304) {
            // if not modified
            statusText = 'notmodified';
          } else {
            statusText = 'success';
          }

          var contentType = res.headers.get('Content-Type') || '';
          mimeType = mimeType || contentType.split(';').shift();
          if (!extractor) {
            dataType = mimeType.split(/[\/+]/).pop();
            extractor = resTractors[dataType.toLowerCase()] || resTractors.text;
          }
          return Promise.all([extractor(res, mimeType), statusText, res]);
        }, function (error) {
          throw [error];
        }));

        return Promise.race(racers);
      }
    }, {
      key: 'delete',
      value: function _delete(url, data, options) {
        return this.request('DELETE', url, data, options);
      }
    }, {
      key: 'get',
      value: function get(url, data, options) {
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
      value: function head(url, data, options) {
        return this.request('HEAD', url, data, options);
      }
    }, {
      key: 'options',
      value: (function (_options) {
        function options(_x2, _x3, _x4) {
          return _options.apply(this, arguments);
        }

        options.toString = function () {
          return _options.toString();
        };

        return options;
      })(function (url, data, options) {
        return this.request('OPTIONS', url, data, options);
      })
    }, {
      key: 'post',
      value: function post(url, data, options) {
        return this.request('POST', url, data, options);
      }
    }, {
      key: 'put',
      value: function put(url, data, options) {
        return this.request('PUT', url, data, options);
      }
    }]);

    return Fetcher;
  })();

  ;

  module.exports = new Fetcher();
});

