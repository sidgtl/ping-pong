var PythonShell = require('python-shell');
const TRUESKILL_FILENAME = 'trueSkill/trueSkill.py';

module.exports = function() {
    return this instanceof TrueskillController
        ? TrueskillController
        : new TrueskillController;
};

/*****************************************************************
 * elo is deprecated, just kep temporarily for reference
 */

/**
 * Elo Comparator
 */
function TrueskillController() {
};

/**
 * submits the match result to the trueskill module
 * @param players players indexed by their positions, team1=0+2 team2=1+3
 * @param winningTeam winning team 1 or 2
 */
TrueskillController.prototype.submitMatch = function(players, winningTeam) {
    var team0 = players
        .filter(function(player,index) { return index%2 == 0; })
        .map(function(player) { return player.id; })
        .join(',');
    var team1 = players
        .filter(function(player,index) { return index%2 == 1; })
        .map(function(player) { return player.id; })
        .join(',');

    var options = {
        args: ['submitMatchResult', team0, team1, winningTeam]
    };

    console.log('players: ' + JSON.stringify(players));
    console.log('options for trueskill: ' + JSON.stringify(options));

    PythonShell.run(TRUESKILL_FILENAME, options, function (err, results) {
        if (err) throw err;
        console.log('submitted trueskill results, output: ' + results);
    });
};