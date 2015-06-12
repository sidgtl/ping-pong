var Modernizr = require('./../../lib/Modernizr');
var testXhrType = require('./../../lib/testXhrType');

/*!
{
  "name": "XMLHttpRequest xhr.responseType='text'",
  "property": "xhrresponsetypetext",
  "tags": ["network"],
  "notes": [{
    "name": "XMLHttpRequest Living Standard",
    "href": "http://xhr.spec.whatwg.org/#the-responsetype-attribute"
  }]
}
!*/
/* DOC

Tests for XMLHttpRequest xhr.responseType='text'.

*/

  Modernizr.addTest('xhrresponsetypetext', testXhrType('text'));

