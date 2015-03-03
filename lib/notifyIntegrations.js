var hipChat = require('./hipChat');



module.exports = function(game, players) {

    game = game.toJSON();

    players = players.map(function(player) {
        return player.toJSON();
    });

    var score = [game.player0_score, game.player1_score]
        .map(function(score) {
            return parseInt(score);
        })
        .sort(function(a, b) {
            return b - a;
        });

    var winner = players.filter(function(player) {
        return parseInt(player.id) === parseInt(game.winner_id);
    })[0];

    var loser = players.filter(function(player) {
        return parseInt(player.id) !== parseInt(game.winner_id);
    })[0];

    var message = getMessage({
        game: game,
        winner: winner,
        loser: loser,
        score: score
    });

    if(hipChat) {
        hipChat.info(message);
    }

};



function getMessage(data) {

    var message;

    /*
     * Whitewash
     */
    if(parseInt(data.score[1]) === 0) {

        message = 'Whitewash!';
        message += ' ' + data.winner.name + ' beat ' + data.loser.name + ' ' + data.score[0] + ' - ' + data.score[1];
        message += ' (facepalm)';

        return message;

    }

    /*
     * Burn!
     */
    if(parseInt(data.game.score_delta) > 12) {

        message = data.loser.name + ' lost to ' + data.winner.name + ' ' + data.score[1] + ' - ' + data.score[0];
        message += '. How about some aloe vera for that burn?';
        message += '\nhttp://www.norracypernmagasinet.se/wp-content/uploads/2014/06/Aloe_Vera_planta_skuren_halsa_norra_cypern.jpg';

        return message;

    }

    /*
     * Default
     */
    message = data.winner.name + ' beat ' + data.loser.name + ' ' + data.score[0] + ' - ' + data.score[1];

    /*
     * Jack won. Sick.
     */
    if(parseInt(data.winner.id) === 9) {
        message = 'Siiiiiiiick. ' + message;
    }

    /*
     * Oli won. Ballmer.
     */
    if(parseInt(data.winner.id) === 4) {
        message += '\nhttp://s3-ec.buzzfed.com/static/enhanced/webdr06/2013/8/23/12/anigif_enhanced-buzz-19263-1377275691-19.gif';
    }

    /*
     * Beat the boss...
     */
    if(data.loser.id === 1) {
        message += '. Go pack up your things.';
    }

    /*
     * Beat the thumb
     */
    if(data.loser.id === 2) {
        message += '\nhttps://s3-eu-west-1.amazonaws.com/uploads-eu.hipchat.com/31788/211381/IIlgvYw7FrjfxVE/alex_thumb.jpg';
    }

    /*
     * Tense
     */
    if(data.score[0] > 22) {
        message = 'That was tense. ' + message;
    }

    return message;

}
