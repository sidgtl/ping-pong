var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "progress Element",
  "caniuse": "progressmeter",
  "property": ["progressbar", "meter"],
  "tags": ["elem"],
  "authors": ["Stefan Wallin"]
}
!*/

  // Tests for progressbar-support. All browsers that don't support progressbar returns undefined =)
  Modernizr.addTest('progressbar', createElement('progress').max !== undefined);

  // Tests for meter-support. All browsers that don't support meters returns undefined =)
  Modernizr.addTest('meter', createElement('meter').max !== undefined);

