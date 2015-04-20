
if (typeof global !== 'undefined') {
  var self = global;
}

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
  var type = res.headers.get('Content-Type');
  var mime = type ? type.split(';').unshift() : 'text/xml' ;
  var text = res.text();
  if (window) {
    // in browser
    // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
    try {
      xml = ( new window.DOMParser() ).parseFromString( text, mime );
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
  if (self.document && self.document.location && /^\w+:\/\//.test(url) ) {
    var frags = url.replace(/^\w+:\/\//, '');
    var index = url.indexOf('/');
    var hostname = frags.substr(0, index);
    if (hostname !== self.document.location.hostname) {
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

var normalizeContentType = (contentType) => {
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
      var query = this.param(data);
      if (query) {
        url = url + (/\?/.test(url) ? '&' : '?') + query;
      }
    }

    if (!rnoContent.test(options.method)) {
      // grab and delete Content-Type header
      // fetch will set Content-Type for common cases
      var contentType = normalizeContentType(headers.get('Content-Type'));
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
        var mimeType = res.headers.get('Content-Type').split(';').unshift();
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
