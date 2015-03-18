var
    chalk = require('chalk'),
    debounce = require('debounce'),
    immutable = require('immutable'),
    app = require('../app'),
    elo = require('../lib/eloCalculator'),
    settings = app.get('settings'),
    Feeler = require('./feelerController'),
    Game = require('../models/Game'),
    Player = require('../models/Player'),
    stats = require('../lib/stats').events,
    leaderboard = require('../lib/leaderboard'),
    leaderboardCalculator = require('../lib/leaderboardCalculator'),
    notifyIntegrations = require('../lib/notifyIntegrations'),
    hipChat = require('../lib/hipChat'),
    players = [],
    serve,
    inProgress = false,
    gameModel,
    potentialElo,
    potentialLeaderboard;



module.exports = gameController;



function gameController() {

    this.leaderBoard = [];
    this.online = true;
    this.score = [0, 0];
    this.players = [];
    this.inProgress = false;
    this.feelers = [Feeler(), Feeler()];
    this.gameHistory = [];

    this.feelers.forEach(function(feeler, i) {
        feeler.on('score', function() {
            game.scored({ data: i + 1 });
        });
        feeler.on('removePoint', function() {
            game.pointRemoved({ data: i + 1 });
        });
    });

    stats.on('biggestWinningStreak', function(streak) {
        io.sockets.emit('stats.biggestWinningStreak', streak);
    });

    stats.on('mostConsecutiveLosses', function(streak) {
        io.sockets.emit('stats.mostConsecutiveLosses', streak);
    });

    stats.on('stats.mostImprovedPlayer', function(player) {
        io.sockets.emit('stats.mostImprovedPlayer', player);
    });

    stats.on('largestWhooping', function(whooping) {
        io.sockets.emit('stats.largestWhooping', whooping);
    });

    stats.on('totalCompanyGames', function(count) {
        io.sockets.emit('stats.totalCompanyGames', count);
    });

    stats.on('mostFrequentPlayer', function(player) {
        io.sockets.emit('stats.mostFrequentPlayer', player);
    });

}



/**
 * Sparkcore status update
 */
gameController.prototype.feelerStatus = function(data) {
    game.updateStatus();
};



/**
 * The feelers connected
 */
gameController.prototype.feelersOnline = function() {
    io.sockets.emit('core.online');
};



/**
 * Add a player based on their rfid
 */
gameController.prototype.addPlayerByRfid = function(rfid) {
    game.addPlayer(null, {
        attr: 'rfid',
        value: rfid
    });
};



/**
 * Add a player to the game
 */
gameController.prototype.addPlayer = function(playerID, custom) {

    var
        attr = playerID !== null ? 'id' : custom.attr,
        value = playerID !== null ? playerID : custom.value,
        position;

    // Load the model for the added player
    Player.where(attr, value).fetch().then(function(player) {

        if(!player) {

            console.log(chalk.red('Player ' + value + ' not found'));

            io.sockets.emit('game.playerNotFound', {
                attr: attr,
                value: value
            });

            if(hipChat && custom && custom.attr === 'rfid') {
                hipChat.info('New bat scanned: ' + custom.value);
            }

            return;

        }

        if(players.length === settings.maxPlayers) {
            // A third player joined, prompting the game to be reset
            console.log(chalk.yellow('A third player joined, resetting the game'));
            return game.end(false);
        }

        if(game.playerInGame(player.id)) {
            console.log(chalk.red(player.get('name') + ' is already in the game!'));
            return;
        }

        console.log(chalk.green('Player added: ' + player.get('name')));

        players.push(player);
        position = players.indexOf(player);

        if(players.length === settings.minPlayers) {
            game.ready();
        }

        // Notify the client a player has joined
        io.sockets.emit('player' + position + '.join', {
            player: player.toJSON(),
            position: players.indexOf(player)
        });

        io.sockets.emit('player.join', {
            player: player.toJSON(),
            position: players.indexOf(player)
        });

        io.sockets.emit('leaderboard.hide');

    });

};



