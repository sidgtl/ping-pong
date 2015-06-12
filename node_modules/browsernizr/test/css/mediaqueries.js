var Modernizr = require('./../../lib/Modernizr');
var mq = require('./../../lib/mq');

/*!
{
  "name": "CSS Media Queries",
  "caniuse": "css-mediaqueries",
  "property": "mediaqueries",
  "tags": ["css"]
}
!*/

  Modernizr.addTest('mediaqueries', mq('only all'));

