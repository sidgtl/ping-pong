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
    bundle.add(paths.js + '/third_party/font.js', { noparse: true });
    
    // Add the main.js file
    bundle.add(paths.js + '/main.js');

    bundle.transform('reactify');

    watch.on('update', rebundle);
        
    function rebundle() {
        cleanJS(function() {
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
                async.each(players, function(player, cb) {
                    fetchAnnouncements(player.get('name'), function(res) {
                        if(res.writable) {
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
                getTTS(i, 'en-gb', function(res) {
                    if(res.writable) {
                        downloads.push(res);
                    }
                    cb();
                });
            }, cb);
            
        }
    
    ], function() {
        
        var updateSprite = exec.bind(undefined, 'audiosprite --format howler --path build/ --output ui/public/build/sprite --export mp3 ui/public/sounds/*.mp3 ui/public/sounds/*.wav', cb);
        
        if(downloads.length > 0) {
            return es.merge.apply(undefined, downloads).on('end', function() {
                updateSprite();
            });
        }
        
        updateSprite();
        
    });
        
    function fetchAnnouncements(player, cb) {
        async.each(announcements, function(announcement, cb) {
            announcement = announcement(player);
            getTTS(announcement, 'en-gb', cb);
        }, cb);
    }
    
});



function getTTS(phrase, language, cb) {

    language = language || 'en-gb';

    var
        requestURL = 'http://translate.google.com/translate_tts?q=' + phrase + '&tl=' + language,
        fileName = slug(phrase).toLowerCase() + '.mp3',
        filePath = path.join('./ui/public/sounds/', fileName),
        res = true;

    fs.exists(filePath, function(exists) {
        if(!exists) {
            res = request(requestURL);
            res.on('response', function() {
                res.pipe(fs.createWriteStream(filePath));
            });
        }
        cb(res);
    });

}



gulp.task('all', ['css', 'main.js']);