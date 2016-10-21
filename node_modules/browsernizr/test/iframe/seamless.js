/*!
{
  "name": "iframe[seamless] Attribute",
  "property": "seamless",
  "tags": ["iframe"],
  "builderAliases": ["iframe_seamless"],
  "notes": [{
    "name": "WhatWG Spec",
    "href": "https://html.spec.whatwg.org/multipage/embedded-content.html#attr-iframe-seamless"
  }]
}
!*/
/* DOC
Test for `seamless` attribute in iframes.
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('seamless', 'seamless' in createElement('iframe'));

