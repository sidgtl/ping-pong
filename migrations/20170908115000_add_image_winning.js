'use strict';




exports.up = function(knex, Promise) {
    return knex.schema
        .table('players', function(table){
            table.string('image_winning').after('image');
        })
};




exports.down = function(knex, Promise) {
    return knex.schema
        .table('players', function(table){
            table.dropColumn('image_winning');
        })
};
