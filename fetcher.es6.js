
var g = this;
if (typeof self   !== 'undefined') { g = self;   }
if (typeof global !== 'undefined') { g = global; }
if (typeof window !== 'undefined') { g = window; }

import param from 'jquery-param';

// https://github.com/jquery/jquery/blob/master/src/ajax.js#L20
var rnoContent = /^(?:GET|HEAD)$/;

// https://github.com/github/fetch/blob/master/fetch.js#L113
var support = {
  blob: 'FileReader' in g && 'Blob' in g && ( () => {
    try {
      new Blob();
      return true
    } catch(e) {
      return false
    }
  })(),
  formData: 'FormData' in g
};

var parseXML = (text, mimeType) => {
  if (g) {
    // in browser
    // https://github.com/jquery/jquery/blob/master/src/ajax/parseXML.js
    try {
      xml = ( new g.DOMParser() ).parseFromString( text, mime );
    } catch ( e ) {
      xml = undefined;
    }
    if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
      throw new Error("Invalid XML: " + text );
    }
  } else {
    // node, return plain text
    xml = text;
  }
  return xml;
}

var resXML = (res, mimeType) => {
  var xml;
  var type = mimeType;
  var mime = type ? type.split(';').unshift() : 'text/xml' ;
  var text = res.text();
  return text.then( text => parseXML(text, mime) );
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
  xml:         resXML
};

var isCORS = url => {
  if (g.document && g.document.location && /^\w+:\/\//.test(url) ) {
    var frags = url.replace(/^\w+:\/\//, '');
    var index = url.indexOf('/');
    var hostname = frags.substr(0, index);
    return hostname !== g.document.location.hostname;
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
    this.options = {
      method: 'get',
      converters: {
        'text json': JSON.parse,
        'text xml':  parseXML
      }
    };
  }

  param(data) {
    return param(data);
  }

  setup(options) {
    for (let k in options) {
      let v = options[k];
      if (typeof v === 'object') {
        for (let kk in options) {
          let vv = options[kk];
          this.options[k][kk] = vv;
        }
      } else {
        this.options[k] = v;
      }
    }
  }

  request(method, url, data, options = {}) {
    var m = method || options.method || options.type || this.options.method || 'get';
    options.method = m.trim().toUpperCase();

    if (options.headers && options.headers["Content-Type"]) {
      options.headers["Content-Type"] = normalizeContentType(options.headers["Content-Type"]);
    }
    if (options.contentType) {
      options.contentType = normalizeContentType(options.contentType);
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

    var extractor;

    var dataType = options.dataType || this.options.dataType || '*';
    dataType = dataType.trim();
    dataType = (dataType === '*') ? '' : dataType;

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
        setTimeout( () => { reject([new Error('timeout')]) }, timeout);
      }));
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
      var second = value => value;

      mimeType = mimeType || contentType.split(';').shift();
      dataType = mimeType.split(/[\/+]/).pop().toLowerCase() || dataType || 'text';
      extractor = resTractors[dataType];

      if (!extractor && typeof options.converters === 'object') {
        for (let fromto in options.converters) {
          let [from, to] = fromto.split(' ');
          if (to === dataType && resTractors[from]) {
            extractor = resTractors[from];
            second = this.options.converters[fromto];
            break;
          }
        }
      }

      if (!extractor) {
        for (let fromto in this.options.converters) {
          if (options.converters[fromto]) { continue; }
          let [from, to] = fromto.split(' ');
          if (to === dataType && resTractors[from]) {
            extractor = resTractors[from];
            second = this.options.converters[fromto];
            break;
          }
        }
      }

      var value = extractor ? extractor(res, mimeType).then(second) : Promise.reject(new Error(`No converter for response to ${dataType}`));

      return Promise.all([value, statusText, res]).catch( error => { throw([error, res]); });
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
