var
    config = require('../config'),
    HipChat = require('hipchat-notify'),
    configured = config.global.hipChat.accessToken && config.global.hipChat.room;

module.exports = configured ?
    new HipChat(config.global.hipChat.room, config.global.hipChat.accessToken) :
    null;
