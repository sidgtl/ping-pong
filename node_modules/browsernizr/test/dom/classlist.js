/*!
{
  "name": "classList",
  "caniuse": "classlist",
  "property": "classlist",
  "tags": ["dom"],
  "builderAliases": ["dataview_api"],
  "notes": [{
    "name": "MDN Docs",
    "href": "https://developer.mozilla.org/en/DOM/element.classList"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var docElement = require('./../../lib/docElement.js');
  Modernizr.addTest('classlist', 'classList' in docElement);

