/**
 * @jsx React.DOM
 */
'use strict';



var
    React = require('react'),
    ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup'),
    node = require('../js/node');


    
var PlayerComponent = module.exports = React.createClass({



    getInitialState: function() {
        return {
            name: '',
            score: 0,
            image: false
            image_winning: false,
            win: false,
            gamePoint: false,
            gamePointVisible: true
        };
    },



    componentDidMount: function() {
        
        var
            _this = this;

        this.props.players.map(function(player) {
            player.on('change', function(player) {
				_this.join(player);
			});
        });
        
        node.socket.on('game.score', function(data) {
            if(data.player % 2 == _this.props.positionId) {
                _this.score(data.score);
            }
        });
        
        node.socket.on('game.gamePoint', function(data) {
            if(data.player % 2 == _this.props.positionId) {
                _this.gamePoint();
            } else {
                _this.gamePoint(false);
            }
        });
        
        node.socket.on('game.notGamePoint', function() {
            _this.gamePoint(false);
        });
        
        node.socket.on('game.cancelPoint', function(data) {
            if(data.player % 2 == _this.props.positionId) {
                _this.cancelPoint(data.score);
            }
        });

        node.socket.on('game.end', function(data) {
            if(data.winner % 2 == _this.props.positionId) {
                return _this.win();
            }
            _this.lose();
        });

        node.socket.on('game.reset', function() {
            setTimeout(_this.reset, 1500);
        });

    },



    join: function(player) {
        this.setState({
            name: player.name,
            image: player.image
        });
    },
    
    
    
    score: function(score) {
        this.setState({
            score: score
        });
    },
    
    
    
    cancelPoint: function(score) {
        this.setState({
            score: score
        });
    },
    
    
    
    gamePoint: function(isGamePoint) {
        
        var _this = this;
        
        isGamePoint = typeof isGamePoint === 'undefined' ? true : isGamePoint;
        
        if(isGamePoint) {
        
            this.setState({
                gamePoint: true
            });
            
            if(typeof _this.pulse === 'undefined') {
                this.pulse = setInterval(function() {
                    if(_this.props.server % 2 == _this.props.positionId) {
                        _this.setState({
                            gamePointVisible: !_this.state.gamePointVisible
                        });
                    }
                }, 900);
            }
            
        } else {
            
            this.setState({
                gamePoint: false,
                gamePointVisible: true
            });
            
            clearTimeout(_this.pulse);
            _this.pulse = undefined;
            
        }
        
    },
    
    
    
    win: function() {
        
        this.gamePoint(false);
        
        this.setState({
            win: true,
            serving: false
        });
        
    },
    
    
    
    lose: function() {
        
        this.gamePoint(false);
        
        this.setState({
            win: false,
            serving: false
        });
        
    },



    reset: function() {
        this.gamePoint(false);
        this.replaceState(this.getInitialState());
    },
    
    getPlayerOrder: function(a, b, _this) {
        return (!( typeof _this.props.server !== 'undefined' && typeof _this.props.nextServer !== 'undefined') ||
        ( typeof _this.props.server !== 'undefined' && typeof _this.props.nextServer !== 'undefined'
            && _this.props.players[_this.props.nextServer].name != a.name && _this.props.players[_this.props.server].name
            != a.name
        )) ? -1 : 1;
    },
    
    render: function() {

        var
			_this = this,
            playerClasses,
            style = {},
            status,
            statusClasses = 'status status--serving',
            gamePoint,
            gamePointClasses = 'status status--game-point',
            details,
            winner;

        if(!this.state.name && typeof this.props.players[this.props.positionId] !== 'undefined' && this.props.players[this.props.positionId].image) {
            style = {
                'background-image':
                    this.props.players
                        .filter(function(v,i) {return i%2 == _this.props.positionId })
                        .sort(function(a,v) { return _this.getPlayerOrder(a, v, _this); })
                        .map(function(v) { return 'url(' + v.image + ')'; })
                        .join(', '),
                'background-position':
                    this.props.players
                        .filter(function(v,i) {return i%2 == _this.props.positionId })
                        .length > 1 ? 'bottom left, bottom right' : ''
            }
        }

		if(this.state.win) {
            style = {
                'background-image':
                    this.props.players
                        .filter(function(v,i) {return i%2 == _this.props.positionId })
                        .sort(function(a,v) { return _this.getPlayerOrder(a, v, _this); })
                        .map(function(v) { return 'url(' + v.image_winning + ')'; })
                        .join(', '),
                'background-position':
                    this.props.players
                        .filter(function(v,i) {return i%2 == _this.props.positionId })
                        .length > 1 ? 'bottom left, bottom right' : ''
            }
		}

        playerClasses = 'player player_' + this.props.positionId;

        if(this.props.server % 2 == this.props.positionId && !this.state.win) {
            status = <div className={statusClasses}>{this.props.players[this.props.server].name}</div>;
        }
        
        if(this.state.win && !this.state.lose) {
            playerClasses += ' win';
        }
        
        if(this.state.lose) {
            playerClasses += 'loses';
        }
        
        if(!this.state.win) {
            details = (
                <div className='details'>
                    <div className='score'>{this.state.score}</div>
                    <div className='name'>{(this.props.players.length && this.props.players
                        .filter(function(v,i) {return i%2 == _this.props.positionId })
                        .sort(function(a,v) { return _this.getPlayerOrder(a, v, _this); })
                        .map(function(v) { return v.name; })
                        .join(' & ')) || 'Add player'}</div>
                </div>
            );
        }
        
        if(this.state.gamePointVisible) {
            gamePointClasses += ' status--visible';
        } else {
            gamePointClasses += ' status--hidden';
        }
        
        if(this.state.gamePoint && !this.state.win) {
            gamePoint = <div className={gamePointClasses}>Game Point</div>;
        }
        
        if(this.state.win) {
            winner = (
                <div className='winner'>{this.props.players.filter(function(v,i){return i%2 == _this.props.positionId;}).map(function(v) { return v.name; }).join(' & ')} {this.props.players.length > 2 ? 'win' : 'wins'}</div>
            );
        }

        return (
            <div className={playerClasses} style={style}>
                <div className='status'></div>
                {status}
                {gamePoint}
                {details}
                <ReactCSSTransitionGroup transitionName='winner-announcement'>
                    {winner}
                </ReactCSSTransitionGroup>
            </div>
        );

    }
    

    
});
