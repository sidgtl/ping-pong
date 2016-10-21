/*!
{
  "name": "Framed window",
  "property": "framed",
  "tags": ["window"],
  "builderAliases": ["window_framed"]
}
!*/
/* DOC
Tests if page is iframed.
*/
var Modernizr = require('./../../lib/Modernizr.js');
  // github.com/Modernizr/Modernizr/issues/242

  Modernizr.addTest('framed', window.location != top.location);

