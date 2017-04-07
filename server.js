var
    path = require('path'),
    net = require('net'),
    chalk = require('chalk'),
    jade = require('jade'),
    serveStatic = require('serve-static'),
    environment = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    app = require('./app.js'),
    cardReader = require('./lib/cardReader'),
    leaderboard = require('./lib/leaderboard');

getConfig = require('./config');
config = getConfig[environment];
settings = getConfig.global;

app.set('settings', settings);
app.engine('jade', jade.__express);
app.use(serveStatic('./ui/public'));
app.locals.config = config;
app.locals.settings = settings;

_ = require('underscore');
io = require('socket.io');
moment = require('moment');
//spark = require('sparknode');
//core = new spark.Core(settings.sparkCore);

gameController = require('./classes/gameController');

game = {};
player = {};

// Setup socketio
io = io.listen(config.wsPort);
console.log(chalk.green('Websocket Server: Listening on port ' + config.wsPort));

io.configure(function() {
    io.set('log level', 2);
});

app.get('/', function(req, res) {
    
    delete require.cache[path.resolve('./versions/js.json')];
    delete require.cache[path.resolve('./versions/css.json')];
    
    res.render('home.jade', {
        title: 'Ping Pong',
        metaDesc: 'Ping Pong',
        JSVersions: require('./versions/js'),
        CSSVersions: require('./versions/css')
    });
    
});

app.get('/leaderboard', function(req, res) {
    // This could use a streaming response instead
    leaderboard.get(10)
        .then(function(players) {
            res.json(players.toJSON());
        });
});

app.listen(config.clientPort);
console.log(chalk.green('Web Server: Listening on port ' + config.clientPort));

game = new gameController();

game.feelersPingReceived();

io.sockets.on('connection', function(client) {
    game.reset();
    game.clientJoined();
    cardReader.connectionStatus();
    client.on('fakeScored', game.feelerPressed); // Fake score event for easier testing
});

//core.on('scored', game.feelerPressed);
//core.on('ping', game.feelersPingReceived);    
//core.on('batteryLow', game.batteryLow);

//core.on('online', function() {
//    game.feelersOnline();
//    game.feelerStatus();
//    game.feelersPingReceived();
//});

cardReader.on('read', function(data) {
    console.log('New read', data);
    game.addPlayerByRfid(data.rfid);
});

cardReader.on('press', function(data) {
    console.log('Player ' + data.player + ' press');
    game.feelerPressed(data.player);
});

cardReader.on('err', game.cardReadError);

cardReader.on('connect', function() {
    io.sockets.emit('cardReader.connect');
});

cardReader.on('disconnect', function() {
    io.sockets.emit('cardReader.disconnect');
});
