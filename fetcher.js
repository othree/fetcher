(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'param'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('jquery-param'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.param);
    global.fetcherEs6 = mod.exports;
  }
})(this, function (exports, module, _param2) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _param3 = _interopRequire(_param2);

  var Fetcher = (function () {
    function Fetcher() {
      _classCallCheck(this, Fetcher);
    }

    _createClass(Fetcher, [{
      key: 'json',
      value: function json(res) {
        return res.json();
      }
    }, {
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
        return _param3(data);
      })
    }, {
      key: 'request',
      value: function request(method, url, options) {
        options = options || {};
        options.method = method;

        return fetch(url, options);
      }
    }, {
      key: 'post',
      value: function post(url, data, options) {
        if (typeof data === 'string') {
          options.body = data;
        } else {
          options.body = this.param(data);
        }
        return this.request('POST', url, data, options);
      }
    }, {
      key: 'get',
      value: function get(url, data, options) {
        var urldata = this.param(data);
        if (/\?/.test(url)) {
          url = url + '?' + urldata;
        } else {
          url = url + '&' + urldata;
        }
        return this.request('GET', url, options);
      }
    }, {
      key: 'getJSON',
      value: function getJSON(url, data, options) {
        return this.get(url, data, options).then(this.json);
      }
    }]);

    return Fetcher;
  })();

  ;

  module.exports = new Fetcher();
});

