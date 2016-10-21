'use strict';

var assert = require('assert');
var Elo = require('../index.js');

describe('Basic Usage', function() {
  it("should perform valid K-factor lookups", function() {
    var uscf_table = {
      0: 32,
      2100: 24,
      2400: 16
    };

    var elo = new Elo(uscf_table, 0, Infinity);

    assert.equal(elo.getKFactor(), 32);
    assert.equal(elo.getKFactor(0), 32);
    assert.equal(elo.getKFactor(null), 32);
    assert.equal(elo.getKFactor(100), 32);
    assert.equal(elo.getKFactor(-Infinity), null); // Or should this throw an error?
    assert.equal(elo.getKFactor(-1), null); // Or should this throw an error?
    assert.equal(elo.getKFactor(2099), 32);
    assert.equal(elo.getKFactor(2100), 24);
    assert.equal(elo.getKFactor(Infinity), 16);
  });

  it("should allow default for lower bounds lookups", function() {
    var table = {
      0: 32,
      default: 48
    };

    var elo = new Elo(table);

    assert.equal(elo.getKFactor(), 32);
    assert.equal(elo.getKFactor(0), 32);
    assert.equal(elo.getKFactor(1), 32);
    assert.equal(elo.getKFactor(-1), 48);
    assert.equal(elo.getKFactor(-Infinity), 48);
    assert.equal(elo.getKFactor(Infinity), 32);
  });

  it("should use proper table entries when calculating ratings", function() {
    var table = {
      default: 100,
      0: 50,
      1000: 25
    };

    var elo = new Elo(table, -2000, 2000);

    var alice = 500;
    var bob = 2000;
    var cathy = -500;

    assert.equal(elo.newRatingIfWon(alice, bob), 550);
    assert.equal(elo.newRatingIfWon(cathy, bob), -400);

    var derik = 950;

    derik = elo.newRatingIfWon(derik, bob);
    assert.equal(derik, 1000); // +50
    derik = elo.newRatingIfWon(derik, bob);
    assert.equal(derik, 1025); // +25
  });
});
