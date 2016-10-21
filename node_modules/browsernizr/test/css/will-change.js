/*!
{
  "name": "will-change",
  "property": "willchange",
  "notes": [{
    "name": "Spec",
    "href": "https://drafts.csswg.org/css-will-change/"
  }]
}
!*/
/* DOC
Detects support for the `will-change` css property, which formally signals to the
browser that an element will be animating.
*/
var Modernizr = require('./../../lib/Modernizr.js');
var docElement = require('./../../lib/docElement.js');
  Modernizr.addTest('willchange', 'willChange' in docElement.style);

