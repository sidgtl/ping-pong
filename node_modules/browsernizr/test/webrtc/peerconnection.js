/*!
{
  "name": "RTC Peer Connection",
  "property": "peerconnection",
  "tags": ["webrtc"],
  "authors": ["Ankur Oberoi"],
  "notes": [{
    "name": "W3C Web RTC spec",
    "href": "https://www.w3.org/TR/webrtc/"
  }]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var prefixed = require('./../../lib/prefixed.js');
  Modernizr.addTest('peerconnection', !!prefixed('RTCPeerConnection', window));

