'use strict';

var assert = require('assert');
var Elo = require('../index.js');

describe('Basic Usage', function() {
  it("should have expected defaults", function() {
    var myElo = new Elo();

    assert.equal(myElo.getKFactor(), 32);
    assert.equal(myElo.getMin(), -Infinity);
    assert.equal(myElo.getMax(), Infinity);
  });

  it("should allow passing in defaults via the constructor", function() {
    var fide = new Elo(20, 2251, 2825);

    assert.equal(fide.getKFactor(), 20);
    assert.equal(fide.getMin(), 2251);
    assert.equal(fide.getMax(), 2825);
  });

  it("should allow updating of parameters after instantiation", function() {
    var uscf = new Elo(31, 0, Infinity);

    assert.equal(uscf.getKFactor(), 31);
    assert.equal(uscf.getMin(), 0);
    assert.equal(uscf.getMax(), Infinity);

    uscf.setMin(100).setMax(2500).setKFactor(27);

    assert.equal(uscf.getMin(), 100);
    assert.equal(uscf.getMax(), 2500);
    assert.equal(uscf.getKFactor(), 27);
  });

  it("prevents scores leaving boundaries", function() {
    var elo = new Elo(32, 100, 2800);

    var alice = 2000;

    for (var i = 0; i < 100; i++) {
      alice = elo.newRating(1, 0, alice);
    }

    assert.equal(alice, 100);

    var bob = 200;

    for (var j = 0; j < 100; j++) {
      bob = elo.newRating(0, 1, bob);
    }

    assert.equal(bob, 2800);
  });

  it("should determine the probability that someone will win or lose", function() {
    var myElo = new Elo(32, 0, 2500);

    var alice = 1400;
    var bob = 1200;

    var odds_alice_wins = myElo.expectedScore(alice, bob);
    var odds_bob_wins = myElo.expectedScore(bob, alice);

    assert(odds_alice_wins <= 1);
    assert(odds_alice_wins >= 0);

    assert(odds_bob_wins <= 1);
    assert(odds_bob_wins >= 0);

    assert(odds_alice_wins > odds_bob_wins);
    assert(approximate(odds_alice_wins + odds_bob_wins, 1));

    var both_odds = myElo.bothExpectedScores(alice, bob);

    assert.equal(odds_alice_wins, both_odds[0]);
    assert.equal(odds_bob_wins, both_odds[1]);
  });

  it("should calculate same scores as WikiPedia", function() {
    var elo = new Elo(32);

    var rating = 1613;

    var opponents = [
      {rating: 1609, score: 0.506},
      {rating: 1477, score: 0.686},
      {rating: 1388, score: 0.785},
      {rating: 1586, score: 0.539},
      {rating: 1720, score: 0.351}
    ];

    opponents.forEach(function(pair) {
      var actual = elo.expectedScore(rating, pair.rating);
      assert(approximate(actual, pair.score, 0.001));
    });
  });

  it("should calculate same ratings as WikiPedia", function() {
    var elo = new Elo(32);

    var current_rating = 1613;
    var actual_score = 3;
    var expected_score = 2.867;

    assert.equal(elo.newRating(expected_score, actual_score, current_rating), 1617);
  });

  it("should do some end-to-end examples", function() {
    var elo = new Elo(24, 200, 3000);

    var alice_rating = 1600;
    var bob_rating = 1300;

    var expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
    var expected_bob_score = elo.expectedScore(bob_rating, alice_rating);

    assert(approximate(expected_alice_score, 0.849, 0.001));
    assert(approximate(expected_bob_score, 0.151, 0.001));

    // Assuming Alice wins (which is expected)

    var alice_new_rating = elo.newRating(expected_alice_score, 1, alice_rating);
    var bob_new_rating = elo.newRating(expected_bob_score, 0, bob_rating);

    assert.equal(alice_new_rating, 1604);
    assert.equal(bob_new_rating, 1296);

    // Assuming Bobb wins (which is unexpected)

    alice_new_rating = elo.newRating(expected_alice_score, 0, alice_rating);
    bob_new_rating = elo.newRating(expected_bob_score, 1, bob_rating);

    assert.equal(alice_new_rating, 1580);
    assert.equal(bob_new_rating, 1320);
  });

  it("should get same results when using convenience methods", function() {
    var elo = new Elo(32);

    var alice_rating = 1275;
    var bob_rating = 1362;

    var expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
    var alice_new_rating = elo.newRating(expected_alice_score, 1, alice_rating);
    var alice_new_rating_convenient = elo.newRatingIfWon(alice_rating, bob_rating);

    assert.equal(alice_new_rating, alice_new_rating_convenient);

    expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
    alice_new_rating = elo.newRating(expected_alice_score, 0, alice_rating);
    alice_new_rating_convenient = elo.newRatingIfLost(alice_rating, bob_rating);

    assert.equal(alice_new_rating, alice_new_rating_convenient);

    expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
    alice_new_rating = elo.newRating(expected_alice_score, 0.5, alice_rating);
    alice_new_rating_convenient = elo.newRatingIfTied(alice_rating, bob_rating);

    assert.equal(alice_new_rating, alice_new_rating_convenient);
  });

  it("should do valid K-factor lookups with no numeric K-Factor provided", function() {
    var elo = new Elo();

    assert.equal(elo.getKFactor(), 32);
    assert.equal(elo.getKFactor(-Infinity), 32);
    assert.equal(elo.getKFactor(Infinity), 32);
    assert.equal(elo.getKFactor(0), 32);
    assert.equal(elo.getKFactor(1), 32);
  });

  it("should do valid K-factor lookups with a numeric K-Factor provided", function() {
    var elo = new Elo(42);

    assert.equal(elo.getKFactor(), 42);
    assert.equal(elo.getKFactor(-Infinity), 42);
    assert.equal(elo.getKFactor(Infinity), 42);
    assert.equal(elo.getKFactor(0), 42);
    assert.equal(elo.getKFactor(1), 42);
  });

  /**
   * Gotta test the test code ;)
   */
  before(function() {
    assert(approximate(1, 1, 0));
    assert(approximate(1, 1));
    assert(approximate(9999.99999999, 9999.999999998));
    assert(!approximate(0.12345, 0.12347));
    assert(!approximate(0.12347, 0.12345));
    assert(approximate(0.12345, 0.12346));
    assert(approximate(0.12346, 0.12345));
  });
});

/**
 * is 0.99999999999999 === 0.99999999999999 ?
 */
function approximate(actual, anticipated, threshold) {
  if (!threshold) {
    threshold = 0.00001;
  }

  var difference = Math.abs(actual - anticipated);

  return difference < threshold;
}
