/*!
{
  "name": "Video Preload Attribute",
  "property": "videopreload",
  "tags": ["video", "media"]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('videopreload', 'preload' in createElement('video'));

