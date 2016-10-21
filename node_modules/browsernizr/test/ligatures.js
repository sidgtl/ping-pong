/*!
{
  "name": "Font Ligatures",
  "property": "ligatures",
  "caniuse": "font-feature",
  "notes": [{
    "name": "Cross-browser Web Fonts",
    "href": "http://www.sitepoint.com/cross-browser-web-fonts-part-3/"
  }]
}
!*/
/* DOC
Detects support for OpenType ligatures
*/
var Modernizr = require('./../lib/Modernizr.js');
var testAllProps = require('./../lib/testAllProps.js');
  Modernizr.addTest('ligatures', testAllProps('fontFeatureSettings', '"liga" 1'));

