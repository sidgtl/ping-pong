var Modernizr = require('./../../lib/Modernizr');
var testXhrType = require('./../../lib/testXhrType');

/*!
{
  "name": "XMLHttpRequest xhr.responseType='json'",
  "property": "xhrresponsetypejson",
  "tags": ["network"],
  "notes": [{
    "name": "XMLHttpRequest Living Standard",
    "href": "http://xhr.spec.whatwg.org/#the-responsetype-attribute"
  },{
    "name": "Explanation of xhr.responseType='json'",
    "href": "http://mathiasbynens.be/notes/xhr-responsetype-json"
  }]
}
!*/
/* DOC

Tests for XMLHttpRequest xhr.responseType='json'.

*/

  Modernizr.addTest('xhrresponsetypejson', testXhrType('json'));

