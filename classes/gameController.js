var
	chalk = require('chalk'),
    async = require('async'),
	debounce = require('debounce'),
	app = require('../app'),
	elo = require('./eloComparator')(),
	settings = app.get('settings'),
	Feeler = require('./feelerController'),
	Game = require('../models/Game'),
	Player = require('../models/Player'),
	stats = require('../lib/stats'),
	leaderboard = require('../lib/leaderboard'),
	players = [],

	first_set_random_names = ['addicting',
		'afraid','agreeable', 'amused', 'ancient',
		'angry', 'annoyed', 'anxious',
		'arrogant', 'ashamed', 'average',
		'awful', 'bad', 'beautiful',
		'better', 'big', 'bitter'
	],

	second_set_random_names = ['Lee', 'De Niro', 'Nicholson', 'Hanks',
		'Brando', 'Pacino', 'Washington',
		'Pitt', 'Cruise' , 'Clooney', 'Streep',
		'Monroe', 'Lawrence', 'Kidman', 'Foster', 'Roberts', 'Duvall', 'Williams',
		'Connery', 'Neeson' , 'Willis', 'Smith', 'Jolie', 'Smith', 'Loren', 'Maradona',
		'Beckenbauer', 'Matthäus', 'Müller', 'Kahn'
	],

	serve,
	startingPlayer,
	inProgress = false,
	gameModel;


module.exports = gameController;


function gameController() {

	this.leaderBoard = [];
	this.online = true;
	this.score = [0, 0];
	this.players = [];
	this.inProgress = false;
	this.feelers = [Feeler(), Feeler()];
	this.gameHistory = [];
	this.playersForRematch = [];

	this.feelers.forEach(function (feeler, i) {
		feeler.on('score', function () {
			game.scored({data: i + 1});
		});
		feeler.on('removePoint', function () {
			game.pointRemoved({data: i + 1});
		});
	});

	stats.on('biggestWinningStreak', function (streak) {
		io.sockets.emit('stats.biggestWinningStreak', streak);
	});

	stats.on('mostConsecutiveLosses', function (streak) {
		io.sockets.emit('stats.mostConsecutiveLosses', streak);
	});

	stats.on('largestWhooping', function (whooping) {
		io.sockets.emit('stats.largestWhooping', whooping);
	});

	stats.on('totalCompanyGames', function (count) {
		io.sockets.emit('stats.totalCompanyGames', count);
	});

	stats.on('mostFrequentPlayer', function (player) {
		io.sockets.emit('stats.mostFrequentPlayer', player);
	});

	elo.on('tip.playerWin', function (player) {

		var
			pronoun = 'them',
			genderPronouns = {
				male: 'him',
				female: 'her'
			};

		if (player.gender) {
			pronoun = genderPronouns[player.gender];
		}

		io.sockets.emit('game.message', {
			message: 'A win for <span class="player-' + player.position + '">' + player.name + '</span> takes ' + pronoun + ' to rank ' + player.winningLeaderboardRank
		});

	});

}


/**
 * Sparkcore status update
 */
gameController.prototype.feelerStatus = function (data) {
	game.updateStatus();
};


/**
 * The feelers connected
 */
gameController.prototype.feelersOnline = function () {
	io.sockets.emit('core.online');
};


/**
 * Add a player based on their rfid
 */
gameController.prototype.addPlayerByRfid = function (rfid) {
	game.addPlayer(null, {
		attr: 'rfid',
		value: rfid
	});
};


/**
 * Add a player to the game
 */
