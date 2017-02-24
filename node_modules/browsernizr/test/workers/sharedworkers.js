/*!
{
  "name": "Shared Workers",
  "property": "sharedworkers",
  "caniuse" : "sharedworkers",
  "tags": ["performance", "workers"],
  "builderAliases": ["workers_sharedworkers"],
  "notes": [{
    "name": "W3C Reference",
    "href": "https://www.w3.org/TR/workers/"
  }]
}
!*/
/* DOC
Detects support for the `SharedWorker` API from the Web Workers spec.
*/
var Modernizr = require('./../../lib/Modernizr.js');
  Modernizr.addTest('sharedworkers', 'SharedWorker' in window);

