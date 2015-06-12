var Modernizr = require('./../lib/Modernizr');
var domPrefixes = require('./../lib/domPrefixes');
var prefixed = require('./../lib/prefixed');

/*!
{
  "name": "Fullscreen API",
  "property": "fullscreen",
  "caniuse": "fullscreen",
  "notes": [{
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en/API/Fullscreen"
  }],
  "polyfills": ["screenfulljs"]
}
!*/

  // github.com/Modernizr/Modernizr/issues/739
  Modernizr.addTest('fullscreen', !!(prefixed("exitFullscreen", document, false) || prefixed("cancelFullScreen", document, false)));