/**
 * The card reader experienced an error
 */
gameController.prototype.cardReadError = function() {
    io.sockets.emit('game.cardReadError');
};



/**
 * Reset the game
 */
gameController.prototype.reset = function() {
    gameModel = {};
    players = [];
    potentialElo = null;
    potentialLeaderboard = null;
    this.score = [0,0];
    player.playing = [];
    serve = undefined;
    this.inProgress = false;
    inProgress = false;
    this.gameHistory = [];
    this.updateStatus();
};



gameController.prototype.test = function() {

    this.addPlayer(3);
    this.addPlayer(2);

    game.feelersOnline();
    game.feelersPingReceived();

    var play = function() {

        var press = Math.round(Math.random()) + 1;
        game.feelerPressed({ data: press });

        if(!game.checkWon()) {
            setTimeout(play, 100);
        }

    };

    play();

};



/**
 * End game and reset score
 */
gameController.prototype.end = function(complete) {

    complete = typeof complete == 'undefined' ?
        true :
        complete;

    var
        _this = this,
        winningPlayer = this.leadingPlayer(),
        updatedElos = [],
        updatedRanks = [];

    if(!complete) {
        io.sockets.emit('game.reset');
        return this.reset();
    }

    console.log('potentialElo', potentialElo);
    console.log('potentialLeaderboard', potentialLeaderboard);

    if(winningPlayer - 1 === 0) {

        updatedElos = [
            potentialElo[0].winningElo,
            potentialElo[1].losingElo
        ];

        updatedRanks = [
            leaderboardRank(players[0].id, potentialLeaderboard[0]),
            leaderboardRank(players[1].id, potentialLeaderboard[0])
        ];

    } else {

        updatedElos = [
            potentialElo[0].losingElo,
            potentialElo[1].winningElo
        ];

        updatedRanks = [
            leaderboardRank(players[0].id, potentialLeaderboard[1]),
            leaderboardRank(players[1].id, potentialLeaderboard[1])
        ];

    }

    io.sockets.emit('game.message', {
        message: '<span class="player-0">' + players[0].get('name') + '</span> is now rank ' + updatedRanks[0] + ', <span class="player-1">' + players[1].get('name') + '</span> is rank ' + updatedRanks[1]
    });

    io.sockets.emit('game.end', {
        winner: winningPlayer - 1
    });

    setTimeout(function() {
        io.sockets.emit('game.reset');
    }, settings.winningViewDuration + 200);

    gameModel.set({
        winner_id: players[winningPlayer - 1].id,
        player0_score: game.score[0],
        player1_score: game.score[1],
        score_delta: Math.abs(game.score[0] - game.score[1])
    });

    notifyIntegrations(gameModel, players);

    // Add the game to the DB
    gameModel.save()
        .then(function() {
            stats.emit('game.end');
            _this.reset();
        });

    players.forEach(function(player, i) {

        player.set('elo', updatedElos[i]);

        // Increment play count
        player.set('play_count', player.get('play_count') + 1);

        player.save();

    });

    console.log(chalk.green('Game ending, ' + players[winningPlayer - 1].get('name') + ' won'));

};



/**
 * Receive the feeler press and emit to the feeler controller.
 * The controller will emit a special event depending on the
 * number of presses received in a specified threshold –
 * i.e. `score` or `removePoint`.
 */
gameController.prototype.feelerPressed = function(data) {
    var positionId = data.data - 1;
    game.feelers[positionId].emit('press', positionId);
};


/**
 * The game is ready – two players have joined, but not yet started
 */
