
import param from 'jquery-param';

class Fetcher {
  constructor() {
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
