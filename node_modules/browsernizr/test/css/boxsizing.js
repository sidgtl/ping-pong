/*!
{
  "name": "Box Sizing",
  "property": "boxsizing",
  "caniuse": "css3-boxsizing",
  "polyfills": ["borderboxmodel", "boxsizingpolyfill", "borderbox"],
  "tags": ["css"],
  "builderAliases": ["css_boxsizing"],
  "notes": [{
    "name": "MDN Docs",
    "href": "https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing"
  },{
    "name": "Related Github Issue",
    "href": "https://github.com/Modernizr/Modernizr/issues/248"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var testAllProps = require('./../../lib/testAllProps.js');
  Modernizr.addTest('boxsizing', testAllProps('boxSizing', 'border-box', true) && (document.documentMode === undefined || document.documentMode > 7));

