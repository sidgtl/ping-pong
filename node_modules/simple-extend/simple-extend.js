// simple-extend.js 0.1.0
// A simple 'extend' helper, adapted from the Backbone.js library.
// http://github.com/tgriesser/simple-extend
var _ = require('lodash');

// Shared empty constructor function to aid in prototype-chain creation.
var ctor = function() {};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
module.exports = function(protoProps, staticProps) {
  var parent = this;
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ parent.apply(this, arguments); };
  }

  // Inherit class (static) properties from parent.
  _.extend(child, parent);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(child.prototype, protoProps);

  // Add static properties to the constructor function, if supplied.
  if (staticProps) _.extend(child, staticProps);

  // Correctly set child's `prototype.constructor`.
  child.prototype.constructor = child;

  // If there is an "extended" function set on the parent,
  // call it with the extended child object.
  if (typeof parent.extended === "function") parent.extended(child);

  // Set a convenience property in case the parent's prototype is needed later.
  child.__super__ = parent.prototype;

  return child;
};