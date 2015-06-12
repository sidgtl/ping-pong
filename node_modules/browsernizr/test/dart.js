var Modernizr = require('./../lib/Modernizr');
var prefixed = require('./../lib/prefixed');

/*!
{
  "name": "Dart",
  "property": "dart",
  "authors": ["Theodoor van Donge"],
  "notes": [{
    "name": "Language website",
    "href": "http://www.dartlang.org/"
  }]
}
!*/
/* DOC

Detects native support for the Dart programming language.

*/

  Modernizr.addTest('dart', !!prefixed('startDart', navigator));

