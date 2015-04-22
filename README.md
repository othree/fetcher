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

There is one more method called `request`. Is the base of all other methods. Receive four arguments: `method`,
`url`, `data` and `options`. The method is in string format. All uppercase characters. Which will pass to 
fetch directly. And fetch will check is method valid.

If an error happened on fetcher reqeust. The returned promise will reject just like a normal fetch request.
This only happens when response status is not normal (100 to 599) or network error. By design fetch will fulfill
returned Promise when server have response. And developers can use `response.ok` to check is this request success.
Only when status code between 200 to 299 will set `ok` to true. But jQuery also accept `304` not modified.
And jQuery will reject all other status code. The behavior is very different. And fetcher still not decide which 
to follow. 
