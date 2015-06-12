var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "a[download] Attribute",
  "property": "adownload",
  "caniuse" : "download",
  "tags": ["media", "attribute"],
  "notes": [{
    "name": "WhatWG Reference",
    "href": "http://developers.whatwg.org/links.html#downloading-resources"
  }]
}
!*/
/* DOC

When used on an `<a>`, this attribute signifies that the resource it points to should be downloaded by the browser rather than navigating to it.

*/

  Modernizr.addTest('adownload', !window.externalHost && 'download' in createElement('a'));

