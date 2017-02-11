var
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    request = require('request'),
    es = require('event-stream'),
    async = require('async'),
    slug = require('slug'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    buffer = require('gulp-buffer'),
    rename = require('gulp-rename'),
    del = require('del'),
    rev = require('gulp-rev'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    uglifyify = require('uglifyify'),
    exorcist = require('exorcist'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    paths = {};



paths.public = './ui/public';
paths.css = paths.public + '/css';
paths.js = paths.public + '/js';
paths.build = paths.public + '/build';
paths.versions = './versions';



gulp.task('default', ['all'], function() {
    var watcher = gulp.watch(paths.css + '/**/*.less', ['css']);
});



gulp.task('main.js', function() {

    var bundle, watch;
    
    bundle = browserify({ cache: {}, packageCache: {}, fullPaths: true, debug: true });
    watch = watchify(bundle);
    
    bundle.transform({ global: true }, 'uglifyify');
    
    // Add  third party libs. We don't want Browserify to parse them because they
    // aren't setup to use Browserify - we'd just be wasting time.
    bundle.add(paths.js + '/third_party/typekit.js', { noparse: true });
    
    // Add the main.js file
	gutil.log("adding to bundle: "+paths.js + '/main.js');
    bundle.add(paths.js + '/main.js');

    bundle.transform('reactify');

    watch.on('update', rebundle);
        
    function rebundle() {
		gutil.log("rebundling...");
        cleanJS(function() {
			gutil.log("after deleting, now watching for changes..");
            return watch.bundle()
                .on('error', function(e) {
                    gutil.beep();
                    gutil.log(gutil.colors.red('Browserify Error'), e);
                })
                // Exorcist extracts Browserify's inline source map and moves it to an external file
                .pipe(exorcist(paths.build + '/main.js.map'))
                .pipe(source('main.js'))
                .pipe(buffer())
                .pipe(rev())
                .pipe(gulp.dest(paths.build))
                .pipe(rev.manifest())
                .pipe(rename('js.json'))
                .pipe(gulp.dest(paths.versions));
        });
    }

    
    return rebundle();
    
});



function cleanJS(cb) {
    return del([path.join(paths.build, '*.js'), path.join(paths.build, '*.js.map')], cb);
}



gulp.task('css', ['css:clean'], function() {
    
    var autoprefixerConfig = {
        cascade: false
    };
    
    return gulp.src(paths.css + '/base.less')
        .pipe(less())
        .pipe(autoprefixer(['last 2 versions', '> 1%'], autoprefixerConfig))
        .pipe(csso())
        .pipe(rev())
        .pipe(gulp.dest(paths.build))
        .pipe(rev.manifest())
        .pipe(rename('css.json'))
        .pipe(gulp.dest(paths.versions));

});



gulp.task('css:clean', function(cb) {
    return del([path.join(paths.build, '*.css')], cb);
});



gulp.task('sounds', function(cb) {

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
		players2 = [];
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
                getTTS(i, 'en-US', function(res) {
                    if(res.writable) {
						gutil.log("pushing tts of " + i + " to download queue");
                        downloads.push(res);
                    }
                	i ++;
                    cb();
                });
            }, cb);
        }
    
    ]);
        
    function fetchAnnouncements(player, cb) {
        async.each(announcements, function(announcement, cb) {
            announcement = announcement(player);
            getTTS(announcement, 'en-US', cb);
        }, cb);
    }
    
});



function getTTS(phrase, language, cb) {

    language = language || 'en-us';

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

gulp.task('all', ['css', 'main.js']);
