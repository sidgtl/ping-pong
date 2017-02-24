/*!
{
  "name": "CSS Media Queries",
  "caniuse": "css-mediaqueries",
  "property": "mediaqueries",
  "tags": ["css"],
  "builderAliases": ["css_mediaqueries"]
}
!*/
var Modernizr = require('./../../lib/Modernizr.js');
var mq = require('./../../lib/mq.js');
  Modernizr.addTest('mediaqueries', mq('only all'));

