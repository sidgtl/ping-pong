require('./modernizr');

var
    React = require('react'),
    GameComponent = require('../components/GameComponent'),
    node = require('./node.js');

$(function() {
    React.renderComponent(GameComponent(), document.getElementById('game'));
});

function debug(msg, data, consoleOnly) {
    if(consoleOnly === undefined) $('#debug').prepend(msg+'<br>');
    if(data !== undefined) console.log(msg, data);
}