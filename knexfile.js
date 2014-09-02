var config = require('./config.js');

module.exports = {
  development: {
    client: config.development.database.client,
    connection: config.development.database.connection,
    migrations: config.development.database.migrations
  }
};