var Modernizr = require('./../../lib/Modernizr');
var createElement = require('./../../lib/createElement');
var testStyles = require('./../../lib/testStyles');

/*!
{
  "name": "CSS general sibling selector",
  "caniuse": "css-sel3",
  "property": "siblinggeneral",
  "tags": ["css"],
  "notes": [{
    "name": "Related Github Issue",
    "href": "https://github.com/Modernizr/Modernizr/pull/889"
  }]
}
!*/

  Modernizr.addTest('siblinggeneral', function(){
   return testStyles('#modernizr div {width:100px} #modernizr div ~ div {width:200px;display:block}', function(elem, rule){
      return elem.lastChild.offsetWidth == 200;
    }, 2);
  });

