var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "iframe[srcdoc] Attribute",
  "property": "srcdoc",
  "tags": ["iframe"],
  "notes": [{
    "name": "WhatWG Spec",
    "href": "http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#attr-iframe-srcdoc"
  }]
}
!*/
/* DOC

Test for `srcdoc` attribute in iframes.

*/

  Modernizr.addTest('srcdoc', 'srcdoc' in createElement('iframe'));

