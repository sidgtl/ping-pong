var
    playing = [],
    list = {};

// THIS IS NOT IMPLEMENTED, PULLED FROM A PREVIOUS PROJECT
exports.addPlayer = function addPlayer(playerID) {

    console.log(playerID); return;
    
    // Have we already reached 2 players?
    if(this.playing.length >= 2) {
        game.reset();
    }

    this.playing.push(playerID);

    socket.emit("newPlayer", { 
        "name": player.list[playerID].name,
        "position": this.playing.length
    });

    console.log('New player', player.list[playerID].name);

    // Game ready to start?
    if(this.playing.length == 2) {

        game.inProgress = true;
        socket.emit("gameStart", {});

        console.log('Game Start', this.playing);
    }
};

/*playerController.prototype.setupPlayerList = function(playerList) {

    _.each(playerList, function(index) {

        console.log(index);
        player.list[index.id] = {
            "name": index.name
        }
    });
}

module.exports = playerController;*/