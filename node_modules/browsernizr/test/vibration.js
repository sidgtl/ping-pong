var Modernizr = require('./../lib/Modernizr');
var prefixed = require('./../lib/prefixed');

/*!
{
  "name": "Vibration API",
  "property": "vibrate",
  "notes": [{
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en/DOM/window.navigator.mozVibrate"
  },{
    "name": "W3C spec",
    "href": "http://www.w3.org/TR/vibration/"
  }]
}
!*/
/* DOC

Detects support for the API that provides access to the vibration mechanism of the hosting device, to provide tactile feedback.

*/

  Modernizr.addTest('vibrate', !!prefixed('vibrate', navigator));

