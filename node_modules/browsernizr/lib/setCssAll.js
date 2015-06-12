var setCss = require('./setCss');
var prefixes = require('./prefixes');


  /**
   * setCssAll extrapolates all vendor-specific css strings.
   */
  function setCssAll( str1, str2 ) {
    return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
  }

  

module.exports = setCssAll;