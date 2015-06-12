var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');

/*!
{
  "name": "time Element",
  "caniuse": "html5semantic",
  "property": "time",
  "tags": ["elem"],
  "notes": [{
    "name": "WhatWG Spec",
    "href": "http://www.whatwg.org/specs/web-apps/current-work/multipage/rendering.html#the-time-element-0"
  }]
}
!*/

  Modernizr.addTest('time', 'valueAsDate' in createElement('time'));

