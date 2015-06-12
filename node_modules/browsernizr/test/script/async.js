var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "script[async]",
  "property": "scriptasync",
  "caniuse": "script-async",
  "tags": ["script"],
  "authors": ["Theodoor van Donge"]
}
!*/
/* DOC

Detects support for the `async` attribute on the `<script>` element.

*/

  Modernizr.addTest('scriptasync', 'async' in createElement('script'));

