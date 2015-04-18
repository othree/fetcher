fetcher
=======

A WHATWG fetch helper. WHATWG's fetch is very modern uses Promise, options object. But it low level API.
Developers have to deal with some detail. ex: Post parameter serialize, transform response JSON to JavaScript object.
So here is the fetcher to help you deal with these stuff. Inspired by jQuery.ajax.

Constraint
----------

Because of ECMAScript Promise can't resolve two values. There is no good way to send response object back.
One solution is send an object with the sructure:

    {
      value: TransformedResponse,
      response: ResponseInstance
    }

Or in array:

    [
      TransformedResponse,
      ResponseInstance
    ]

Or fetcher can add support jQuery.ajax's success callback function.
