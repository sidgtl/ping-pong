var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');
var prefixes = require('./../../lib/prefixes');

/*!
{
  "name": "CSS Filters",
  "property": "cssfilters",
  "caniuse": "css-filters",
  "polyfills": ["polyfilter"],
  "tags": ["css"]
}
!*/

  // https://github.com/Modernizr/Modernizr/issues/615
  // documentMode is needed for false positives in oldIE, please see issue above
  Modernizr.addTest('cssfilters', function() {
    var el = createElement('div');
    el.style.cssText = prefixes.join('filter:blur(2px); ');
    return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
  });


