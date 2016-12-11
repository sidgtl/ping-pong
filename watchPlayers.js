var
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    request = require('request'),
    es = require('event-stream'),
    async = require('async'),
    slug = require('slug'),
    gutil = require('gulp-util');

interval = 1000;

gutil.log('updating sounds...');
var playersJson = undefined;

async.forever(
	function(next) {
		watchPlayers(
			function() {
				setTimeout(function() {
					next();
				}, interval)
			}, 
			function() {
				updateSounds(function(err,stdout,stderr) { 
					gutil.log('finished updating sounds');
					setTimeout(function() {
						next();
					}, interval);
				});
			}
		);
	},
	function(err) {
		gutil.log('error: ' + error);
		process.exit();
	}
);

function watchPlayers(loopCb, cbOnUpdate) {
	var Player = require('./models/Player');
	Player.fetchAll().then(function(players) { 
		currentPlayersJson = JSON.stringify(players.toJSON());

		//console.log(currentPlayersJson + ' vs: ' + playersJson);
		if(currentPlayersJson != playersJson) {
			playersJson = currentPlayersJson;
			gutil.log('change in player DB detected, retriggering sound building process...');
			cbOnUpdate();
			return;
		}
		loopCb();
	}); 
}

function updateSounds(cb) {
    var
        Player = require('./models/Player'),
        scoreRange = [0, 40],
        announcements = [],
        downloads = [];
    announcements = [
        function(player) {
            return player + ' to serve';
        },
        function(player) {
            return 'Game point, ' + player;
        },
        function(player) {
            return player + ' won the game!';
        }
    ];
    

	async.parallel([

        function(cb) {
            Player.fetchAll().then(function(players) {
                async.each(players.toJSON(), function(player, cb) {
                    fetchAnnouncements(player.name, function(res) {
                        if(res.writable) {
                            gutil.log("pushing announcements for " + player.name + " to download queue..");
                            downloads.push(res);
                        }
                        cb();
                    });
                }, cb);
            });
        },

        function(cb) {
            var
                i = 0,
                incomplete = function() {
                    return i < scoreRange[1];
                };

            async.whilst(incomplete, function(cb) {
                i ++;
                getTTS(i, 'en-US', function(res) {
                    if(res.writable) {
                        gutil.log("pushing tts of " + i + " to download queue");
                        downloads.push(res);
                    }
                    cb();
                });
            }, cb);
        }

    ], function() {
		async.parallel([
			function(cb) {
		        var updateSprite = exec.bind(undefined, 'audiosprite --format howler --path build/ --output ui/public/build/sprite --export mp3 ui/public/sounds/*.mp3 ui/public/sounds/*.wav', function(err,stdout,stderr) { 
					if(err) {
						gutil.log(err);
					}
					if(stdout) {
				        gutil.log(stdout);
				    }
					if(stderr) {
						gutil.log(stderr);
				    }
					cb();
				});
		
		        gutil.log("updating sprite...");
		        if(downloads.length > 0) {
		            return es.merge.apply(undefined, downloads).on('end', function() {
			            updateSprite();
		            });
		        }
		
		        updateSprite();
			}
		], cb);
    });

    function fetchAnnouncements(player, cb) {
        async.each(announcements, function(announcement, cb) {
            announcement = announcement(player);
            getTTS(announcement, 'en-US', cb);
        }, cb);
    }
}

function getTTS(phrase, language, cb) {

    language = language || 'en-gb';

    var
        requestURL = 'http://api.voicerss.org/?key=9b6c5034dfc14589807fa9969d7ecea4&hl=' + language + '&f=16khz_16bit_stereo&src=' + phrase,
        fileName = slug(phrase).toLowerCase() + '.mp3',
        filePath = path.join('./ui/public/sounds/', fileName),
        res = true;

    fs.exists(filePath, function(exists) {
        if(!exists) {
            gutil.log("does not exist, building res from url="+requestURL);
            res = request(requestURL);
            res.on('response', function(response) {
                gutil.log("downloaded "+requestURL+", status code=" + response.statusCode + " content-type: " + response.headers['content-type'] + " length:" + response.headers['content-length'])
                if(response.headers['content-type'] == "audio/mpeg" && response.headers['content-length'] > 0) {
                    response.pipe(fs.createWriteStream(filePath));
                } else {
                    gutil.log("problem, see above, not saving it");
                }
            });
        }
        cb(res);
    });

}



