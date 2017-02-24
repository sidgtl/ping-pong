var ModernizrProto = require('./ModernizrProto.js');
var omPrefixes = require('./omPrefixes.js');
  var cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);
  ModernizrProto._cssomPrefixes = cssomPrefixes;
  module.exports = cssomPrefixes;

