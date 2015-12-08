'use strict';

exports.up = function(knex, Promise) {
  return knex.schema
    .table('players', function(table) {
      table.integer('elo_cache').defaultTo(0);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('players', function(table) {
      table.dropColumn('elo_cache');
    });
};
