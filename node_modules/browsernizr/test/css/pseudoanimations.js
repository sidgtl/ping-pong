var Modernizr = require('./../../lib/Modernizr');
require('./../../lib/testStyles');
require('./../../lib/test/css/animations');

/*!
{
  "name": "CSS Generated Content Animations",
  "property": "csspseudoanimations",
  "tags": ["css"]
}
!*/

  Modernizr.addTest('csspseudoanimations', function () {
    var result = false;

    if (!Modernizr.cssanimations || !window.getComputedStyle) {
      return result;
    }

    var styles = [
      '@', Modernizr._prefixes.join('keyframes csspseudoanimations { from { font-size: 10px; } }@').replace(/\@$/,''),
      '#modernizr:before { content:" "; font-size:5px;',
      Modernizr._prefixes.join('animation:csspseudoanimations 1ms infinite;'),
      '}'
    ].join('');

    Modernizr.testStyles(styles, function (elem) {
      result = window.getComputedStyle(elem, ':before').getPropertyValue('font-size') === '10px';
    });

    return result;
  });

