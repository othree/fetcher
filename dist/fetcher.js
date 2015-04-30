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

  var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _param2 = _interopRequire(_jqueryParam);

  var g = undefined;
  if (typeof self !== 'undefined') {
    g = self;
  }
  if (typeof global !== 'undefined') {
    g = global;
  }
  if (typeof window !== 'undefined') {
    g = window;
  }

  // https://github.com/jquery/jquery/blob/master/src/ajax.js#L20
  var rnoContent = /^(?:GET|HEAD)$/;

  // https://github.com/github/fetch/blob/master/fetch.js#L113
  var support = {
    blob: 'FileReader' in g && 'Blob' in g && (function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    })(),
    formData: 'FormData' in g
  };

  var parseXML = function parseXML(text, mimeType) {
    if (g) {
      // in browser
      // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
      try {
        xml = new g.DOMParser().parseFromString(text, mime);
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
    return xml;
  };

  var resXML = function resXML(res, mimeType) {
    var xml;
    var type = mimeType;
    var mime = type ? type.split(';').unshift() : 'text/xml';
    var text = res.text();
    return text.then(function (text) {
      return parseXML(text, mime);
    });
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
    xml: resXML
  };

  var isCORS = function isCORS(url) {
    if (g.document && g.document.location && /^\w+:\/\//.test(url)) {
      var frags = url.replace(/^\w+:\/\//, '');
      var index = url.indexOf('/');
      var hostname = frags.substr(0, index);
      return hostname !== g.document.location.hostname;
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

      this.options = {
        method: 'get',
        converters: {
          'text json': JSON.parse,
          'text xml': parseXML
        }
      };
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
      key: 'setup',
      value: function setup(options) {
        for (var k in options) {
          var v = options[k];
          if (typeof v === 'object') {
            for (var kk in options) {
              var vv = options[kk];
              this.options[k][kk] = vv;
            }
          } else {
            this.options[k] = v;
          }
        }
      }
    }, {
      key: 'request',
      value: function request(method, url, data) {
        var _this = this;

        var options = arguments[3] === undefined ? {} : arguments[3];

        var m = method || options.method || options.type || this.options.method || 'get';
        options.method = m.trim().toUpperCase();

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
          var contentType = options.contentType || this.options.contentType || headers.get('Content-Type');
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

        var extractor;

        var dataType = options.dataType || this.options.dataType || '*';
        dataType = dataType.trim();
        dataType = dataType === '*' ? '' : dataType;

        var mimeType = options.mimeType || this.options.mimeType || '';
        mimeType = mimeType.trim();

        var accepts = options.accepts || '*/*';

        if (dataType && shortContentType[dataType]) {
          accepts = shortContentType[dataType];
          if (dataType !== '*') {
            accepts += ', ' + shortContentType['*'] + '; q=0.01';
          }
        }

        delete options.dataType;
        delete options.mimeType;
        delete options.accepts;

        headers.set('Accept', accepts);

        var racers = [];

        var timeout = options.timeout || this.options.timeout;
        if (typeof timeout === 'number') {
          racers.push(new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject([new Error('timeout')]);
            }, timeout);
          }));
          delete options.timeout;
        }

        racers.push(fetch(url, options).then(function (res) {
          var statusText = res.statusText;
          if (!res.ok && res.status !== 304) {
            return Promise.reject([new Error(statusText), res]);
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
          var second = function second(value) {
            return value;
          };

          mimeType = mimeType || contentType.split(';').shift();
          dataType = mimeType.split(/[\/+]/).pop().toLowerCase() || dataType || 'text';
          extractor = resTractors[dataType];

          if (!extractor && typeof options.converters === 'object') {
            for (var fromto in options.converters) {
              var _fromto$split = fromto.split(' ');

              var _fromto$split2 = _slicedToArray(_fromto$split, 2);

              var from = _fromto$split2[0];
              var to = _fromto$split2[1];

              if (to === dataType && resTractors[from]) {
                extractor = resTractors[from];
                second = _this.options.converters[fromto];
                break;
              }
            }
          }

          if (!extractor) {
            for (var fromto in _this.options.converters) {
              if (options.converters[fromto]) {
                continue;
              }

              var _fromto$split3 = fromto.split(' ');

              var _fromto$split32 = _slicedToArray(_fromto$split3, 2);

              var from = _fromto$split32[0];
              var to = _fromto$split32[1];

              if (to === dataType && resTractors[from]) {
                extractor = resTractors[from];
                second = _this.options.converters[fromto];
                break;
              }
            }
          }

          var value = extractor ? extractor(res, mimeType).then(second) : Promise.reject(new Error('No converter for response to ' + dataType));

          return Promise.all([value, statusText, res])['catch'](function (error) {
            throw [error, res];
          });
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

