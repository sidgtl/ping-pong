var Modernizr = require('./../../lib/Modernizr');
var prefixed = require('./../../lib/prefixed');

/*!
{
  "name": "RTC Peer Connection",
  "property": "peerconnection",
  "tags": ["webrtc"],
  "authors": ["Ankur Oberoi"],
  "notes": [{
    "name": "W3C Web RTC spec",
    "href": "http://www.w3.org/TR/webrtc/"
  }]
}
!*/

  Modernizr.addTest('peerconnection', !!prefixed('RTCPeerConnection', window));

