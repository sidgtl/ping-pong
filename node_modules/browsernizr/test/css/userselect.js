/*!
{
  "name": "CSS user-select",
  "property": "userselect",
  "caniuse": "user-select-none",
  "authors": ["ryan seddon"],
  "tags": ["css"],
  "builderAliases": ["css_userselect"],
  "notes": [{
    "name": "Related Modernizr Issue",
    "href": "https://github.com/Modernizr/Modernizr/issues/250"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var testAllProps = require('./../../lib/testAllProps.js');
  //https://github.com/Modernizr/Modernizr/issues/250
  Modernizr.addTest('userselect', testAllProps('userSelect', 'none', true));

