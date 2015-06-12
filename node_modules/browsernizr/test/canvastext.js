var Modernizr = require('./../lib/Modernizr');
var createElement = require('./../lib/createElement');
require('./../lib/test/canvas');

/*!
{
  "name": "Canvas text",
  "property": "canvastext",
  "caniuse": "canvas-text",
  "tags": ["canvas", "graphics"],
  "polyfills": ["canvastext"]
}
!*/
/* DOC

Detects support for the text APIs for `<canvas>` elements.

*/

  Modernizr.addTest('canvastext',  function() {
    if (Modernizr.canvas  === false) return false;
    return typeof createElement('canvas').getContext('2d').fillText == 'function';
  });

