/**
 * Here we create an Express app instance that can
 * be required in various places.
 */

var
    config = require('./config')[process.env.NODE_ENV],
    express = require('express'),
    cors = require('cors')
    knex = require('knex')(config.database),
    bookshelf = require('bookshelf')(knex);
    app = module.exports = express();

app.use(cors());
app.set('bookshelf', bookshelf);