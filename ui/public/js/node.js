var
    config = window.config,
    node = new nodeController;

module.exports = node;

$(function() {
    node.start();    
});

function nodeController(options) {
    
    var _this = this;
    
    this.server = config.wsUrl;
    this.connected = true;
    this.disconnectAttempt = false;
    
    // Map left and right arrow keys to score events
    // Map left and right arrow keys to score events
    $(window).on('keyup', function(e) {
        var playerKeys = { 37: 1, 39: 2 };
        if(typeof playerKeys[e.keyCode] !== 'undefined') {
            _this.socket.emit('fakeScored', { data: playerKeys[e.keyCode] });
        }
    });
    
}

// Housekeeping
// -------------------------

// Attempt to connect to nodejs server
nodeController.prototype.start = function() {    

    // Is our nodejs server up yet?
    if(typeof io !== 'undefined') {
        this.socket = io.connect(this.server);
    } else {
        this.handleDisconnect();
    }
}

// Our connection to the server has been lost, we need to keep 
// trying to get it back until we have it!
nodeController.prototype.handleDisconnect = function(destroySocketObject) {

    var _this = this;

    if(destroySocketObject === undefined)
        destroySocketObject = true;

    if(this.disconnectAttempt) return;

    this.disconnectAttempt = true;

    this.connected = false;

    // Destroy any cached io object before requesting the script again
    if(destroySocketObject)
        io = undefined;

    // Attempt to remove any other scripts
    $('#nodejs_loader').remove();

    // Add the socketio script tags to body to attempt
    // to load it again
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = config.wsUrl + "/socket.io/socket.io.js";
    script.setAttribute("id", "nodejs_loader");
    document.body.appendChild(script);
    
    setTimeout(function() {            
        // Did it actually download the script OK?
        if(typeof io !== 'undefined') {
            _this.disconnectAttempt = false;
            _this.socket = io.connect(node.server, {'force new connection': true});
            _this.connected = true;
        } else {
            // God dammit it failed, lets wait 5 seconds and then try again
            setTimeout(function() {
                _this.disconnectAttempt = false;
                _this.handleDisconnect(false);
            }, 5000);
        }
    }, 2000);
}
