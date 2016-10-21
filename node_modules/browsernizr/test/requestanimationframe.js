/*!
{
  "name": "requestAnimationFrame",
  "property": "requestanimationframe",
  "aliases": ["raf"],
  "caniuse": "requestanimationframe",
  "tags": ["animation"],
  "authors": ["Addy Osmani"],
  "notes": [{
    "name": "W3C spec",
    "href": "https://www.w3.org/TR/animation-timing/"
  }],
  "polyfills": ["raf"]
}
!*/
/* DOC
Detects support for the `window.requestAnimationFrame` API, for offloading animation repainting to the browser for optimized performance.
*/
var Modernizr = require('./../lib/Modernizr.js');
var prefixed = require('./../lib/prefixed.js');
  Modernizr.addTest('requestanimationframe', !!prefixed('requestAnimationFrame', window), {aliases: ['raf']});