gameController.prototype.addPlayer = function(playerID, custom, cb) {
    
    var
        attr = playerID !== null ? 'id' : custom.attr,
        value = playerID !== null ? playerID : custom.value,
        position;

    if(typeof cb === 'undefined') {
        cb = function() {};
    }
    
    // Load the model for the added player
    Player.where(attr, value).fetch().then(function(player) {
        
        if(!player) {
            console.log(chalk.red('Player ' + value + ' not found'));
            io.sockets.emit('game.playerNotFound', {
                attr: attr,
                value: value
            });
            cb();
            return;
        }

        if(players.length >= settings.maxPlayers) {
            // maxPlayers+1 player joined, prompting the game to be reset
            console.log(chalk.yellow('A ' + (settings.maxPlayers + 1) + '. player joined, resetting the game'));
            cb();
            return game.end(false);
        }
        
        if(game.playerInGame(player.id)) {
            console.log(chalk.red(player.get('name') + ' is already in the game!'));
            cb();
            return;
        } 
        
        players.push(player);
        position = players.indexOf(player);
        elo.addPlayer(player, position);
        
        console.log(chalk.green('Player added: ' + player.get('name'))+' at position:'+position);

        if(players.length === settings.minPlayers) {
          console.log("game ready!\n");
          game.ready();
        }
        
        // Notify the client a player has joined
        io.sockets.emit('player.join', {
            player: player.toJSON(),
            position: players.indexOf(player)
        });
        
        io.sockets.emit('leaderboard.hide');
        
        cb();
    });
    
};

Array.prototype.randomElement = function () {
	return this[Math.floor(Math.random() * this.length)]
};


/**
 * The card reader experienced an error
 */
gameController.prototype.cardReadError = function () {
	io.sockets.emit('game.cardReadError');
};


/**
 * Reset the game
 */
gameController.prototype.reset = function () {
	gameModel = {};
	players = [];
	this.score = [0, 0];
	player.playing = [];
	serve = undefined;
	startingPlayer = undefined;
	this.inProgress = false;
	inProgress = false;
	this.gameHistory = [];
	elo.reset();
	this.updateStatus();
};


/**
 * End game and reset score
 */
