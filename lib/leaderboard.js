// This should probably be a method on the game model

var
    BPromise = require('bluebird'),
    app = require('../app'),
    bookshelf = app.get('bookshelf'),
    Player = require('../models/Player');



module.exports.get = function getLeaderboardJSON(limit) {

    limit = limit || 10;
    
    var
        resolver = BPromise.pending(),
        meanPlayCount = 0,
        leaderboard = [];

    Player
        .query('where', 'play_count', '>', '0')
        .fetchAll()
        .then(function(players) {

            /*players.forEach(function(player) {
                meanPlayCount += player.get('play_count');
            });*/
            
            //.meanPlayCount /= players.length;
            
            players.forEach(function(player) {

                /*var compensatedElo = player.get('elo');

                if(player.get('play_count') < meanPlayCount) {
                    compensatedElo /= (meanPlayCount - player.get('play_count'));
                }

                player.set('compensatedElo', compensatedElo);*/
                
                leaderboard.push(player);

            });

            leaderboard = leaderboard.sort(function(a, b) {
                return a.get('elo') - b.get('elo');
            });
            
            leaderboard.reverse();
            leaderboard = leaderboard.slice(0, limit);
            
            resolver.resolve(leaderboard);

        });
    
    return resolver.promise;
    
    /*return Player
        .query('where', 'play_count', '>', '0')
        .query('orderBy', 'elo', 'desc')
        .query('limit', limit)
        .fetchAll();*/

};