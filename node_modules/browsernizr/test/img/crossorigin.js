/*!
{
  "name": "Image crossOrigin",
  "property": "imgcrossorigin",
  "notes": [{
    "name": "Cross Domain Images and the Tainted Canvas",
    "href": "https://blog.codepen.io/2013/10/08/cross-domain-images-tainted-canvas/"
  }]
}
!*/
/* DOC
Detects support for the crossOrigin attribute on images, which allow for cross domain images inside of a canvas without tainting it
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
    Modernizr.addTest('imgcrossorigin', 'crossOrigin' in createElement('img'));

