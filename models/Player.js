var
    Promise = require('bluebird'),
    through = require('through2'),
    chalk = require('chalk'),
    app = require('../app'),
    bookshelf = app.get('bookshelf'),
    Game = require('./Game'),
    Player;



Player = module.exports = bookshelf.Model.extend({
    
    
    
    tableName: 'players',
    
    
    
    games: function() {
        return Game
            .query('where', 'player0_id', '=', this.get('id'))
            .query('orWhere', 'player1_id', '=', this.get('id'));
    },
    
    
    
    gamesWith: function(id) {
        var _this = this;
        return this.games()
            .query('where', 'player0_id', '=', id)
            .query('orWhere', 'player1_id', '=', id);
        /*return Game
            .query(function(qb) {
                //qb.where('player0_id', '=', _this.get('id')).orWhere('player1_id', '=', this.get('id'));
                qb.where('player0_id', '=', _this.get('id')).andWhere('player1_id', '=', _this.get('id'));
            })
            .query(function(qb) {
                qb.orWhere('player1_id', '=', _this.get('id')).andWhere('player0_id', '=', _this.get('id'));
            });*/
        //return bookshelf.knex.select().table('games').where({
        //    player0_id: _this.get('id'),
        //    player1_id: id
        //}).orWhere({
        //    player1_id: _this.get('id'),
        //    player0_id: id
        //});
    },
    
    
    
    /*lastGameWith: function(id) {

        var
            _this = this,
            resolver = Promise.pending(),
            players = [
                {
                    player: this.toJSON(),
                    score: 0
                },
                {
                    player: undefined,
                    score: 0
                }
            ];
        
        this.gamesWith(id)
            .query('orderBy', 'end', 'desc')
            .query('limit', 1)
            .fetch()
            .then(function(game) {
                console.log(game);
                if(game) {
                    if(game.get('player0_id') === _this.get('id')) {
                        players[0].score = game.get('player0_score');
                        players[1].score = game.get('player1_score');
                    } else {
                        players[0].score = game.get('player1_score');
                        players[1].score = game.get('player0_score');
                    }
                    return resolver.resolve(players);
                }
                resolver.resolve();
            });
        
        return resolver.promise;
        
    },*/
    
    
    
    /*headToHead: function(id) {
        
        var
            _this = this,
            gamesResolver = Promise.pending(),
            games = this.gamesWith(id),
            playerPromise,
            scores = [0, 0],
            players = [
                {
                    player: this.toJSON(),
                    score: 0
                },
                {
                    player: undefined,
                    score: 0
                }
            ];
        
        games
            .fetchAll()
            .then(function(games) {
                games.forEach(function(game) {
                    if(game.get('winner_id') === _this.get('id')) {
                        scores[0] ++;
                    } else {
                        scores[1] ++;
                    }
                });
                gamesResolver.resolve(scores);
            });
        
        playerPromise = new Player({ id: id }).fetch();

        return Promise.join(playerPromise, gamesResolver.promise, function(player, scores) {
            
            players[1].player = player.toJSON();
            
            players[0].score = scores[0];
            players[1].score = scores[1];

            return players;
            
        });

    }*/



}, {
    
    
    
    headToHead: function(id0, id1) {
        
        var
            resolver = Promise.pending(),
            scores = [0, 0];
        
        bookshelf.knex
            .select('*')
            .from('games')
            .whereRaw('(player0_id = ? AND player1_id = ?) OR (player1_id = ? AND player0_id = ?)', [id0, id1, id0, id1])
            .stream(function(stream) {
                stream.pipe(through.obj(function(game, enc, cb) {
                    if(game.player0_id === id0) {
                        if(game.winner_id === id0) {
                            scores[0] ++;
                        } else {
                            scores[1] ++;
                        }
                    } else {
                        if(game.winner_id === id1) {
                            scores[1] ++;
                        } else {
                            scores[0] ++;
                        }
                    }
                    cb();
                }));
            })
            .then(function() {
                resolver.resolve(scores);
            });
        
        return resolver.promise;

    }



});