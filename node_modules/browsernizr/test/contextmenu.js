/*!
{
  "name": "Context menus",
  "property": "contextmenu",
  "caniuse": "menu",
  "notes": [{
    "name": "W3C spec",
    "href": "http://www.w3.org/TR/html5/interactive-elements.html#context-menus"
  },{
    "name": "thewebrocks.com Demo",
    "href": "http://thewebrocks.com/demos/context-menu/"
  }],
  "polyfills": ["jquery-contextmenu"]
}
!*/
/* DOC
Detects support for custom context menus.
*/
var Modernizr = require('./../lib/Modernizr.js');
var docElement = require('./../lib/docElement.js');
  Modernizr.addTest(
    'contextmenu',
    ('contextMenu' in docElement && 'HTMLMenuItemElement' in window)
  );

