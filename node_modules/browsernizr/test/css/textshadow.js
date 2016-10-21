/*!
{
  "name": "CSS textshadow",
  "property": "textshadow",
  "caniuse": "css-textshadow",
  "tags": ["css"],
  "knownBugs": ["FF3.0 will false positive on this test"]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var testProp = require('./../../lib/testProp.js');
  Modernizr.addTest('textshadow', testProp('textShadow', '1px 1px'));

