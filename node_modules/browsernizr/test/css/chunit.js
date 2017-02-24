/*!
{
  "name": "CSS Font ch Units",
  "authors": ["Ron Waldon (@jokeyrhyme)"],
  "property": "csschunit",
  "tags": ["css"],
  "notes": [{
    "name": "W3C Spec",
    "href": "https://www.w3.org/TR/css3-values/#font-relative-lengths"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var modElem = require('./../../lib/modElem.js');
  Modernizr.addTest('csschunit', function() {
    var elemStyle = modElem.elem.style;
    var supports;
    try {
      elemStyle.fontSize = '3ch';
      supports = elemStyle.fontSize.indexOf('ch') !== -1;
    } catch (e) {
      supports = false;
    }
    return supports;
  });

