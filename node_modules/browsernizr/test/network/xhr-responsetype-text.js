/*!
{
  "name": "XHR responseType='text'",
  "property": "xhrresponsetypetext",
  "tags": ["network"],
  "notes": [{
    "name": "XMLHttpRequest Living Standard",
    "href": "https://xhr.spec.whatwg.org/#the-responsetype-attribute"
  }]
}
!*/
/* DOC
Tests for XMLHttpRequest xhr.responseType='text'.
*/
var Modernizr = require('./../../lib/Modernizr.js');
var testXhrType = require('./../../lib/testXhrType.js');
  Modernizr.addTest('xhrresponsetypetext', testXhrType('text'));

