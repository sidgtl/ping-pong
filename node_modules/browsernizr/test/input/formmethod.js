/*!
{
  "name": "input formmethod",
  "property": "inputformmethod",
  "notes": [{
    "name": "WHATWG Spec",
    "href": "https://html.spec.whatwg.org/multipage/forms.html#attr-fs-formmethod"
  }, {
    "name": "Wufoo demo",
    "href": "https://www.wufoo.com/html5/attributes/14-formmethod.html"
  }],
  "polyfills": [
    "webshims"
  ]
}
!*/
/* DOC
Detect support for the formmethod attribute on form inputs
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('inputformmethod', !!('formMethod' in createElement('input')));

