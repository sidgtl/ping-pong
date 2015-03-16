'use strict';



var
    _ = require('underscore'),
    elo = require('./eloCalculator');



module.exports = function(players, leaderboard) {
    return [
        compare(players, leaderboard),
        compare(players.reverse(), leaderboard),
    ];
};



function compare(players, leaderboard) {

    players = elo(players);
    var output = _.clone(leaderboard);

    output = output.map(function(leaderboardPlayer) {

        var adjustedPlayer = _.clone(leaderboardPlayer);

        if(parseInt(leaderboardPlayer.id) === parseInt(players[0].id)) {
            adjustedPlayer.elo = players[0].winningElo;
            return adjustedPlayer;
        }

        if(parseInt(leaderboardPlayer.id) === parseInt(players[1].id)) {
            adjustedPlayer.elo = players[1].losingElo;
            return adjustedPlayer;
        }

        return adjustedPlayer;

    });

    return output.sort(sortLeaderboard);

}



function sortLeaderboard(a, b) {
    return parseInt(b.elo) - parseInt(a.elo);
}
