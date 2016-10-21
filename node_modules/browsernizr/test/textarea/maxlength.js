/*!
{
  "name": "textarea maxlength",
  "property": "textareamaxlength",
  "aliases": ["textarea-maxlength"],
  "notes": [{
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea"
  }],
  "polyfills": [
    "maxlength"
  ]
}
!*/
/* DOC
Detect support for the maxlength attribute of a textarea element
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('textareamaxlength', !!('maxLength' in createElement('textarea')));

