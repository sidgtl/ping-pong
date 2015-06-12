var ModernizrProto = require('./ModernizrProto');
var isEventSupported = require('./isEventSupported');


  // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
  // Modernizr.hasEvent('gesturestart', elem)
  var hasEvent = ModernizrProto.hasEvent = isEventSupported;
  

module.exports = hasEvent;