gameController.prototype.ready = function() {

    gameModel = new Game();

    gameModel.set({
        player0_id: players[0].get('id'),
        player1_id: players[1].get('id')
    });

    this.getPotentialData();

    // Find the last game between the players
    Game.lastBetweenPlayers([players[0].get('id'), players[1].get('id')])
        .fetch()
        .then(function(game) {

            if(game) {

                var lastGame = [];

                lastGame.push({
                    player: players[0].toJSON(),
                    score: undefined
                });

                lastGame.push({
                    player: players[1].toJSON(),
                    score: undefined
                });

                if(game.get('player0_id') === players[0].get('id')) {
                    lastGame[0].score = game.get('player0_score');
                    lastGame[1].score = game.get('player1_score');
                }

                if(game.get('player0_id') === players[1].get('id')) {
                    lastGame[0].score = game.get('player1_score');
                    lastGame[1].score = game.get('player0_score');
                }

                io.sockets.emit('stats.lastGameBetweenPlayers', {
                    lastGame: lastGame
                });

            } else {

                io.sockets.emit('stats.firstGameBetweenPlayers', {
                    lastGame: undefined
                });

                io.sockets.emit('game.message', {
                    message: 'Players first match'
                });

            }

        });

    // Find the players head to head score
    Player.headToHead(players[0].get('id'), players[1].get('id')).then(function(scores) {
        io.sockets.emit('stats.headToHead', {
            headToHead: scores
        });
    });

};



/**
 * Get Potential Data
 *
 * Calculate leaderboard position and elo for both potential game scenarios.
 */
gameController.prototype.getPotentialData = function() {

    var playersJson = players.map(function(player) {
        return player.toJSON();
    });

    var ranks = _.clone(playersJson);

    var getPlayerPosition = function(player, collection) {

        var position;

        collection.forEach(function(collectionPlayer, i) {
            if(parseInt(collectionPlayer.id) === parseInt(player.id)) {
                position = i;
            }
        });

        return position;

    };

    potentialElo = elo(playersJson);

    leaderboard.get()
        .then(function(data) {

            data = data.map(function(entry) {
                return entry.toJSON();
            });

            potentialLeaderboard = leaderboardCalculator(playersJson, data);

            ranks = ranks.map(function(player, i) {

                var winningLeaderboard = i === 0 ?
                    potentialLeaderboard[0] :
                    potentialLeaderboard[1];

                var losingLeaderboard = i === 0 ?
                    potentialLeaderboard[1] :
                    potentialLeaderboard[0];

                player.rank = getPlayerPosition(player, data) + 1;
                player.winningRank = getPlayerPosition(player, winningLeaderboard) + 1;
                player.losingRank = getPlayerPosition(player, losingLeaderboard) + 1;

                return player;

            });

            this.notifyPotentialRankChange(ranks);

        }.bind(this));

};



/**
 * Notify Potential Rank Change
 *
 * Notify the client if either players rank could change as a result of this game.
 */
gameController.prototype.notifyPotentialRankChange = function(ranks) {

    var
        biggestChange,
        winningDelta,
        losingDelta,
        player;

    /*
     * Ranks is an array of players whose rank will change if they either win or
     * lose the game.
     */
    ranks = ranks
        .map(function(player) {

            var
                winDelta = Math.abs(player.rank - player.winningRank),
                loseDelta = Math.abs(player.rank - player.losingRank);

            if(winDelta > loseDelta) {
                player.biggestDelta = winDelta;
                player.biggestDeltaType = 'win';
            } else {
                player.biggestDelta = loseDelta;
                player.biggestDeltaType = 'lose';
            }

            return player;

        })
        .filter(function(player) {
            return player.biggestDelta > 0;
        })
        .sort(function(a, b) {
            return b.biggestDelta - a.biggestDelta;
        });

    /*
     * Players whose biggest potential rank change is if they win
     */
    winningDelta = ranks
        .filter(function(player) {
            return player.biggestDeltaType === 'win';
        });

    /*
     * Players whose biggest potential rank change is if they lose
     */
    losingDelta = ranks
        .filter(function(player) {
            return player.biggestDeltaType === 'lose';
        });

    if(winningDelta.length > 0) {

        player = winningDelta[0];

        return io.sockets.emit('game.message', {
            message: 'A win for <span class="player-' + position(player.id, players) + '">' + player.name + '</span> takes ' + pronoun(player.gender) + ' to rank ' + player.winningRank
        });

    }

    if(losingDelta.length > 0) {

        player = losingDelta[0];

        return io.sockets.emit('game.message', {
            message: 'A loss for <span class="player-' + position(player.id, players) + '">' + player.name + '</span> knocks ' + pronoun(player.gender) + ' to rank ' + player.losingRank
        });

    }

};




