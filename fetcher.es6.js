
import param from 'jquery-param';

// https://github.com/github/fetch/blob/master/fetch.js#L113
var support = {
  blob: 'FileReader' in self && 'Blob' in self && (function() {
    try {
      new Blob();
      return true
    } catch(e) {
      return false
    }
  })(),
  formData: 'FormData' in self
};

var res = {
  text: res => res.text(),
  json: res => res.json()
};

class Fetcher {
  constructor() {
  }

  param(data) {
    return param(data);
  }

  request(method, url, options = {}) {
    options.method = method;
    var responseValue = res[options.dataType] || res['text'];

    return fetch(url, options).then( res => [responseValue(res), res] );
  }

  post(url, data, options = {}) {
    if (typeof data === 'string'
     || (support.formdata && FormData.prototype.isPrototypeOf(data))
     || (support.blob && Blob.prototype.isPrototypeOf(data)) ) {
      options.body = data;
    } else {
      options.body = this.param(data);
    }
    return this.request('POST', url, data, options);
  }

  get(url, data, options = {}) {
    var urldata = this.param(data);
    if (/\?/.test(url)) {
      url = url + '?' + urldata;
    } else {
      url = url + '&' + urldata;
    }
    return this.request('GET', url, options);
  }

  getJSON(url, data, options = {}) {
    options.dataType = 'json'
    return this.get(url, data, options);
  }
};

export default new Fetcher();
