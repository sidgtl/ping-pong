/**
 * @jsx React.DOM
 */
'use strict';



var
    React = require('react'),
    ReactCSSTransitionGroup = require('react/lib/ReactCSSTransitionGroup'),
    config = window.config,
    node = require('../js/node'),
    StatusComponent = require('./StatusComponent'),
    LeaderboardComponent = require('./leaderboard/LeaderboardComponent');


    
var StatsComponent = module.exports = React.createClass({


    getInitialState: function() {
        return {
            fullView: true,
            playersFirstGame: undefined,
            lastGame: undefined,
            winner: undefined,
            headToHead: undefined,
            biggestWinningStreak: undefined,
            mostConsecutiveLosses: undefined,
            largestWhooping: undefined,
            totalCompanyGames: undefined,
            mostFrequentPlayer: undefined
        };
    },



    componentDidMount: function() {

        var _this = this;

        node.socket.on('stats.lastGameBetweenPlayers', function(data) {
            _this.lastGameBetweenPlayers(data.lastGame);
        });
        
        node.socket.on('stats.headToHead', function(data) {
            _this.headToHead(data.headToHead);
        });
        
        node.socket.on('stats.biggestWinningStreak', function(streak) {
            _this.setState({ biggestWinningStreak: streak });
        });
        
        node.socket.on('stats.mostConsecutiveLosses', function(streak) {
            _this.setState({ mostConsecutiveLosses: streak });
        });
        
        node.socket.on('stats.largestWhooping', function(whooping) {
            _this.setState({ largestWhooping: whooping });
        });
        
        node.socket.on('stats.totalCompanyGames', function(count) {
            _this.setState({ totalCompanyGames: count });
        });
        
        node.socket.on('stats.mostFrequentPlayer', function(player) {
            _this.setState({ mostFrequentPlayer: player });
        });
        
        node.socket.on('leaderboard.hide', _this.showCompactView);
        node.socket.on('game.end', _this.end);
        node.socket.on('game.reset', _this.reset);
        
    },
    
    
    
    end: function(data) {
        this.setState({ winner: data.winner });
        setTimeout(this.showFullView, config.winningViewDuration);
    },
    
    
    
    showFullView: function() {
        this.setState({ fullView: true });
    },
    
    
    
    showCompactView: function() {
        this.setState({ fullView: false });
    },
    
    
    
    lastGameBetweenPlayers: function(lastGame) {
        this.setState({
            lastGame: lastGame
        });
    },
    
    
    
    headToHead: function(players) {
        this.setState({
            headToHead: players
        });
    },
    
    
    
    reset: function() {
        this.setState({
            fullView: true,
            lastGame: undefined,
            playersFirstGame: undefined,
            headToHead: undefined,
            winner: undefined
        });
    },
    
    
    
    render: function() {

        var
            classes = 'stats_container clearfix',
            score,
            headToHead,
            headToHeadScore,
            firstMatch,
            leaderboard,
            logo,
            mostFrequentPlayer,
            biggestWinningStreak,
            mostConsecutiveLosses,
            largestWhooping,
            totalCompanyGames,
            winner;

        if(!this.state.fullView) {
            classes += ' compact-view';
        }

        if(this.state.playersFirstGame) {
            firstMatch = <div className="stat_score">Players First Match</div>;
        }
        
        if(!this.state.fullView) {
            
            if(this.state.lastGame) {
                score = (
                    <div className="stats__component" key="last-game">
                        <span className="header stats__title">Last Game</span>
                        <div className="stat_score">
                            {this.state.lastGame[0].score}
                            <span className="stat_score_player">{this.state.lastGame[0].player.name}</span>
                        </div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">
                            {this.state.lastGame[1].score}
                            <span className="stat_score_player">{this.state.lastGame[1].player.name}</span>
                        </div>
                    </div>
                );
            } else if(typeof this.props.players[0] !== 'undefined' &&  typeof this.props.players[1] !== 'undefined') {
                score = (
                    <div className="stats__component" key="last-game">
                        <span className="header stats__title">Last Game</span>
                        <div className="stat_score">
                            0
                            <span className="stat_score_player">{this.props.players[0].name}</span>
                        </div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">
                            0
                            <span className="stat_score_player">{this.props.players[1].name}</span>
                        </div>
                    </div>
                );
            }
            
            if(typeof this.state.winner !== 'undefined') {
                score = (
                    <div className="stats__component" key="last-game">
                        <span className="header stats__title">Final Score</span>
                        <div className="stat_score">
                            {this.props.score[0]}
                            <span className="stat_score_player">{this.props.players[0].name}</span>
                        </div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">
                            {this.props.score[1]}
                            <span className="stat_score_player">{this.props.players[1].name}</span>
                        </div>
                    </div>
                );
            }
            
        }
        
        if( (!this.state.fullView && this.state.headToHead) || (!this.state.fullView && this.state.winner) ) {
            
            if(typeof this.state.headToHead !== 'undefined') {
                headToHeadScore = this.state.headToHead.slice();
            } else {
                headToHeadScore = [0, 0];
            }
            
            if(typeof this.state.winner !== 'undefined') {
                headToHeadScore[this.state.winner] = this.state.headToHead[this.state.winner] + 1;
            }
            
            headToHead = (
                <div></div>
                    /** first support 4 players
                <div className="stats__component" key="head-to-head">
                    <span className="header stats__title">Head To Head</span>
                    <div className="stat_score">
                        {headToHeadScore[0]}
                        <span className="stat_score_player">{this.props.players[0].name}</span>
                    </div>
                    <div className="stat_dash">-</div>
                    <div className="stat_score">
                        {headToHeadScore[1]}
                        <span className="stat_score_player">{this.props.players[1].name}</span>
                    </div>
                </div>*/
            );
            
        }

        if(this.state.fullView) {
            
            logo = <img className="stats__logo" src='img/logos/logo.svg' alt='Ping Pong' key='logo' />;
            
            leaderboard = (
                <div className="stats__component" key="leaderboard">
                    <span className="header stats__title">Leaderboard</span>
                    <LeaderboardComponent />
                </div>
            );
            
            if(typeof this.state.mostFrequentPlayer !== 'undefined') {
                mostFrequentPlayer = (
                    <div className="stats__component stats__component--pin-bottom" key="league-form-player">
                        <span className="header stats__title">Most Frequent Player</span>
                        <div className="stat_score">{this.state.mostFrequentPlayer}</div>
                    </div>
                );
            }
            
            if(typeof this.state.biggestWinningStreak !== 'undefined') {
                biggestWinningStreak = (
                    <div></div>
                    /** first needs 4 player support
                    <div className="stats__component stats__component--bordered" key="biggest-winning-streak">
                        <span className="header stats__title">Biggest Winning Streak</span>
                        <div className="stat_score">{this.state.biggestWinningStreak.player}</div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">{this.state.biggestWinningStreak.streak}</div>
                    </div>
                    */
                );
            }
            
            if(typeof this.state.mostConsecutiveLosses !== 'undefined') {
                mostConsecutiveLosses = (
                    <div></div>
                    /** first needs 4 player support
                    <div className="stats__component stats__component--bordered" key="most-consecutive-losses">
                        <span className="header stats__title">Most Consecutive Losses</span>
                        <div className="stat_score">{this.state.mostConsecutiveLosses.player}</div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">{this.state.mostConsecutiveLosses.streak}</div>
                    </div>
                    */
                );
            }
            
            if(typeof this.state.largestWhooping !== 'undefined') {
                largestWhooping = (
                    <div></div>
                    /** first needs 4 player support
                    <div className="stats__component stats__component--bordered" key="largest-whooping">
                        <span className="header stats__title">Largest Whooping</span>
                        <div className="stat_score">
                            {this.state.largestWhooping.scores[0]}
                            <span className="stat_score_player">{this.state.largestWhooping.players[0]}</span>
                        </div>
                        <div className="stat_dash">-</div>
                        <div className="stat_score">
                            {this.state.largestWhooping.scores[1]}
                            <span className="stat_score_player">{this.state.largestWhooping.players[1]}</span>
                        </div>
                    </div>
                    */
                );
            }
            
            if(typeof this.state.totalCompanyGames !== 'undefined') {
                totalCompanyGames = (
                    <div className="stats__component stats__component--pin-bottom" key="total-company-games">
                        <span className="header stats__title">Total Company Games</span>
                        <div className="stat_score">{this.state.totalCompanyGames}</div>
                    </div>
                );
            }
            
        }

        return (
            <div className={classes}>
                <StatusComponent mini='true' />
                <ReactCSSTransitionGroup transitionName='stats__logo'>
                    {logo}
                </ReactCSSTransitionGroup>
                <div className="stats__inner">
                    <span className="title">Stats</span>
                    <div className="stats_left stats">
                        <div className='stats__group'>
                            <ReactCSSTransitionGroup transitionName='stats__components'>
                                {firstMatch}
                                {score}
                            </ReactCSSTransitionGroup>
                        </div>
                        <div className='stats__group'>
                            <ReactCSSTransitionGroup transitionName='stats__components'>
                                {leaderboard}
                            </ReactCSSTransitionGroup>
                        </div>
                    </div>
                    <div className="stats_right stats">
                        <div className='stats__group'>
                            <ReactCSSTransitionGroup transitionName='stats__components'>
                                {firstMatch}
                                {headToHead}
                            </ReactCSSTransitionGroup>
                        </div>
                        <div className='stats__group'>
                            <ReactCSSTransitionGroup transitionName='stats__components'>
                                {biggestWinningStreak}
                                {mostConsecutiveLosses}
                                {largestWhooping}
                                {mostFrequentPlayer}
                            </ReactCSSTransitionGroup>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    

    
});