gameController.prototype.end = function (complete) {

	complete = typeof complete == 'undefined' ? true : complete;

	var
		_this = this,
		winningPlayer = this.leadingPlayer(),
		updatedRanks = [];

	if (!complete) {
		io.sockets.emit('game.reset');
		return this.reset();
	}


	if (winningPlayer - 1 === 0) {
		updatedRanks = [elo.players[0].winningLeaderboardRank, elo.players[1].losingLeaderboardRank];
	} else {
		updatedRanks = [elo.players[0].losingLeaderboardRank, elo.players[1].winningLeaderboardRank];
	}

	io.sockets.emit('game.message', {
		message: '<span class="player-0">' + players[0].get('name') + '</span> is now rank ' + updatedRanks[0] + ', <span class="player-1">' + players[1].get('name') + '</span> is rank ' + updatedRanks[1]
	});

	io.sockets.emit('game.end', {
		winner: winningPlayer - 1
	});

	this.setPlayersForRematch(players.reverse());
	setTimeout(function () {
		_this.setPlayersForRematch([]);
		io.sockets.emit('game.reset');
	}, settings.winningViewDuration + 200);

	gameModel.set({
		winner_id: players[winningPlayer - 1].id,
		player0_score: game.score[0],
		player1_score: game.score[1],
		score_delta: Math.abs(game.score[0] - game.score[1])
	});

	// Add the game to the DB
	gameModel.save()
		.then(function () {
			stats.emit('game.end');
			_this.reset();
		});

	players.forEach(function (player, i) {
        console.log('writing elo for player: ' + player.id + " winningPlayer=" + winningPlayer);
        // elo only supports two players
        if (i < 2)
        {
			if (i === winningPlayer - 1) {
				player.set('elo', elo.players[i].winningRank);
			} else {
				player.set('elo', elo.players[i].losingRank);
			}
        }

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
    var positionId = data - 1;
    if(this.isReadyForRematch()) {
        playersForRematch = this.getPlayersForRematch();
        this.setPlayersForRematch([]);

        console.log(chalk.green('starting rematch after some delay..'));
        io.sockets.emit('player.rematch');
        // has to happen after the game was fully ended as dashboard would be shown again
        setTimeout(function() { 
            async.eachSeries(playersForRematch, function (player, cb) {
                console.log('for rematch adding player with id: '+player.id + ' name: ' + player.get('name'));
                // async.eachSeries forces sequential adding of players so the fetch promise and its asynchronousness does not break the order of players
                game.addPlayer(player.id, null, cb);
            });
        }, settings.winningViewDuration + 300);
    } else { 
        this.feelers[positionId].emit('score');
    }
};

/**
 * The game is ready – two players have joined, but not yet started
 */
gameController.prototype.ready = function () {

	gameModel = new Game();

	gameModel.set({
		player0_id: players[0].get('id'),
		player1_id: players[1].get('id')
	});

	leaderboard.get().then(function (leaderboard) {
		elo.setLeaderboard(leaderboard);
	});

	// Find the last game between the players
	Game.lastBetweenPlayers([players[0].get('id'), players[1].get('id')])
		.fetch()
		.then(function (game) {

			if (game) {

				var lastGame = [];

				lastGame.push({
					player: players[0].toJSON(),
					score: undefined
				});

				lastGame.push({
					player: players[1].toJSON(),
					score: undefined
				});

				if (game.get('player0_id') === players[0].get('id')) {
					lastGame[0].score = game.get('player0_score');
					lastGame[1].score = game.get('player1_score');
				}

				if (game.get('player0_id') === players[1].get('id')) {
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
	Player.headToHead(players[0].get('id'), players[1].get('id')).then(function (scores) {
		io.sockets.emit('stats.headToHead', {
			headToHead: scores
		});
	});

};


/**
 * Start the game
 */
gameController.prototype.start = function (startingServe) {

	if (!game.minPlayersAdded()) {
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
gameController.prototype.scored = function (event) {

	var player = event.data;
	var playerID = player - 1;
	// in 3 or 4 players game the 2nd player of the team should the first time so the dashboard order agrees with the order at the table

	if (!game.inProgress) {
		// Game not started, try to start...
		if (!game.start(player+1)) {
			// Could not start, wait...
			return;
		}
	}

	game.score[playerID]++;

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

	if (game.nextPointWins() && game.leadingPlayer() - 1 == playerID) {
		io.sockets.emit('game.gamePoint', {
			player: playerID
		});
	} else {
		io.sockets.emit('game.notGamePoint', {
			player: game.leadingPlayer() - 1,
		});
	}

	// Has anybody won?
	if (game.checkWon()) {
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
gameController.prototype.pointRemoved = function (event) {

	if (!game.inProgress) return;

	var playerID = event.data - 1;

	if (game.score[playerID] > 0) {

		game.score[playerID]--;

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

		if (game.checkWon()) {
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
gameController.prototype.checkWon = function () {

	var
		playerReachedMaxScore = game.score[0] >= settings.maxScore || game.score[1] >= settings.maxScore,
		playerReachedScoreClearance = Math.abs(game.score[0] - game.score[1]) >= settings.mustWinBy;

	if (playerReachedMaxScore && playerReachedScoreClearance) {
		game.end();
		return true;
	}

	return false;

};

/**
 * determines the next player given the inputs
 * if in 3 player mode it will give you the "phantom" player with id=3
**/
gameController.prototype.getNextServer = function(players, lastServer, startingPlayer) {
    // this calculation also covers the serving in a 3 players game, in this case the code we still have to assume it's a 4 players game
    modifiedPlayerCount = (players.length + players.length%2);

    return ( ( lastServer + (startingPlayer%2 == 0 ? 1 : -1) ) + modifiedPlayerCount ) % modifiedPlayerCount;
}

/**
 * Is it time to switch servers?
 */
gameController.prototype.checkServerSwitch = function(forceServe) {

    var
        _this = this,
        totalScore = this.score[0] + this.score[1],
        pointJustCancelled = this.gameHistory.length > 0 && this.gameHistory[0].action === 'cancelPoint',
        switchServer = totalScore % settings.serverSwitchLimit === 0 || this.serverSwitchThresholdMet() || typeof forceServe !== 'undefined',
        switchPreviousServer = (totalScore + 1) % settings.serverSwitchLimit === 0 && pointJustCancelled;
    
    if(switchServer || switchPreviousServer) {
  
        if(typeof forceServe !== 'undefined') {
            this.startingPlayer = serve = forceServe;
        } else if(this.score[0] > 0 || this.score[1] > 0) {
			serve = this.getNextServer(players, serve, this.startingPlayer);
            // A point was just cancelled, switch to previous server
            if(switchPreviousServer) {
                serve = serve;
            }
        }

		nextServer = this.getNextServer(players, serve, this.startingPlayer);
        // in a 3 players game serve can be the virtual 4th player, in this case we have to change it to the single player (seve = 1)
        realServe = serve >= players.length ? serve - 2 : serve;
		realNextServer = nextServer >= players.length ? nextServer -2 : nextServer;

        this.gameHistory.unshift({
            action: 'switchServers',
            server: realServe,
            score: this.score.slice()
        });

        io.sockets.emit('game.switchServer', {
            player: realServe,
			nextServer: realNextServer
        });
        
    }
};


/**
 * Have both of the players reached the server switch threshold?
 * (the point at which service changes on each score)
 */
gameController.prototype.serverSwitchThresholdMet = function () {
	return this.score.every(function (score) {
		return score >= settings.serverSwitchThreshold;
	});
};


/**
 * Returns the ID of the leading player
 */
gameController.prototype.leadingPlayer = function () {
	var greatestScore = Math.max.apply(Math, this.score);
	return this.score.indexOf(greatestScore) + 1;
};


/**
 * Is the specified player currently playing?
 */
gameController.prototype.playerInGame = function (playerID) {
	return players.some(function (player) {
		return player.id == playerID;
	});
};


/**
 * Have the minimum quantity of players been added?
 */
gameController.prototype.minPlayersAdded = function () {
	return players.length >= settings.minPlayers;
};


/**
 * Could the game end within one point?
 */
gameController.prototype.nextPointWins = function () {

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
gameController.prototype.checkGamePoint = function () {

	if (!this.nextPointWins()) return;

	var _this = this;

	io.sockets.emit('game.nextPointWins', {
		player: _this.leadingPlayer() - 1
	});

	if (this.leadingPlayer() == 1) {
		io.sockets.emit("nextPointWins", {"player": 1});
		console.log('Next point for player 1 wins');
	}

	if (this.leadingPlayer() == 2) {
		io.sockets.emit("nextPointWins", {"player": 2});
		console.log('Next point for player 2 wins');
	}

};


/**
 * Spark core has sent a batter low event; notify
 * the client
 */
gameController.prototype.batteryLow = function () {
	io.sockets.emit('core.batteryLow');
};


/**
 * Ping received from feelers
 */
var debounceFeelers = debounce(function () {
	io.sockets.emit('feelers.disconnect');
	debounceFeelers();
}, settings.feelers.pingInterval + settings.feelers.pingThreshold);

gameController.prototype.feelersPingReceived = function () {
	io.sockets.emit('feelers.connect');
	debounceFeelers();
};


/**
 * Send current game status to all clients
 */
gameController.prototype.updateStatus = function () {
	var stats = {
		online: this.online
	};
	io.sockets.emit("stats", stats);
};


/**
 * Client Joined
 */
gameController.prototype.clientJoined = function () {
	stats.emit('client.join');
};


gameController.prototype.setPlayersForRematch = function (players) {
	console.log('setting rematch players to'+[players]);
	this.playersForRematch = players;
};

gameController.prototype.isReadyForRematch = function () {
	console.log('ready for rematch=' + this.playersForRematch.length > 0);
	return this.playersForRematch.length > 0;
};

gameController.prototype.getPlayersForRematch = function () {
	console.log('players for rematch=' + [this.playersForRematch]);
	return this.playersForRematch;
};
