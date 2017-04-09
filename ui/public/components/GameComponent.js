/**
 * @jsx React.DOM
 */
'use strict';

var
    React = require('react'),
    AmpersandState = require('ampersand-state'),
	slug = require('slug'),
    config = window.config,
    node = require('../js/node'),
    AdminComponent = require('./AdminComponent'),
    PlayerComponent = require('./PlayerComponent'),
    StatusComponent = require('./StatusComponent'),
    StatusIndicatorComponent = require('./StatusIndicatorComponent'),
    StatsComponent = require('./StatsComponent'),
    soundPath = '/sounds/',
    PlayerModel,
    playerProps,
	soundQueue = [],
	soundsPlaying = false,
    players = [];

// The beginnings of a model for sharing state between components
playerProps = {
    name: 'string',
    image: 'string'
};

PlayerModel = AmpersandState.extend({
    props: playerProps
});



var GameComponent = module.exports = React.createClass({




    getInitialState: function() {
        return {
            server: undefined,
            winner: undefined,
            score: [0, 0],
            table: undefined,
            cardReader: undefined
        };
    },



    componentDidMount: function() {

        var _this = this;

        node.socket.on('game.end', _this.end);
        node.socket.on('game.score', _this.score);
        node.socket.on('game.reset', _this.reset);
        node.socket.on('game.gamePoint', _this.gamePoint);

        node.socket.on('game.switchServer', function(data) {
            _this.switchServer(data.player, data.nextServer);
        });

        node.socket.on('feelers.disconnect', _this.tableDisconnected);
        node.socket.on('feelers.connect', _this.tableConnected);
        node.socket.on('core.batteryLow', _this.tableBatteryLow);

        node.socket.on('cardReader.connect', _this.cardReaderConnected);
        node.socket.on('cardReader.disconnect', _this.cardReaderDisconnected);

        node.socket.on('player.join', function(data) {
            console.log(['player.join', data.player.name]);
            players[data.position] = new PlayerModel();
			players[data.position].set(data.player);
        });

        node.socket.on('player.rematch', function() {
			console.log('received rematch event');	
            _this.rematch();
        });

    },


    rematch: function() {
		//this.queueSound('proceed');
    },
    

    switchServer: function(player, nextServer) {

        var
            _this = this,
            playerSound = '';

        this.setState({
            server: player
        });
        
		this.setState({
            nextServer: nextServer
        });

        playerSound = players[player].name;

		// cut down the delay between "player X to serve" and the score announcement by 500 ms
		this.queueSound(slug(playerSound.toLowerCase()) + '-to-serve', -500);
    },



    score: function(data) {

        var _this = this;

        this.setState({
            score: data.gameScore
        });

//	this.queueSound('scored');

        // This is really counterintuitive, and far from a permanent
        // solution. This small delay allows us to cancel the score
        // announcement. For example, when a service change occurs,
        // we want to defer the score announcement to after the
        // service change announcement.
        setTimeout(function() {
            _this.announceScore();
        }, 500);

    },



    gamePoint: function(data) {

        var
            player = data.player,
            playerSound,
	    _this = this;


	// delayed so it happens after the score announcements
	setTimeout(function() {
		// if winner is clear already don't say game point again
		if(typeof _this.state.winner === 'undefined') {
        		playerSound = players[player].name;
	        	_this.queueSound('game-point-' + slug(playerSound.toLowerCase()));
		}
	}, 600);
    },



    announceScore: function() {

        var announcement = this.state.score;
		var _this = this;
        
        if(typeof this.state.winner === 'undefined' && (announcement[0] > 0 || announcement[1] > 0) ) {
            // Announce the server's score first
            if(this.state.server == 1) {
                announcement.reverse();
            }

			// cut down the delay between the score announcements of the two sides
			this.queueSound('' + announcement[0], -500);
			this.queueSound('' + announcement[1]);
        }

    },



    end: function(data) {

        var
            _this = this,
            playerSound = '';
        
	this.resetQueue();

        this.setState({ winner: data.winner });

        this.queueSound('game_end');

	this.queueSound(data.winner % 2 == 0 ? 'blue-team-dominating' : 'red-team-dominating');
    },

    resetQueue: function() {
		soundQueue = [];
	},
	
    queueSound: function(sound, offset, cb) {
        soundQueue.push({
            name: sound,
            offsetNext: typeof offset === 'undefined' ? 0 : offset,
            cb: cb
        });
        this.playQueue();
    },

    playQueue: function() {

        var
            _this = this,
            play;

        if(soundsPlaying) {
            return;
        }

        soundsPlaying = true;

        play = function() {

            var
                sound = {},
                offset = 0;

            if(soundQueue.length > 0) {
                sound = soundQueue.shift();
				var audio = new Audio(soundPath + sound.name + ".wav");
				audio.addEventListener('loadedmetadata', function() {
	                var duration = audio.duration;
	                offset = sound.offsetNext ? duration*1000 + sound.offsetNext : duration*1000;
	                audio.play();
					setTimeout(function() {
	                    play();
	                    if(sound.cb) {
	                        sound.cb();
	                    }
	                }, offset);
				});
            } else {
                soundsPlaying = false;
            }

        }

        play();

    },

    tableConnected: function() {
        this.setState({
            table: true
        });
    },



    tableDisconnected: function() {
        this.setState({
            table: false
        });
    },



    cardReaderConnected: function() {
        this.setState({
            cardReader: true
        });
    },



    cardReaderDisconnected: function() {
        this.setState({
            cardReader: false
        });
    },



    tableBatteryLow: function() {
        this.setState({
            table: 'warning'
        });
    },

    reset: function() {

        setTimeout(function() {
            players = [];
        }, 1500);

        this.replaceState(this.getInitialState());

    },



    render: function() {
        return (
            <div>
                <AdminComponent active='0' />
                <div className='player_container'>
                    <PlayerComponent positionId='0' players={players} server={this.state.server} winner={this.state.winner} nextServer={this.state.nextServer} />
                    <PlayerComponent positionId='1' players={players} server={this.state.server} winner={this.state.winner} nextServer={this.state.nextServer} />
                    <StatusComponent main='true' />
                </div>
                <StatsComponent players={players} server={this.state.server} score={this.state.score} />
                <div className='status-indicators'>
                    <StatusIndicatorComponent state={this.state.table} />
                    <StatusIndicatorComponent state={this.state.cardReader} />
                </div>
            </div>
        );
    }

});
