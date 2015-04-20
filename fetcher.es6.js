
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

var isCORS = url => {
  if (document && document.location && /^\w+:\/\//.test(url) ) {
    var frags = url.replace(/^\w+:\/\//, '');
    var index = url.indexOf('/');
    var hostname = frags.substr(0, index);
    if (hostname !== document.location.hostname) {
      return true;
    }
  }
  return false;
}

var shortContentType = {
  json: 'application/json',
  xml:  'application/xml'
}


class Fetcher {
  constructor() {
  }

  param(data) {
    return param(data);
  }

  request(method, url, options = {}) {
    options.method = method;
    if (!options.mode) {
      options.mode = isCORS(url) ? 'cors' : 'no-cors'
    }

    if (options.method === 'POST') {
      var headers = options.headers || {};
      headers["Content-Type"] = headers["Content-Type"] || 'application/x-www-form-urlencoded; charset=UTF-8';
      headers["Content-Type"] = shortContentType[headers["Content-Type"]] || headers["Content-Type"];
    }

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
