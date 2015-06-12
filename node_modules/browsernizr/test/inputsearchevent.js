var Modernizr = require('./../lib/Modernizr');
var hasEvent = require('./../lib/hasEvent');

/*!
{
  "name": "input[search] search event",
  "property": "search",
  "tags": ["input","search"],
  "authors": ["Calvin Webster"],
  "notes": [{
    "name": "Wufoo demo",
    "href": "http://www.wufoo.com/html5/types/5-search.html?"
  }, {
    "name": "CSS Tricks",
    "href": "http://css-tricks.com/webkit-html5-search-inputs/"
  }]
}
!*/
/* DOC

 There is a custom `search` event implemented in webkit browsers when using an `input[search]` element.

 */

    Modernizr.addTest('inputsearchevent',  hasEvent('search'));

