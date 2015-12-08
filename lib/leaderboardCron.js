var
    CronJob = require('cron').CronJob,
    leaderboard = require('./leaderboard'),
    hipChat = require('./hipChat'),
    BPromise = require('bluebird'),
    Player = require('../models/Player'),
    job,
    present;



module.exports = start;



function start() {
    leaderboard.get(10, true)
        .then(function(data) {

            job = new CronJob(
                '30 08,16 * * 1-5',
                compare,
                null,
                true,
                'Europe/London'
            );

        });
}



function compare() {

    promises = [
        leaderboard.get(10, true),
        leaderboard.prev(10, true)
    ];

    BPromise.all(promises.map(function(promise) {
        return promise.reflect();
    })).then(function(inspection) {

        data = inspection[0].value();
        present = inspection[1].value();

        var
            presentPositions = positions(present),
            updatedPositions = positions(data),
            diff = diffArray(updatedPositions, presentPositions);
            html = render(data, present, diff);

        notify(html);

        updateEloCache(data);

    });

}



function handleDelta(delta) {

    var niceDelta = Math.abs(delta);

    return delta < 0 ?
        '-' + niceDelta :
        '+' + niceDelta;

}



function render(newData, presentData, diff) {

    var styles = {
        cell: [
            'padding: 0.5em',
            'border-bottom: 1px solid #f0f0f0'
        ],
        numericCell: [
            'text-align: right'
        ],
        headerCell: [
            'border-bottom-width: 2px'
        ]
    };

    var style = function(types) {
        return types
            .map(function(type) {
                return styles[type].join(';');
            }).join(';') + ';';
    };

    var rows = newData.map(function(player, i) {

        var
            delta,
            niceDelta = 0,
            eloDelta,
            niceEloDelta = 0;

        delta = diff.move
            .filter(function(move) {
                return move.value === player.id;
            })
            .map(function(move) {
                return move.delta;
            })[0];

        if(delta) {
            niceDelta = handleDelta(delta);
        }

        eloDelta = presentData
            .filter(function(presentPlayer) {
                return presentPlayer.id === player.id;
            })
            .map(function(presentPlayer) {
                if (0 == presentPlayer.elo_cache) {
                    return 0;
                }
                return player.elo - presentPlayer.elo_cache;
            })[0];

        if(eloDelta) {
            niceEloDelta = handleDelta(eloDelta);
        }

        return [
            '<tr>',
                '<td style="' + style([ 'cell', 'numericCell' ]) + '" align="right">' + (i + 1) + '.</td>',
                '<td style="' + style([ 'cell' ]) + '">' + player.name + '</td>',
                '<td style="' + style([ 'cell', 'numericCell' ]) + '" align="right">' + player.elo + '</td>',
                '<td style="' + style([ 'cell', 'numericCell' ]) + '" align="right">' + niceDelta + '</td>',
                '<td style="' + style([ 'cell', 'numericCell' ]) + '" align="right">' + niceEloDelta + '</td>',
            '</tr>'
        ].join('');

    }).join('');

    return [
        '<table cellspacing="0" cellpadding="0.5em">',
            '<thead>',
                '<tr>',
                    '<th style="' + style([ 'cell', 'numericCell', 'headerCell' ]) + '" align="right"></th>',
                    '<th style="' + style([ 'cell', 'headerCell' ]) + '">Player</th>',
                    '<th style="' + style([ 'cell', 'numericCell', 'headerCell' ]) + '" align="right">Elo</th>',
                    '<th style="' + style([ 'cell', 'numericCell', 'headerCell' ]) + '" align="right">Rank Change</th>',
                    '<th style="' + style([ 'cell', 'numericCell', 'headerCell' ]) + '" align="right">Elo Change</th>',
                '</tr>',
            '</thead>',
            '<tbody>' + rows + '</tbody>',
        '</table>'
    ].join('');

}



function positions(leaderboard) {
    return leaderboard.map(function(player) {
        return player.id;
    });
}



function notify(message) {
    if(hipChat) {
        hipChat.info(message);
    }
}


/**
 * Updates the elo cache column for all users at the end of the cron job.
 */
function updateEloCache(data) {

    Player
      .fetchAll()
      .then(function(players) {
        players.forEach(function(player) {
          player.set({elo_cache: player.get('elo')}).save();
        });
      });

}



function diffArray(a, b) {

    var diff = {
        add: [],
        remove: [],
        move: [],
        diff: false
    };

    diff.add = a.filter(function(value) {
        return b.indexOf(value) === -1;
    });

    diff.remove = b.filter(function(value) {
        return a.indexOf(value) === -1;
    });

    diff.move = a
        .filter(function(value) {
            return a.indexOf(value) !== b.indexOf(value);
        })
        .map(function(value) {
            return {
                value: value,
                delta: b.indexOf(value) - a.indexOf(value)
            };
        });

    diff.diff = a.some(function(value, i) {
        return b[i] !== value;
    });

    return diff;

}
