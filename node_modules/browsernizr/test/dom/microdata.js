var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "microdata",
  "property": "microdata",
  "tags": ["dom"],
  "notes": [{
    "name": "W3 Spec",
    "href": "http://www.w3.org/TR/html5/microdata.html"
  }]
}
!*/

  Modernizr.addTest('microdata', 'getItems' in document);

