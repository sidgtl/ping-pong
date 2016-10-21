/*!
{
  "name": "Dart",
  "property": "dart",
  "authors": ["Theodoor van Donge"],
  "notes": [{
    "name": "Language website",
    "href": "https://www.dartlang.org/"
  }]
}
!*/
/* DOC
Detects native support for the Dart programming language.
*/
var Modernizr = require('./../lib/Modernizr.js');
var prefixed = require('./../lib/prefixed.js');
  Modernizr.addTest('dart', !!prefixed('startDart', navigator));

