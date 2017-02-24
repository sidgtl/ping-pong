/*!
{
  "name": "Scroll Snap Points",
  "property": "scrollsnappoints",
  "notes": [{
    "name": "Setting native-like scrolling offsets in CSS with Scrolling Snap Points",
    "href": "http://generatedcontent.org/post/66817675443/setting-native-like-scrolling-offsets-in-css-with"
  },{
    "name": "MDN Article",
    "href": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll_Snap_Points"
  }],
  "polyfills": ["scrollsnap"]
}
!*/
/* DOC
Detects support for CSS Snap Points
*/
var Modernizr = require('./../../lib/Modernizr.js');
var testAllProps = require('./../../lib/testAllProps.js');
    Modernizr.addTest('scrollsnappoints', testAllProps('scrollSnapType'));

