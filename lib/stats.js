var
    EventEmitter = require('events').EventEmitter,
    through = require('through2'),
    async = require('async'),
    app = require('../app'),
    bookshelf = app.get('bookshelf'),
    events = new EventEmitter();



module.exports = events;



events.on('client.join', getStats);
events.on('game.end', getStats);



var greaterThanZero = function(value) {
    return value > 0;
};



var sortDesc = function(a, b) {
    return b - a;
};



function getStats() {
    countConsecutive();
    largestWhooping();
    totalCompanyGames();
    mostFrequentPlayer();
}



/**
 * Counts consecutive wins or losses and returns
 * the greatest or smallest.
 */
function countConsecutive(criteria, cb) {

    /*var
        streaks = {},
        longestStreak = {
            player: undefined,
            streak: 0
        };

    bookshelf.knex.select('id').from('players')
        .then(function(players) {
            async.each(players, function(player, cb) {
                bookshelf.knex
                    .select('winner_id')
                    .from('games')
                    .whereRaw('player0_id = ?', [player.id])
                    .orWhereRaw('player1_id = ?', [player.id])
                    .then(function(games) {
                        games.forEach(function(game) {
                            var comparator = criteria === 'wins'
                                ? game.winner_id === player.id
                                : game.winner_id !== player.id;
                            if(comparator) {
                                if(typeof streaks[player.id] === 'undefined') {
                                    streaks[player.id] = 0;
                                }
                                streaks[player.id] ++;
                            }
                        });
                        cb();
                    });
            }, function() {
                for(var player in streaks) {
                    if(streaks[player] > longestStreak.streak) {
                        longestStreak.player = player;
                        longestStreak.streak = streaks[player];
                    }
                }
                getPlayer();
            });
        });

    function getPlayer() {
        bookshelf.knex
            .select('name')
            .from('players')
            .where('id', '=', longestStreak.player)
            .then(function(player) {
                if(player.length === 0) return;
                longestStreak.player = player[0].name;
                cb(longestStreak);
            });
    }*/

    var calculated = 0;

    bookshelf.knex
        .select('*')
        .from('players')
        .then(function(players) {

            players.forEach(function(player) {

                var wins = [];
                var losses = [];
                var currentWinningStreak = 0;
                var currentLosingStreak = 0;

                bookshelf.knex
                    .select('*')
                    .from('games')
                    .where('player0_id', '=', player.id)
                    .orWhere('player1_id', '=', player.id)
                    .then(function(games) {

                        games.forEach(function(game, i) {

                            var
                                previous = games[i - 1],
                                isFirst = i === 0,
                                won = game.winner_id === player.id,
                                lost = !won,
                                isConsecutiveLoss,
                                isConsecutiveWin,
                                previousLost,
                                previousWon;

                            if(!isFirst) {
                                previousWon = previous.winner_id === player.id;
                                previousLost = !previousWon;
                                isConsecutiveWin = !isFirst && previousWon && won;
                                isConsecutiveLoss = !isFirst && previousLost && lost;
                            }

                            if(isFirst && won) {
                                currentWinningStreak ++;
                            }

                            if(isFirst && lost) {
                                currentLosingStreak ++;
                            }

                            if(isConsecutiveWin) {
                                currentWinningStreak ++;
                            }

                            if(isConsecutiveLoss) {
                                currentLosingStreak ++;
                            }

                            if(!isFirst && !isConsecutiveWin) {
                                wins.push(currentWinningStreak);
                                currentWinningStreak = 0;
                            }

                            if(!isFirst && !isConsecutiveLoss) {
                                losses.push(currentLosingStreak);
                                currentLosingStreak = 0;
                            }

                            /*if(player.id === 4) {
                                console.log(player.name);
                                console.log('Is first:', isFirst);
                                console.log('Won:', won);
                                console.log('Is consecutive loss:', isConsecutiveLoss);
                                console.log('Is consecutive win:', isConsecutiveWin);
                                console.log('Current winning streak:', currentWinningStreak);
                                console.log('Current losing streak:', currentLosingStreak);
                                console.log('Wins:', wins);
                                console.log('Losses:', losses);
                                console.log('-----------------');
                            }*/

                        });

                        player.winningStreaks = wins
                            .filter(greaterThanZero)
                            .sort(sortDesc);

                        player.losingStreaks = losses
                            .filter(greaterThanZero)
                            .sort(sortDesc);

                        calculated ++;

                        if(calculated === players.length) {
                            var streaks = findLongestStreaks(players);
                            events.emit('biggestWinningStreak', streaks.winning);
                            events.emit('mostConsecutiveLosses', streaks.losing);
                        }

                    });

                });

            });

}



function findLongestStreaks(players) {

    var
        winning = [],
        losing = [];

    var sortStreaksDesc = function(a, b) {
        return b.streak - a.streak;
    };

    players.forEach(function(player) {

        winning.push({
            player: player.name,
            streak: player.winningStreaks[0] || 0
        });

        losing.push({
            player: player.name,
            streak: player.losingStreaks[0] || 0
        });

    });

    winning = winning.sort(sortStreaksDesc)[0];
    losing = losing.sort(sortStreaksDesc)[0];

    return {
        winning: winning,
        losing: losing
    };

}



function biggestWinningStreak() {
    /*countConsecutive('wins', function(longestStreak) {
        events.emit('biggestWinningStreak', longestStreak);
    });*/
    //countConsecutive();
}



function mostConsecutiveLosses() {
    /*countConsecutive('losses', function(longestStreak) {
        events.emit('mostConsecutiveLosses', longestStreak);
    });*/
}



function largestWhooping() {

    var whooping = {
        players: [],
        scores: []
    };

    bookshelf.knex
        .select()
        .from('games')
        .orderBy('score_delta', 'desc')
        .limit(1)
        .then(function(game) {
            if(game.length === 0) return;
            game = game[0];
            whooping.scores = [game.player0_score, game.player1_score];
            async.parallel([
                function(cb) {
                    bookshelf.knex.select('name').from('players').where('id', game.player0_id).then(function(player) {
                        whooping.players[0] = player[0].name;
                        cb();
                    });
                },
                function(cb) {
                    bookshelf.knex.select('name').from('players').where('id', game.player1_id).then(function(player) {
                        whooping.players[1] = player[0].name;
                        cb();
                    });
                }
            ], function() {
                events.emit('largestWhooping', whooping);
            });
        });

}



/**
 * Number of games played
 */
function totalCompanyGames() {
    bookshelf.knex('games').count('id as count')
        .then(function(count) {
            events.emit('totalCompanyGames', count[0].count);
        });
}



/**
 * Get the name of the most frequent player
 */
function mostFrequentPlayer() {

    bookshelf.knex
        .select('name')
        .from('players')
        .orderBy('play_count', 'desc')
        .limit(1)
        .then(function(player) {
            player = player[0].name;
            events.emit('mostFrequentPlayer', player);
        });

}
