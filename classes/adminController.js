var
	chalk = require('chalk'),
	debounce = require('debounce'),
	app = require('../app'),
	settings = app.get('settings'),
	Game = require('../models/Game'),
	Player = require('../models/Player'),
	admin = require('../lib/admin'),
	leaderboard = require('../lib/leaderboard'),
	players = [];



module.exports = adminController;



function adminController() {

	this.players = [];

	admin.on('allPlayers', function(players) {
		io.sockets.emit('admin.allPlayers', players);
	});

}



/**
 * Get all players
 */
adminController.prototype.adminShown = function() {
	admin.emit('admin.shown');
};
