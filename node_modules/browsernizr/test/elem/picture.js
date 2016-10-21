/*!
{
  "name": "picture Element",
  "property": "picture",
  "tags": ["elem"],
  "authors": ["Scott Jehl", "Mat Marquis"],
  "notes": [{
    "name": "Specification",
    "href": "http://picture.responsiveimages.org"
  },{
    "name": "Relevant spec issue",
    "href": "https://github.com/ResponsiveImagesCG/picture-element/issues/87"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
  Modernizr.addTest('picture', 'HTMLPictureElement' in window);

