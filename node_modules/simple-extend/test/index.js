var chai   = require('chai');
var expect = chai.expect;
var _      = require('lodash');
var extend = require('../simple-extend');

describe('extend', function () {

  it('should attach prototype properties', function() {
    var X = function() {};
    X.extend = extend;

    var Y = X.extend({
      fn: function() {},
      arr: []
    });

    var Z = Y.extend({
      obj: {},
      empty: null
    });

    expect(Y.prototype.fn).to.be.a('function');
    expect(Y.prototype.arr).to.be.an('array');
    expect(Z.prototype.obj).to.eql({});
    expect(Z.prototype.empty).to.eql(null);
  });

  it('should attach static properties', function() {
    var X = function() {};
    X.extend = extend;
    var Y = X.extend({}, {
      fn: function() {},
      arr: []
    });
    var Z = Y.extend({}, {
      obj: {},
      empty: null
    });
    expect(Y.fn).to.be.a('function');
    expect(Y.arr).to.be.an('array');
    expect(Z.obj).to.eql({});
    expect(Z.empty).to.eql(null);
  });

  it('should call a parent extended with the child object', function() {
    var called = 0;
    var X = function() {};
    var fn = function() {};
    X.extend = extend;
    X.extended = function(child) {
      called++;
      expect(child.prototype.arr).to.eql([]);
      expect(child.prototype.fn).to.eql(fn);
    };
    var Y = X.extend({
      fn: fn,
      arr: []
    });
    Y.extended = function(child) {
      called++;
      expect(child.obj).to.eql({});
      expect(child.empty).to.equal(null);
    };
    var Z = Y.extend({}, {
      obj: {},
      empty: null
    });
    expect(called).to.equal(2);
  });

});