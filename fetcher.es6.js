
import param from 'jquery-param';

// https://github.com/jquery/jquery/blob/master/src/ajax.js#L20
var rnoContent = /^(?:GET|HEAD)$/;

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

var parseXML = res => {
  var xml;
  var text = res.text();
  if (window) {
    // in browser
    // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
    try {
      xml = ( new window.DOMParser() ).parseFromString( text, "text/xml" );
    } catch ( e ) {
      xml = undefined;
    }
    if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
      throw( new Error("Invalid XML: " + text ));
    }
  } else {
    // node, return plain text
    xml = text;
  }
  return Promise.resolve(xml);
}

var resTractors = {
  arrayBuffer: res => res.arrayBuffer(),
  blob:        res => res.blob(),
  formData:    res => res.formData(),
  html:        parseXML,
  json:        res => res.json(),
  plain:       res => res.text(),
  text:        res => res.text(),
  xml:         parseXML
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
  "*": '*/*',
  json: 'application/json',
  text: 'text/plain',
  xml:  'application/xml'
}

var normalizeContentType = (contentType = 'application/x-www-form-urlencoded; charset=UTF-8') => {
  var normalized = shortContentType[contentType];
  return normalized || contentType;
}
  


class Fetcher {
  constructor() {
  }

  param(data) {
    return param(data);
  }

  request(method, url, data, options = {}) {
    options.method = method;

    var headers = new Headers(options.headers || {});
    options.headers = headers;

    // auto set to cors if hotname is different
    if (!options.mode) {
      options.mode = isCORS(url) ? 'cors' : 'no-cors'
    }

    // set query parameter
    if (rnoContent.test(options.method)) {
      var urldata = this.param(data);
      if (urldata) {
        url = url + (/\?/.test(url) ? '&' : '?') + urldata;
      }
    }

    // set Content-Type header
    if (!rnoContent.test(options.method)) {
      headers.set("Content-Type", normalizeContentType(headers.get('Content-Type')));
    }

    // set body
    if (!rnoContent.test(options.method)) {
      if (typeof data === 'string'
       || (support.formdata && FormData.prototype.isPrototypeOf(data))
       || (support.blob && Blob.prototype.isPrototypeOf(data)) ) {
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
        accept += ', ' + shortContentType['*'] + '; q=0.01';
        extractor = resTractors[dataType];
      }
    }

    headers.set('Accept', accept);

    return fetch(url, options).then( res => {
      if (!extractor) {
        var mimeType = res.headers.get('Content-Type').split(';')[0];
        var dataType = mimeType.split(/[\/+]/).pop();

        extractor = resTractors[dataType] || resTractors['text'];
      }
      return Promise.all([extractor(res), res]);
    });
  }

  delete(url, data, options = {}) {
    return this.request('DELETE', url, data, options);
  }
  get(url, data, options = {}) {
    return this.request('GET', url, data, options);
  }
  getJSON(url, data, options = {}) {
    options.dataType = 'json'
    return this.get(url, data, options);
  }
  head(url, data, options = {}) {
    return this.request('HEAD', url, data, options);
  }
  options(url, data, options = {}) {
    return this.request('OPTIONS', url, data, options);
  }
  post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }
  put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }
};

export default new Fetcher();
