var
	EventEmitter = require('events').EventEmitter,
	app = require('../app'),
	bookshelf = app.get('bookshelf'),
	events = new EventEmitter();



module.exports = events;



events.on('admin.shown', allPlayers);



/**
 * Get all players
 */
function allPlayers() {

	bookshelf.knex
		.select('*')
		.from('players')
		.then(function(players) {
			events.emit('allPlayers', players);
		});

}