/**
 * Start the game
 */
gameController.prototype.start = function(startingServe) {

    if(!game.minPlayersAdded()) {
        console.log(chalk.red('Can\'t start the game until ' + settings.minPlayers + ' players have joined'));
        return false;
    }

    gameModel.start();
    game.checkServerSwitch(startingServe);
    game.inProgress = true;
    inProgress = true;

};



/**
 * Register a new point scored
 */
gameController.prototype.scored = function(event) {

    var player = event.data;
    var playerID = player - 1;

    if(!game.inProgress) {
        // Game not started, try to start...
        if(!game.start(playerID)) {
            // Could not start, wait...
            return;
        }
    }

    game.score[playerID] ++;

    this.gameHistory.unshift({
        action: 'scorePoint',
        player: playerID,
        score: this.score.slice()
    });

    io.sockets.emit('game.score', {
        player: playerID,
        score: game.score[playerID],
        gameScore: game.score
    });

    if(game.nextPointWins()) {
        io.sockets.emit('game.gamePoint', {
            player: game.leadingPlayer() - 1
        });
    } else {
        io.sockets.emit('game.notGamePoint', {
            player: game.leadingPlayer() - 1,
        });
    }

    // Has anybody won?
    if(game.checkWon()) {
        return;
    }

    // Is it time to switch serves?
    game.checkServerSwitch();

    // Is the next point a winning one?
    game.checkGamePoint();

    game.updateStatus();
};



/**
 * Remove point from a player
 */
gameController.prototype.pointRemoved = function(event) {

    if(!game.inProgress) return;

    var playerID = event.data - 1;

    if(game.score[playerID] > 0) {

        game.score[playerID] --;

        this.gameHistory.unshift({
            action: 'cancelPoint',
            player: playerID,
            score: this.score.slice()
        });

        io.sockets.emit('game.cancelPoint', {
            player: playerID,
            score: game.score[playerID]
        });

        io.sockets.emit('game.notGamePoint', {
            player: playerID
        });

        if(game.checkWon()) {
            return;
        }

        game.checkServerSwitch();
        game.checkGamePoint();
        game.updateStatus();

    }

};



/**
 * Has a player reached 21 with 2 points clear?
 */
gameController.prototype.checkWon = function() {

    var
        playerReachedMaxScore = game.score[0] >= settings.maxScore || game.score[1] >= settings.maxScore,
        playerReachedScoreClearance = Math.abs(game.score[0] - game.score[1]) >= settings.mustWinBy;

    if(playerReachedMaxScore && playerReachedScoreClearance) {
        game.end();
        return true;
    }

    return false;

};



/**
 * Is it time to switch servers?
 */
gameController.prototype.checkServerSwitch = function(forceServe) {

    var
        _this = this,
        totalScore = this.score[0] + this.score[1],
        pointJustCancelled = this.gameHistory.length > 0 && this.gameHistory[0].action == 'cancelPoint',
        switchServer = totalScore % settings.serverSwitchLimit === 0 || this.serverSwitchThresholdMet() || typeof forceServe !== 'undefined',
        switchPreviousServer = (totalScore + 1) % settings.serverSwitchLimit === 0 && pointJustCancelled;

    if(switchServer || switchPreviousServer) {

        if(typeof forceServe !== 'undefined') {
            serve = forceServe;
        } else if(this.score[0] > 0 || this.score[1] > 0) {
            serve = (serve == 1) ? 0 : 1;
            // A point was just cancelled, switch to previous server
            if(switchPreviousServer) {
                serve = serve;
            }
        }

        this.gameHistory.unshift({
            action: 'switchServers',
            server: serve,
            score: this.score.slice()
        });

        io.sockets.emit('game.switchServer', {
            player: serve
        });

    }
};



