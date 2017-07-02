'use strict';




exports.up = function(knex, Promise) {
    return knex.schema
        .table('players', function(table){
            table.float('trueSkill_sigma').defaultTo(8.33).after('gender');
        })
        .table('players', function(table){
            table.float('trueSkill_mu').defaultTo(25).after('gender');
        })
        .table('players', function(table){
            table.dropColumn('elo');
        })
};




exports.down = function(knex, Promise) {
    return knex.schema
        .table('players', function(table){
            table.integer('elo').defaultTo(0);
        })
        .table('players', function(table){
            table.dropColumn('trueSkill_mu');
        })
        .table('players', function(table){
            table.dropColumn('trueSkill_sigma');
        })
};
