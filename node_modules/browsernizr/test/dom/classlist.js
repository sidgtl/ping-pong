var Modernizr = require('./../../lib/Modernizr');
var docElement = require('./../../lib/docElement');

/*!
{
  "name": "classList",
  "caniuse": "classlist",
  "property": "classlist",
  "tags": ["dom"],
  "notes": [{
    "name": "MDN Docs",
    "href": "https://developer.mozilla.org/en/DOM/element.classList"
  }]
}
!*/

  Modernizr.addTest('classlist', 'classList' in docElement);

