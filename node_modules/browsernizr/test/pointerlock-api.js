/*!
{
  "name": "Pointer Lock API",
  "property": "pointerlock",
  "notes": [{
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en-US/docs/API/Pointer_Lock_API"
  }],
  "builderAliases": ["pointerlock_api"]
}
!*/
/* DOC
Detects support the pointer lock API which allows you to lock the mouse cursor to the browser window.
*/
var Modernizr = require('./../lib/Modernizr.js');
var prefixed = require('./../lib/prefixed.js');
  // https://developer.mozilla.org/en-US/docs/API/Pointer_Lock_API
  Modernizr.addTest('pointerlock', !!prefixed('exitPointerLock', document));

