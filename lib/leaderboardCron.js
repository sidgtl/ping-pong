var
    CronJob = require('cron').CronJob,
    leaderboard = require('./leaderboard'),
    hipChat = require('./hipChat'),
    job,
    present;



module.exports = start;



function start() {
    leaderboard.get(10, true)
        .then(function(data) {

            present = data;

            job = new CronJob('30 08,16 * * 1-5', function() {
                console.log('Executed cronjob');
                compare();
            }, null, true, 'Europe/London');

        });
}



function compare() {

    leaderboard.get(10, true)
        .then(function(data) {

            var
                presentPositions = positions(present),
                updatedPositions = positions(data),
                diff = diffArray(updatedPositions, presentPositions),
                html = render(data, present, diff);

            notify(html);

            present = data;

        });

}



function render(newData, presentData, diff) {

    var rows = newData.map(function(player, i) {

        var
            niceDelta = 0,
            delta;

        delta = diff.move
            .filter(function(move) {
                return move.value === player.id;
            })
            .map(function(move) {
                return move.delta;
            })[0];

        if(delta) {

            niceDelta = Math.abs(delta);

            niceDelta = delta < 0 ?
                '-' + niceDelta :
                '+' + niceDelta;

        }

        return [
            '<tr>',
                '<td>' + (i + 1) + '.</td>',
                '<td>' + player.name + '</td>',
                '<td>' + player.elo + '</td>',
                '<td>' + niceDelta + '</td>',
            '</tr>'
        ].join('');

    }).join('');

    return [
        '<table>',
            '<thead>',
                '<tr>',
                    '<th>Rank</th>',
                    '<th>Player</th>',
                    '<th>Elo</th>',
                    '<th>Rank Change</th>',
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
