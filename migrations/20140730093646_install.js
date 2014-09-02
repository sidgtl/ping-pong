'use strict';




exports.up = function(knex, Promise) {
  
    return knex.schema
    
        .createTable('players', function(table) {
            table.increments('id').primary();
            table.string('rfid');
            table.string('name');
            table.enu('gender', ['male', 'female']);
            table.string('uri');
            table.integer('elo').defaultTo(0);
            table.string('image');
            table.integer('play_count').defaultTo(0);
            table.timestamps();
        })
        
        .createTable('games', function(table) {
            table.increments('id').primary();
            table.integer('player0_id').unsigned().references('players.id');
            table.integer('player1_id').unsigned().references('players.id');
            table.dateTime('start');
            table.dateTime('end');
            table.integer('duration');
            table.integer('player0_score');
            table.integer('player1_score');
            table.integer('score_delta');
            table.integer('winner_id').unsigned().references('players.id');
        });
  
};




exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('games')
    .dropTable('players');
};
