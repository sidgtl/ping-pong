var
    events = require('events'),
    util = require('util'),
    config = require('../config.js');



module.exports = function() {
    return this instanceof FeelerController
        ? FeelerController
        : new FeelerController;
};



/**
 * Feeler Controller
 */
function FeelerController(data) {
    this.scoreRegisteredWithinThreshold = false;
    this.timer;
    this.on('press', this.counter);
};

util.inherits(FeelerController, events.EventEmitter);



/**
 * Counter
 */
FeelerController.prototype.counter = function() {
    
    var _this = this;
    
    if(this.scoreRegisteredWithinThreshold) {
        
        // Feeler pressed within threshold - undo
        
        this.emit('removePoint');
        this.scoreRegisteredWithinThreshold = false;
        
        return clearTimeout(_this.timer);
        
    }
    
    // Feeler pressed after threshold elapsed - score
    
    this.emit('score');
    this.scoreRegisteredWithinThreshold = true;
    
    this.timer = setTimeout(function() {
        _this.scoreRegisteredWithinThreshold = false;
    }, config.global.feelers.undoThreshold);
    
};