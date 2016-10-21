/*!
{
  "name": "Web Cryptography",
  "property": "cryptography",
  "caniuse": "cryptography",
  "tags": ["crypto"],
  "authors": ["roblarsen"],
  "notes": [{
    "name": "W3C Editor's Draft",
    "href": "https://www.w3.org/TR/WebCryptoAPI/"
  }],
  "polyfills": [
    "polycrypt"
  ]
}
!*/
/* DOC
Detects support for the cryptographic functionality available under window.crypto.subtle
*/
var Modernizr = require('./../lib/Modernizr.js');
var prefixed = require('./../lib/prefixed.js');
  var crypto = prefixed('crypto', window);
  Modernizr.addTest('crypto', !!prefixed('subtle', crypto));

