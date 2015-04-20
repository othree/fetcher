fetcher
=======

[![Build Status](https://travis-ci.org/othree/fetcher.svg?branch=master)](https://travis-ci.org/othree/fetcher)

A WHATWG fetch helper. WHATWG's fetch is very modern. Simple name, uses Promise, options object. But it designed as a low level API.
Developers have to deal with some detail. ex: Post parameter serialize, transform response JSON to JavaScript object.
So here is the fetcher to help you deal with these stuff. Inspired by jQuery.ajax.

Constraint
----------

Because of ECMAScript Promise can't resolve two values. There is no good way to send response object back.
One solution is send an object with the sructure:

    [
      TransformedResponse,
      ResponseInstance
    ]

This is simpler structure for ES6's destructor.

Example
-------

    fetcher.get('/api/users', null, {dataType: 'json'}).then( ... )

    fetcher.getJSON('/api/users').then( ... )

    fetcher.post('/api/users', {name: 'John'}).then( ... )

    fetcher.put('/api/users',  {name: 'Wick'}).then( ... )

    fetcher.delete( '/api/users/23').then( ... )
