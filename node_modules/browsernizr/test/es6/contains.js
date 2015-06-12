var Modernizr = require('./../../lib/Modernizr');
var is = require('./../../lib/is');

/*!
{
  "name": "ES5 String.prototype.contains",
  "property": "contains",
  "authors": ["Robert Kowalski"],
  "tags": ["es6"]
}
!*/
/* DOC

Check if browser implements ECMAScript 6 `String.prototype.contains` per specification.

*/

  Modernizr.addTest('contains', is(String.prototype.contains, 'function'));

