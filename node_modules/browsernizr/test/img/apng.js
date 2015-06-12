var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');
var addTest = require('./../../lib/addTest');
require('./../../lib/test/canvas');

/*!
{
  "name": "Animated PNG",
  "async": true,
  "property": "apng",
  "tags": ["image"],
  "notes": [{
    "name": "Wikipedia Article",
    "href": "http://en.wikipedia.org/wiki/APNG"
  }]
}
!*/
/* DOC

Test for animated png support.

*/

  Modernizr.addAsyncTest(function () {
    if (!Modernizr.canvas) {
      return false;
    }

    var image = new Image();
    var canvas = createElement('canvas');
    var ctx = canvas.getContext('2d');

    image.onload = function () {
      addTest('apng', function () {
        if (typeof canvas.getContext == 'undefined') {
          return false;
        }
        else {
          ctx.drawImage(image, 0, 0);
          return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        }
      });
    };

    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
  });