/**
 * Have both of the players reached the server switch threshold?
 * (the point at which service changes on each score)
 */
gameController.prototype.serverSwitchThresholdMet = function() {
    return this.score.every(function(score) {
        return score >= settings.serverSwitchThreshold;
    });
};



/**
 * Returns the ID of the leading player
 */
gameController.prototype.leadingPlayer = function() {
    var greatestScore = Math.max.apply(Math, this.score);
    return this.score.indexOf(greatestScore) + 1;
};



/**
 * Is the specified player currently playing?
 */
gameController.prototype.playerInGame = function(playerID) {
    return players.some(function(player) {
        return player.id == playerID;
    });
};



/**
 * Have the minimum quantity of players been added?
 */
gameController.prototype.minPlayersAdded = function() {
    return players.length >= settings.minPlayers;
};



/**
 * Could the game end within one point?
 */
gameController.prototype.nextPointWins = function() {

    var
        nextScorePlayer1 = this.score[0] + 1,
        nextScorePlayer2 = this.score[1] + 1,
        leadingPlayer = (nextScorePlayer1 > nextScorePlayer2) ? 1 : 2,
        futureScoreDifference = (nextScorePlayer1 > nextScorePlayer2) ? nextScorePlayer1 - nextScorePlayer2 : nextScorePlayer2 - nextScorePlayer1;

    return (nextScorePlayer1 >= settings.maxScore || nextScorePlayer2 >= settings.maxScore) && (futureScoreDifference + 1 >= settings.mustWinBy);

};



/**
 * Is the next point a winning point?
 */
gameController.prototype.checkGamePoint = function() {

    if(!this.nextPointWins()) return;

    var _this = this;

    io.sockets.emit('game.nextPointWins', {
        player: _this.leadingPlayer() - 1
    });

    if(this.leadingPlayer() == 1) {
        io.sockets.emit("nextPointWins", { "player": 1 });
        console.log('Next point for player 1 wins');
    }

    if(this.leadingPlayer() == 2) {
        io.sockets.emit("nextPointWins", { "player": 2 });
        console.log('Next point for player 2 wins');
    }

};




/**
 * Spark core has sent a batter low event; notify
 * the client
 */
gameController.prototype.batteryLow = function() {

    io.sockets.emit('core.batteryLow');

    if(hipChat) {
        hipChat.warning('Table batteries low');
    }

};



/**
 * Ping received from feelers
 */
var debounceFeelers = debounce(function() {
    io.sockets.emit('feelers.disconnect');
    debounceFeelers();
}, settings.feelers.pingInterval + settings.feelers.pingThreshold);

gameController.prototype.feelersPingReceived = function() {
    io.sockets.emit('feelers.connect');
    debounceFeelers();
};



/**
 * Send current game status to all clients
 */
gameController.prototype.updateStatus = function() {
    var stats = {
        online: this.online
    };
    io.sockets.emit("stats", stats);
};



/**
 * Client Joined
 */
gameController.prototype.clientJoined = function() {
    stats.emit('client.join');
};



/**
 * Pronoun
 */
function pronoun(gender) {

    pronouns = {
        male: 'him',
        female: 'her'
    };

    return pronouns[gender] || 'them';

}



/**
 * Position
 *
 * Determine the position of a player based on their id inside an array of player
 * objects.
 */
function position(id, players) {

    var pos = -1;

    players.forEach(function(player, i) {
        if(parseInt(player.id) === parseInt(id)) {
            pos = i;
        }
    });

    return pos;

}



/**
 * Leaderboard Rank
 */
function leaderboardRank(id, leaderboard) {

    var position = -1;

    leaderboard.forEach(function(player, i) {
        if(parseInt(id) === parseInt(player.id)) {
            position = i + 1;
        }
    });

    return position;

}
