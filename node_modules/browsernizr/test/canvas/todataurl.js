/*!
{
  "name": "canvas.toDataURL type support",
  "property": ["todataurljpeg", "todataurlpng", "todataurlwebp"],
  "tags": ["canvas"],
  "builderAliases": ["canvas_todataurl_type"],
  "async" : false,
  "notes": [{
    "name": "MDN article",
    "href": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement.toDataURL"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');

  var canvas = createElement('canvas');

  Modernizr.addTest('todataurljpeg', function() {
    return !!Modernizr.canvas && canvas.toDataURL('image/jpeg').indexOf('data:image/jpeg') === 0;
  });
  Modernizr.addTest('todataurlpng', function() {
    return !!Modernizr.canvas && canvas.toDataURL('image/png').indexOf('data:image/png') === 0;
  });
  Modernizr.addTest('todataurlwebp', function() {
    var supports = false;

    // firefox 3 throws an error when you use an "invalid" toDataUrl
    try {
      supports = !!Modernizr.canvas && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {}

    return supports;
  });


