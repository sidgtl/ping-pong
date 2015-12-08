// This should probably be a method on the game model

var
    BPromise = require('bluebird'),
    app = require('../app'),
    bookshelf = app.get('bookshelf'),
    Player = require('../models/Player');



module.exports.get = function getLeaderboardJSON(limit, serialize) {

    limit = limit || 10;

    var
        resolver = BPromise.pending(),
        meanPlayCount = 0,
        leaderboard = [];

    Player
        .where('play_count', '>', '0')
        .where('guest', '=', '0')
        .fetchAll()
        .then(function(players) {

            players.forEach(function(player) {
                leaderboard.push(player);
            });

            leaderboard = leaderboard.sort(function(a, b) {
                return a.get('elo') - b.get('elo');
            });

            leaderboard.reverse();

            if(serialize) {
                leaderboard = leaderboard.map(function(player) {
                    return player.toJSON();
                });
            }

            leaderboard = leaderboard.slice(0, limit);

            resolver.resolve(leaderboard);

        });

    return resolver.promise;

};

module.exports.prev = function prevLeaderboardJSON(limit, serialize) {

    limit = limit || 10;

    var
        resolver = BPromise.pending(),
        meanPlayCount = 0,
        leaderboard = [];

    Player
        .where('play_count', '>', '0')
        .where('guest', '=', '0')
        .fetchAll()
        .then(function(players) {

            players.forEach(function(player) {
                leaderboard.push(player);
            });

            leaderboard = leaderboard.sort(function(a, b) {
                return a.get('elo_cache') - b.get('elo_cache');
            });

            leaderboard.reverse();

            if(serialize) {
                leaderboard = leaderboard.map(function(player) {
                    return player.toJSON();
                });
            }

            leaderboard = leaderboard.slice(0, limit);

            resolver.resolve(leaderboard);

        });

    return resolver.promise;
}
