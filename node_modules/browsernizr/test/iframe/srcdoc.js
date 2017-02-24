/*!
{
  "name": "iframe[srcdoc] Attribute",
  "property": "srcdoc",
  "tags": ["iframe"],
  "builderAliases": ["iframe_srcdoc"],
  "notes": [{
    "name": "WhatWG Spec",
    "href": "https://html.spec.whatwg.org/multipage/embedded-content.html#attr-iframe-srcdoc"
  }]
}
!*/
/* DOC
Test for `srcdoc` attribute in iframes.
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('srcdoc', 'srcdoc' in createElement('iframe'));

