/*!
{
  "name": "Reverse Ordered Lists",
  "property": "olreversed",
  "notes": [{
    "name": "Impressive Webs article",
    "href": "http://impressivewebs.com/reverse-ordered-lists-html5"
  }],
  "builderAliases": ["lists_reversed"]
}
!*/
/* DOC
Detects support for the `reversed` attribute on the `<ol>` element.
*/
var Modernizr = require('./../lib/Modernizr.js');
var createElement = require('./../lib/createElement.js');
  Modernizr.addTest('olreversed', 'reversed' in createElement('ol'));

