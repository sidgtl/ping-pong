var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');
var domPrefixes = require('./../../lib/domPrefixes');

/*!
{
  "name": "input[directory] Attribute",
  "property": "directory",
  "authors": ["silverwind"],
  "tags": ["file", "input", "attribute"]
}
!*/
/* DOC

When used on an `<input type="file">`, the `directory` attribute instructs
the user agent to present a directory selection dialog instead of the usual
file selection dialog.

*/

  Modernizr.addTest('fileinputdirectory', function() {
    var elem = createElement('input'), dir = 'directory';
    elem.type = 'file';
    if (dir in elem) {
      return true;
    } else {
      for (var i = 0, len = domPrefixes.length; i < len; i++) {
        if (domPrefixes[i] + dir in elem) {
          return true;
        }
      }
    }
    return false;
  });

