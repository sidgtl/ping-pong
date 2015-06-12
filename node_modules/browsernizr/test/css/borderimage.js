var Modernizr = require('./../../lib/Modernizr');
var testAllProps = require('./../../lib/testAllProps');

/*!
{
  "name": "Border Image",
  "property": "borderimage",
  "caniuse": "border-image",
  "polyfills": ["css3pie"],
  "tags": ["css"]
}
!*/

    Modernizr.addTest('borderimage', testAllProps('borderImage', 'url() 1', true));

