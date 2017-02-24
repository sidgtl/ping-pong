## trigger-then

Created for use in [bookshelf.js](http://github.com/tgriesser/bookshelf)

Adds promises to `Backbone` event triggers, with a `triggerThen` method,
resolving when everything that needs triggering has completed. Allows 
returning values or promises from the listeners, where a failed promise will
reject the events. An error thrown inside the events will also return a 
rejected promise.

[![Build Status](https://travis-ci.org/bookshelf/trigger-then.png?branch=master)](https://travis-ci.org/bookshelf/trigger-then)

### Initializing:

Provide two arguments to the `trigger-then` library when required: 
the copy of `Backbone` to mixin the `triggerThen` function, and the
promise library (assuming it has a `reject` and `all` function).

```
require('trigger-then')(Backbone, When);

var Model = new Backbone.Model();

Model.triggerThen('change').then(function(resp) {

  // success!

}, function(e) {
  
  // error!
  console.log(e.stack);

});
```

### License

MIT
