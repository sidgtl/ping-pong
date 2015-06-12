var Modernizr = require('./../../lib/Modernizr');
var testXhrType = require('./../../lib/testXhrType');

/*!
{
  "name": "XMLHttpRequest xhr.responseType='blob'",
  "property": "xhrresponsetypeblob",
  "tags": ["network"],
  "notes": [{
    "name": "XMLHttpRequest Living Standard",
    "href": "http://xhr.spec.whatwg.org/#the-responsetype-attribute"
  }]
}
!*/
/* DOC

Tests for XMLHttpRequest xhr.responseType='blob'.

*/

  Modernizr.addTest('xhrresponsetypeblob', testXhrType('blob'));

