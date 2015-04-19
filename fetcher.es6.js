
import param from 'jquery-param';

// https://github.com/github/fetch/blob/master/fetch.js#L113
var support = {
  blob: 'FileReader' in this && 'Blob' in self && (function() {
    try {
      new Blob();
      return true
    } catch(e) {
      return false
    }
  })(),
  formData: 'FormData' in self
}

class Fetcher {
  constructor() {
  }

  text(res) {
    return res.text();
  }

  json(res) {
    return res.json();
  }

  param(data) {
    return param(data);
  }

  request(method, url, options) {
    options = options || {};
    options.method = method;

    return fetch(url, options);
  }

  post(url, data, options) {
    if (typeof data === 'string') {
      options.body = data;
    } else if (suppor.formdata && FormData.prototype.isPrototypeOf(data)) {
      options.body = data;
    } else {
      options.body = this.param(data);
    }
    return this.request('POST', url, data, options);
  }

  get(url, data, options) {
    var urldata = this.param(data);
    if (/\?/.test(url)) {
      url = url + '?' + urldata;
    } else {
      url = url + '&' + urldata;
    }
    return this.request('GET', url, options);
  }

  getJSON(url, data, options) {
    return this.get(url, data, options).then(this.json);
  }
};

export default new Fetcher();
