/**
 * @jsx React.DOM
 */
'use strict';



var
    React = require('react'),
    AmpersandState = require('ampersand-state'),
    Howl = require('howler').Howl,
    soundSprite = require('../build/sprite'),
    config = window.config,
    node = require('../js/node'),
    PlayerComponent = require('./PlayerComponent'),
    StatusComponent = require('./StatusComponent'),
    StatusIndicatorComponent = require('./StatusIndicatorComponent'),
    StatsComponent = require('./StatsComponent'),
    soundPath = config.clientUrl + '/sounds/',
    soundQueue = [],
    soundsPlaying = false,
    sounds,
    PlayerModel,
    playerProps,
    player0,
    player1;


// The beginnings of a model for sharing state between components
playerProps = {
    name: 'string',
    image: 'string'
};

PlayerModel = AmpersandState.extend({
    props: playerProps
});

player0 = new PlayerModel();
player1 = new PlayerModel();



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
        
        sounds = new Howl(soundSprite);
        
        node.socket.on('game.end', _this.end);
        //node.socket.on('game.score', _this.score);
        node.socket.on('game.reset', _this.reset);
        node.socket.on('game.gamePoint', _this.gamePoint);

        node.socket.on('game.score', function(data) {
            _this.score(data);
        });

        node.socket.on('game.switchServer', function(data) {
            _this.switchServer(data.player);
        });
        
        node.socket.on('feelers.disconnect', _this.tableDisconnected);
        node.socket.on('feelers.connect', _this.tableConnected);
        //node.socket.on('core.batteryLow', _this.tableBatteryLow);
        
        node.socket.on('cardReader.connect', _this.cardReaderConnected);
        node.socket.on('cardReader.disconnect', _this.cardReaderDisconnected);
        
        node.socket.on('player0.join', function(data) {
            player0.set(data.player);
        });
        
        node.socket.on('player1.join', function(data) {
            player1.set(data.player);
        });

    },



    switchServer: function(player) {
        console.log("switching server");
        var
            _this = this,
            playerSound = '';
        
        this.setState({
            server: player
        });

        if(player == 0) {
            playerSound = player0.name;
        }
        
        if(player == 1) {
            playerSound = player1.name;
        }

        this.queueSound(playerSound.toLowerCase() + '-to-serve');

    },
    
    
    
    score: function(data) {
        console.log("updating score and setting state");
        var _this = this;

        this.setState({
            score: data.gameScore
        });

        console.log("gameScore: " + data.gameScore);

        // This is really counterintuitive, and far from a permanent
        // solution. This small delay allows us to cancel the score
        // announcement. For example, when a service change occurs,
        // we want to defer the score announcement to after the
        // service change announcement.
        setTimeout(function() {
            _this.announceScore();
        }, 0);

    },



    gamePoint: function(data) {
        
        var
            player = data.player,
            playerSound;
        
        if(player == 0) {
            playerSound = player0.name;
        }
        
        if(player == 1) {
            playerSound = player1.name;
        }

        this.queueSound('game-point-' + playerSound.toLowerCase());
        
    },


    // temp comment out til sounds are working
    announceScore: function() {
/*
        var announcement = this.state.score;
        
        if(typeof this.state.winner === 'undefined' && announcement[0] > 0 || announcement[1] > 0) {
        
            // Announce the server's score first
            if(this.state.server == 1) {
                announcement.reverse();


            }

            this.queueSound('' + announcement[0], -300);
            this.queueSound('' + announcement[1]);

        }
*/
    },
    
    
    
    end: function(data) {
        
        var
            _this = this,
            playerSound = '';
        
        this.setState({ winner: data.winner });
        
        if(data.winner == 0) {
            playerSound = player0.name;
        }
        
        if(data.winner == 1) {
            playerSound = player1.name;
        }
        
        this.clearAudioQueue();
        sounds.play('game_end');
        
        setTimeout(function() {
            this.queueSound(playerSound.toLowerCase + '-won-the-game');
        }, 900);
        
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
                duration = 0,
                offset = 0;

            if(soundQueue.length > 0) {
                sound = soundQueue.shift();
                duration = soundSprite.sprite[sound.name][1];
                offset = sound.offsetNext ? duration + sound.offsetNext : duration;
                sounds.play(sound.name);
                setTimeout(function() {
                    play();
                    if(sound.cb) {
                        sound.cb();
                    }
                }, offset);
            } else {
                soundsPlaying = false;
            }

        }

        //play();

    },
    
    
    
    clearAudioQueue: function() {
        soundQueue = [];
    },



    reset: function() {
        console.log("reset");
        setTimeout(function() {
            for(var prop in playerProps) {
                player0.unset(prop);
                player1.unset(prop);
            }
        }, 1500);

        this.replaceState(this.getInitialState());

    },
    
    
    
    render: function() {
        return (
            <div>
                <div className='player_container'>
                    <PlayerComponent positionId='0' player={player0} server={this.state.server} winner={this.state.winner} />
                    <PlayerComponent positionId='1' player={player1} server={this.state.server} winner={this.state.winner} />
                    <StatusComponent main='true' />
                </div>
                <StatsComponent player0={player0} player1={player1} server={this.state.server} score={this.state.score} />
                <div className='status-indicators'>
                    <StatusIndicatorComponent state={this.state.table} />
                    <StatusIndicatorComponent state={this.state.cardReader} />
                </div>
            </div>
        );
    }
    

    
});