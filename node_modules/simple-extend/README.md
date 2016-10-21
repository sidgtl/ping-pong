
simple-extend.js
===============

A simple "extend" mechanism, adapted from the Backbone.js library.

[![Build Status](https://travis-ci.org/tgriesser/simple-extend.png)](https://travis-ci.org/tgriesser/simple-extend)

### Use:

```js
MyObject.extend = require('simple-extend');

var SubObject = MyObject.extend(protoProps, [classProps]);
```

If a static `extended` method exists on the parent object, it will be
called at extension time, passing the child object as an argument.

### License

MIT