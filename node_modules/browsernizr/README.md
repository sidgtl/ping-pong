# Browsernizr

Modernizer wrapper for use with browserify (or some other node-style browser module loading system).

## Usage

`npm install browsernizr`

```javascript

// pick what tests you need
require('browsernizr/test/css/rgba');
require('browsernizr/test/file/filesystem');
require('browsernizr/test/websockets');

// make sure to do this _after_ importing the tests
require('browsernizr');

// or if you need access to the modernizr instance:
var Modernizr = require('browsernizr');

```

## Development

To build the latest version of modernizr

```bash
  .. clone repo ..
  npm install
  ./bin/build
```
