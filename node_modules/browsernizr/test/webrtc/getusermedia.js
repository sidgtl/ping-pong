/*!
{
  "name": "getUserMedia",
  "property": "getusermedia",
  "caniuse": "stream",
  "tags": ["webrtc"],
  "authors": ["Eric Bidelman"],
  "notes": [{
    "name": "W3C Media Capture and Streams spec",
    "href": "https://www.w3.org/TR/mediacapture-streams/"
  }],
  "polyfills": ["getusermedia"]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var prefixed = require('./../../lib/prefixed.js');
  Modernizr.addTest('getusermedia', !!prefixed('getUserMedia', navigator));

