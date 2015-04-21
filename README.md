fetch-er
========

[![Build Status](https://travis-ci.org/othree/fetcher.svg?branch=master)](https://travis-ci.org/othree/fetcher)

A WHATWG fetch helper. WHATWG's fetch is very modern. Simple name, uses Promise, options object. But it designed as a low level API.
Developers have to deal with some detail. ex: Post parameter serialize, transform response JSON to JavaScript object.
So here is the fetch-er to help you deal with these stuff. Inspired by jQuery.ajax.


Sample
------

    fetcher.get('/api/users', null, {dataType: 'json'}).then( ([value, res]) => {
      //...
    } )

    fetcher.getJSON('/api/users').then( ... )

    fetcher.post('/api/users', {name: 'John'}).then( ... )

    fetcher.put('/api/users',  {name: 'Wick'}).then( ... )

    fetcher.delete( '/api/users/23').then( ... )

DOC
---

fetch-er provide a new global object for browser environment, called `fetcher`. `fetcher` is an instance
of private Fetcher class. In other module systems like: CommonJS, AMD, NodeJS. You will get the same 
instance of Fetcher when you require this module.

The Fetcher class have the following basic methods: `delete`, `get`, `getJSON`, `head`, `options`, `post`
and `put`. Mapping the method name to HTTP method for the method will use. All methods receives three 
arguments:

* `url`: The url location of the request
* `data`: Optional data for the request
* `options`: Optional options object send to fetch.

The options object will send to `fetch` and fetcher provides new options:

* `dataType`: The data type you expect to receive from server. Supports mime type or the following shorcut
  `json`, `text` and `xml`.

What fetcher will do is:

1. Auto generate request body if necessary. (json, form-urlencoded)
2. Set mode to `cors` if request to a different hostname.
3. Auto parse response data. Fetcher will try to figure out what to do based on response content type and 
`options.dataType`.

Fetcher methods will return a Promise just like fetch. But it will be fulfilled with different value, an 
array(`[value, response]`). First element is the response value. Second element is consumed response object.
The reason to use array is that, array form is easier to use ES6 destructor assign.


