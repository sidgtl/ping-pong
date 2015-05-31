var
    app = require('../app'),
    bookshelf = app.get('bookshelf'),
    datetimeFormat = 'YYYY-MM-DD HH:mm:ss',
    Player = require('./Player'),
    Game;



Game = module.exports = bookshelf.Model.extend({



    tableName: 'games',
    

    
    initialize: function() {
        
        var end;
        
        this.on('saving', function() {
            end = moment();
            this.set('end', end.format(datetimeFormat));
            this.set('duration', end.diff(this.start));
        });
        
    },
    
    
    
    start: function() {
        console.log("game is actually being started now");
        this.start = moment();
        this.set('start', this.start.format(datetimeFormat));
    },
    
    
    
    player0: function() {
        return this.belongsTo(Player, 'player0_id');
    },
    
    
        
    player1: function() {
        return this.belongsTo(Player, 'player1_id');
    }


    
}, {
    
    
    
   /**
    * Get the last game between two given players
    */
   lastBetweenPlayers: function(playerIds) {

       playerIds = playerIds;

       return this.query(function(qb) {
           qb
               .where(function() {
                   this.whereIn('player0_id', playerIds).andWhere('player1_id', playerIds[1]);
               })
               .orWhere(function() {
                   this.whereIn('player1_id', playerIds).andWhere('player0_id', playerIds[1]);
               });
       })
       .query('orderBy', 'end', 'desc');

   }


    
});