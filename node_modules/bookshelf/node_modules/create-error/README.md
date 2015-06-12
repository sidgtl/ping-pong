create-error.js
===============

A simple helper for creating subclassed errors in Javascript.

[![Build Status](https://travis-ci.org/tgriesser/create-error.png)](https://travis-ci.org/tgriesser/create-error)

## Use:

```bash
$ npm   install create-error
$ bower install create-error
```

```js
var createError    = require('create-error');

var MyCustomError  = createError('MyCustomError');
var SubCustomError = createError(MyCustomError, 'CoolSubError', {messages: []});

var sub = new SubCustomError('My Message', {someVal: 'value'});

sub instanceof SubCustomError // true
sub instanceof MyCustomError  // true
sub instanceof Error          // true

assert.deepEqual(sub.messages, []) // true
assert.equal(sub.someVal, 'value') // true
```

### createError(name, [properties])

Creates a new error by specifying the name of the error to be created,
taking an optional hash of properties to be attached to the error class
upon creation.

### createError(Target, [name, [properties]])

Create a new error by specifying the `Target` error class we wish to inherit from,
along with an optional name and properties for the error. If the `name` is omitted,
it will have the same name as the parent error.

### Additional Notes:

In the browser, the function will be assigned to `window.createError`,
and `createError.noConflict()` will restore the original `window.createError`
if overwritten.

### License

MIT
