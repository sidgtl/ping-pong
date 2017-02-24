/*!
{
  "name": "Audio Loop Attribute",
  "property": "audioloop",
  "tags": ["audio", "media"]
}
!*/
/* DOC
Detects if an audio element can automatically restart, once it has finished
*/
var Modernizr = require('./../../lib/Modernizr.js');
var createElement = require('./../../lib/createElement.js');
  Modernizr.addTest('audioloop', 'loop' in createElement('audio'));

