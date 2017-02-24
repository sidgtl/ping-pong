/*!
{
  "name": "XHR responseType='document'",
  "property": "xhrresponsetypedocument",
  "tags": ["network"],
  "notes": [{
    "name": "XMLHttpRequest Living Standard",
    "href": "https://xhr.spec.whatwg.org/#the-responsetype-attribute"
  }]
}
!*/
/* DOC
Tests for XMLHttpRequest xhr.responseType='document'.
*/
var Modernizr = require('./../../lib/Modernizr.js');
var testXhrType = require('./../../lib/testXhrType.js');
  Modernizr.addTest('xhrresponsetypedocument', testXhrType('document'));

