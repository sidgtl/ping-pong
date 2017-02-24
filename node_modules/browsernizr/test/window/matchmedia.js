/*!
{
  "name": "matchMedia",
  "property": "matchmedia",
  "caniuse" : "matchmedia",
  "tags": ["matchmedia"],
  "authors": ["Alberto Elias"],
  "notes": [{
    "name": "W3C CSSOM View Module",
    "href": "https://drafts.csswg.org/cssom-view/#the-mediaquerylist-interface"
  }, {
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en-US/docs/Web/API/Window.matchMedia"
  }],
  "polyfills": ["matchmediajs"]
}
!*/
/* DOC

Detects support for matchMedia.

*/
var Modernizr = require('./../../lib/Modernizr.js');
var prefixed = require('./../../lib/prefixed.js');
  Modernizr.addTest('matchmedia', !!prefixed('matchMedia', window));

