'use strict';



var
    _ = require('underscore'),
    Arpad = require('arpad'),
    k = require('../kFactor');



module.exports = function(players)  {
    return [
        compare([ players[0], players[1] ]),
        compare([ players[1], players[0] ])
    ];
};



function compare(players) {

    var
        elo = new Arpad(k, 0),
        subject = _.clone(players[0]),
        comparison = players[1];

    subject.winningElo = elo.newRatingIfWon(subject.elo, comparison.elo);
    subject.losingElo = elo.newRatingIfLost(subject.elo, comparison.elo);

    return subject;

}
