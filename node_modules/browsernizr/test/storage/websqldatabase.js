/*!
{
  "name": "Web SQL Database",
  "property": "websqldatabase",
  "caniuse": "sql-storage",
  "tags": ["storage"]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
  // Chrome incognito mode used to throw an exception when using openDatabase
  // It doesn't anymore.
  Modernizr.addTest('websqldatabase', 'openDatabase' in window);

