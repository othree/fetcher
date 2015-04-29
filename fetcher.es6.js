
var self = this;
if (typeof global !== 'undefined') { self = global; }
if (typeof window !== 'undefined') { self = window; }

import param from 'jquery-param';

// https://github.com/jquery/jquery/blob/master/src/ajax.js#L20
var rnoContent = /^(?:GET|HEAD)$/;

// https://github.com/github/fetch/blob/master/fetch.js#L113
var support = {
  blob: 'FileReader' in self && 'Blob' in self && ( () => {
    try {
      new Blob();
      return true
    } catch(e) {
      return false
    }
  })(),
  formData: 'FormData' in self
};

var parseXML = (res, mimeType) => {
  var xml;
  var type = mimeType;
  var mime = type ? type.split(';').unshift() : 'text/xml' ;
  var text = res.text();
  if (self) {
    // in browser
    // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
    try {
      xml = ( new self.DOMParser() ).parseFromString( text, mime );
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

var resText = res => res.text()

var resTractors = {
  arraybuffer: res => res.arrayBuffer(),
  blob:        res => res.blob(),
  formdata:    res => res.formData(),
  html:        resText,
  json:        res => res.json(),
  plain:       resText,
  text:        resText,
  xml:         parseXML
};

var isCORS = url => {
  if (self.document && self.document.location && /^\w+:\/\//.test(url) ) {
    var frags = url.replace(/^\w+:\/\//, '');
    var index = url.indexOf('/');
    var hostname = frags.substr(0, index);
    return hostname !== self.document.location.hostname;
  }
  return false;
}

var shortContentType = {
  "*":  '*/*',
  json: 'application/json',
  text: 'text/plain',
  xml:  'application/xml'
}

var normalizeContentType = contentType => shortContentType[contentType] || contentType;
  


class Fetcher {
  constructor() {
  }

  param(data) {
    return param(data);
  }

  request(method, url, data, options = {}) {
    options.method = method.toUpperCase();

    if (options.headers && options.headers["Content-Type"]) {
      options.headers["Content-Type"] = normalizeContentType(options.headers["Content-Type"]);
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
      headers.delete("Content-Type");

      // set body
      if (typeof data === 'string'
       || (support.formdata && FormData.prototype.isPrototypeOf(data))
       || (support.blob && Blob.prototype.isPrototypeOf(data)) ) {
        if (contentType) { headers.set("Content-Type", contentType); }
        options.body = data;
      } else if (contentType === 'application/json') {
        headers.set("Content-Type", contentType);
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
            reject([new Error('timeout')])
          }, options.timeout);
        }));
      }
      delete options.timeout;
    }

    racers.push(fetch(url, options).then( res => {
      var statusText = res.statusText;
      if (!res.ok && res.status !== 304) {
        return Promise.reject([new Error(statusText), res]);
      }

      if ( res.status === 204 || options.method === "HEAD" ) {
        // if no content
        statusText = "nocontent";
      } else if ( res.status === 304 ) {
        // if not modified
        statusText = "notmodified";
      } else {
        statusText = "success";
      }
      
      var contentType = res.headers.get('Content-Type') || '';
      mimeType = mimeType || contentType.split(';').shift();
      if (!extractor) {
        dataType = mimeType.split(/[\/+]/).pop();
        extractor = resTractors[dataType.toLowerCase()] || resTractors['text'];
      }
      return Promise.all([extractor(res, mimeType), statusText, res]);
    }, error => {
      throw [error];
    }));

    return Promise.race(racers);
  }

  delete(url, data, options) {
    return this.request('DELETE', url, data, options);
  }
  get(url, data, options) {
    return this.request('GET', url, data, options);
  }
  getJSON(url, data, options = {}) {
    options.dataType = 'json'
    return this.get(url, data, options);
  }
  head(url, data, options) {
    return this.request('HEAD', url, data, options);
  }
  options(url, data, options) {
    return this.request('OPTIONS', url, data, options);
  }
  post(url, data, options) {
    return this.request('POST', url, data, options);
  }
  put(url, data, options) {
    return this.request('PUT', url, data, options);
  }
};

export default new Fetcher();
