fetch-er
========

[![Build Status](https://travis-ci.org/othree/fetcher.svg?branch=master)](https://travis-ci.org/othree/fetcher)

A WHATWG [fetch][] helper. WHATWG's fetch is very modern. Simple name, uses Promise, options object. 
But it designed as a low level API. Developers have to deal with some detail. ex: Post parameter 
serialize, transform response JSON to JavaScript object. So here is the fetch-er to help you deal 
with these stuff. Inspired by jQuery.ajax.


[fetch]:http://updates.html5rocks.com/2015/03/introduction-to-fetch

Example
-------

```javascript
fetcher.get('/api/users', null, {dataType: 'json'}).then( ([value, res]) => {
  //...
} )

fetcher.getJSON('/api/users').then( ... )

fetcher.post('/api/users', {name: 'John'}).then( ... )

fetcher.put('/api/users',  {name: 'Wick'}).then( ... )

fetcher.delete('/api/users/23').then( ... )
```

fetch-er is Not
---------------

fetch-er is not designed for every case. If you belongs to one of following situation. You should not use fetch-er:

* Feeling good to use fetch API. Since it's not hard to use fetch without helper.
* Every byte count, you need to keep your script as small as possible. Every byte matters.

Doc
---

fetch-er provide a new global object for browser environment, called `fetcher`. `fetcher` is an instance
of private `Fetcher` class. In other module systems like: CommonJS, AMD, NodeJS. You will get the same 
instance of Fetcher when you include this module.

```javascript
var fetcher = require('fetch-er')
```

To install, you can use `npm` or `bower` or just download `dist/fetcher.js`.

```shell
npm i fetch-er
bower i fetch-er
```


The Fetcher class have the following basic methods: `delete`, `get`, `getJSON`, `head`, `options`, `post`
and `put`. Mapping the method name to HTTP method for the method will use. All methods receives three 
arguments:

* `url`: The url location of the request
* `data`: Optional data for the request
* `options`: Optional options object send to fetch

The options object will send to `fetch` and fetcher provides several new options:

* `contentType`: The data type of request body you are going to send. Will overwrite the one in headers.
* `dataType`: The data type you expect to receive from server. Supports mime type and following shorcut
  `json`, `text` and `xml`.
* `mimeType`: Will overwrite response mimeType before parse to data.
* `timeout`: Will reject returned promise when time limit reach, but no actual abort now(current fetch don't have abort).


What fetcher will do when you do a request through it:

1. If method is `GET` or `HEAD`, parse data to form-urlencoded form. Append to request url.
2. Auto generate request body if necessary. (json, form-urlencoded)
  * JSON, if a request contains headers have `Content-Type: application/json` or `options.contentType` with the same value.
    The data will parsed by `JSON.stringify` and write to body.
  * FormData or ArrayBuffer will send to fetch directly.
  * Default request body is `form-urlencoded`, use [jquery-param](https://www.npmjs.com/package/jquery-param).
3. Set mode to `cors` if request to a different hostname.
4. Auto parse response data. Fetcher will try to figure out what to do based on response content type and `options.dataType`.
  * JSON string will parsed by `JSON.parse`.
  * HTML will be plain text. If you want DOM node as response. You can set `options.dataType` to `xml`.
  * XML will be parse by `DOMParser`.
  * ArrayBuffer or FormData will only available if user set `options.dataType`.
  * Otherwise, response will be plain text.

Fetcher methods will return a Promise just like fetch. But it will be fulfilled with different value, an 
array(`[value, status, response]`). First element is the response value. Second element is text response status. Possible status:

* `nocontent` for 200 or HEAD request.
* `notmodified` for 304 not modified.
* `success` for other success request.

Third element is consumed response object. The reason to use array is easier to use ES6 destructuring assign. Ex:

```javascript
fetcher.get('/api').then( ([value, status, response]) => {
  // blah...
})
```

PS. Plan to return not consumed response. But current polyfill don't support clone.

#### request(method, url, data, options)

There is one more method called `request`. Is the base of all other methods. Receive four arguments: `method`,
`url`, `data` and `options`. The method is in string format. All uppercase characters. Which will pass to 
fetch directly. And fetch will check is method valid.

If an error happened on fetcher reqeust. The returned promise will reject just like a normal fetch request.
This only happens when response status is not normal (100 to 599) or network error. By design fetch will fulfill
returned Promise when server have response. And developers can use `response.ok` to check is this request success.
Only when status code between 200 to 299 will set `ok` to true. But jQuery also accept `304` not modified.
And jQuery will reject all other status code. The behavior is very different. And fetcher still not decide which 
to follow. 

The rejected promise will use an array to reject(`[error, response]`). Some error will not get response.
Ex: timeout or network error.

#### setup(options)

There is a method called `setup` used for setup default option. The default option will be used on every request.
But possible to overwrite when make the request. Current supported options are `method`, `contentType`, `dataType`, 
`mimeType`, `timeout` and `converters`. Default global options are:

```javascript
{
  method: 'get',
  converters: {
    'text json': JSON.parse,
    'text xml':  parseXML
  }
}
```


### Compare to jQuery.ajax

Stat: `y`: support, `p`: partial, `n`: not support, `n/a`: not possible, `todo`: in plan.

| Feature         | Stat              |
|-----------------|-------------------|
| accepts         | y                 |
| ajaxPrefilter() | n                 |
| ajaxSetup()     | p, use setup()    |
| ajaxTransport() | n/a               |
| async           | n/a               |
| beforeSend      | n                 |
| cache           | n                 |
| complete        | use promise chain |
| contents        | n/a               |
| contentType     | y                 |
| context         | n/a               |
| converters      | y, 2 level only   |
| crossDomain     | auto              |
| data            | y                 |
| dataFilter      | n                 |
| dataType        | y                 |
| error           | use promise chain |
| global          | n/a               |
| headers         | y                 |
| ifModified      | n                 |
| isLocal         | n                 |
| jsonp           | n                 |
| jsonpCallback   | n                 |
| method          | y                 |
| mimeType        | y                 |
| password        | n/a               |
| processData     | todo              |
| scriptCharset   | n                 |
| statusCode      | n                 |
| success         | use promise chain |
| timeout         | y                 |
| traditional     | n/a, based on dep |
| type            | y                 |
| url             | y                 |
| username        | n/a               |
| xhr             | n/a               |
| xhrFields       | n/a               |



