var
    util = require('util'),
    events = require('events'),
    EventEmitter = events.EventEmitter,
    emitter = new events.EventEmitter(),
    net = require('net'),
    chalk = require('chalk'),
    debounce = require('debounce'),
    config = require('../config')[process.env.NODE_ENV],
    settings = require('../config').global,
    connected = false,
    server,
    cardReader;



function CardReader() {
}

util.inherits(CardReader, EventEmitter);



CardReader.prototype.connectionStatus = function() {
    if(connected) {
        return this.emit('connect');
    }
    this.emit('disconnect');
};



cardReader = new CardReader();
module.exports = cardReader;



/**
 * Create the card reader server
 */
server = net.createServer(function(socket) {
    
    socket.setEncoding();

    socket.on('data', function(data) {

        data = data.split(':');

        var
            tableId,
            rfid;

        if(data.length !== 2) {
            return cardReadError();
        }
        
        if(!data[1].match(/^[a-z0-9]+$/i)) {
            return cardReadError();
        }
        
        if(data[1] == 'online') {
            return cardReaderPing();
        }

        tableId = data[0];
        rfid = data[1];

        cardReader.emit('read', {
            rfid: rfid
        });
        
    });
    
});



/**
 * Begin listening for events 
 */
server.listen(config.cardReaderPort, function() {
    console.log(chalk.green('Card Reader: Listening on port ' + config.cardReaderPort));
});



/**
 * Card reader error event
 */
function cardReadError() {
    CardReader.emit('err');
}




/**
 * Card reader `online` ping received
 */
function cardReaderPing() {
    debouncePing();
    if(!connected) {
        connected = true;
        cardReader.emit('connect');
    }
}



/**
 * Debounce the card readers online ping in order to
 * throw a `disconnect` event should a ping not be
 * received for a given period.
 */
var debouncePing = debounce(function() {
    connected = false;
    cardReader.emit('disconnect');
    debouncePing();
}, settings.cardReader.pingInterval + settings.cardReader.pingThreshold);