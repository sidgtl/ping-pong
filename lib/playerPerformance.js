var
    BPromise = require('bluebird'),
    moment = require('moment'),
    mean = require('mean'),
    normalise = require('normalise').normalise,
    app = require('../app'),
    bookshelf = app.get('bookshelf');



module.exports = {
    performance: performance,
    delta: delta
};



function performance(player, time) {

    var
        timeFormat = 'YYYY/MM/DD',
        resolver = BPromise.pending(),
        fromTime = moment(time, timeFormat),
        toTime = moment(time, timeFormat),
        range = 7,
        ratings = [],
        output;

    /*
     * We use a range of days on either side of the specified time in order to
     * calculate an average
     */
    fromTime = fromTime.subtract(range, 'd').format('YYYY/MM/DD');
    toTime = toTime.add(range, 'd').format('YYYY/MM/DD');

    bookshelf.knex('games')
        .join(
            'players as player0',
            'player0.id',
            '=',
            'games.player0_id'
        )
        .join(
            'players as player1',
            'player1.id',
            '=',
            'games.player1_id'
        )
        .select(
            'games.*',
            'player0.name as player0_name',
            'player0.elo as player0_elo',
            'player1.name as player1_name',
            'player1.elo as player1_elo'
        )
        .whereRaw(
            '( player0_id = ? or player1_id = ? ) and games.start > ? and games.start < ?',
            [ player, player, fromTime, toTime ]
        )
        .then(function(games) {

            ratings = games.map(function(game) {

                var position = parseInt(game.player0_id) === parseInt(player) ?
                    0 :
                    1;

                var opponentPosition = position === 0 ?
                    1 :
                    0;

                var playerElo = game[ 'player' + position + '_elo' ];
                var opponentElo = game[ 'player' + opponentPosition + '_elo' ];
                var win = parseInt(game.winner_id) === parseInt(player);
                var performance = calculatePerformance(playerElo, opponentElo, game.score_delta, win);

                var outcome = win ?
                    'Win' :
                    'Lose';

                //console.log(game[ 'player' + position + '_name' ], outcome, performance);

                return performance;

            });

            output = mean(ratings);
            resolver.resolve(output);

        });

    return resolver.promise;

}



function delta(player, fromTime, toTime) {

    var resolver = BPromise.pending();

    BPromise
        .all([
            performance(player, fromTime),
            performance(player, toTime)
        ])
        .then(function(ratings) {

            var
                delta = ratings[1] - ratings[0],
                percentage = Math.round( Math.abs( (delta * 100) / ratings[0] ) );

            if(delta < 0) {
                percentage = -percentage;
            }

            if(ratings[0] === 0 && ratings[1] === 0) {
                delta = 0;
                percentage = 0;
            }

            resolver.resolve({
                delta: delta,
                percentage: percentage
            });

        });

    return resolver.promise;

}



function calculatePerformance(playerElo, opponentElo, scoreDelta, win) {

    var
        scaledPlayerElo = normalise(playerElo, [ 0, 2 ]),
        scaledOpponentElo = normalise(opponentElo, [ 0, 2 ]),
        scaledScoreDelta = normalise(scoreDelta, [ 1, 2 ]),
        multiplier;

    multiplier = win ?
        1 :
        -1;

    return Math.abs( ( scaledPlayerElo * scaledOpponentElo * scaledScoreDelta ) / ( playerElo - opponentElo ) ) * multiplier;

}
