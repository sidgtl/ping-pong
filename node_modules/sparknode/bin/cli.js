#!/usr/bin/env node
'use strict';

var spark = require('commander')
  , pkg = require('../package.json')
  , version = pkg.version
  , Core = require('../lib/core.js')
  , Collection = require('../lib/collection.js')
  , _ = require('lodash')._
  , getEvents = require('../lib/common').getEvents
  , cache = require('../lib/common').cache
  , fs = require('fs');


//http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var rcFile = getUserHome() + '/.sparkrc';

function checkConfig (callback) {
  cache.fileName = rcFile;
  cache.read(function(err) {
    if(err) {
      console.log('No devices have been added. Please use \'spark add\' first.');
      return;
    }
    callback(cache);
  });
}


//Function
function fn (core, fName, arg) {
  checkConfig(function() {
    var myCore = new Core(cache.byName[core], null, {skipEvents: true});

    myCore.on('connect', function() {
      //List off functions available.
      if(!fName) {
        if(myCore.functions.length) {
          console.log('Functions available for core \'' + core + '\':');
          _.each(myCore.functions, function(fn) {
            console.log('  ' + fn);
          });
        } else {
          console.log('No functions available for core \'' + core + '\'.');
        }
      } else if(myCore.functions.indexOf(fName) > -1) {
        myCore[fName](arg, function(err, data) {
          console.log(data);
        });
      } else {
        console.log('The function you\'ve tried to call is not registered with the spark Cloud');
      }
    });
  });
}

spark.version(version);

spark.command('fn <core> [function] [argument]')
  .description('Run a spark core function with argument or get a list of available functions.')
  .usage('spark fn <core> [function] [argument]')
  .action(fn);


//Variable
var varCommand = spark.command('var <core> [variable]')
  .description('Get a spark core variable or list of available variables')
  .usage('spark var <core> [variable]')
  .option('-n, --number <n>', 'Get an update n times')
  .option('-c, --continuous', 'Get continuous updates')
  .option('-i, --interval <i>', 'Interval, i,  in milliseconds.')
  .action(variable);
  
function variable (core, varName) {
  var numCompletions = 0;

  checkConfig(function() {
    //Defaults

    //Get a new core.
    var myCore = new Core(cache.byName[core], null, {skipEvents: true});

    //When connected
    myCore.on('connect', function() {
      if(!varName) {
        if(!_.keys(myCore.variables).length) {
          console.log('No variables available for core \'' + core + '\'.');
        } else {
          _.each(myCore.variables, function(val, key) {
            console.log('Variables available for core \'' + core + '\':');
            console.log('  ' + key);
          });
        }

      } else if(!myCore.variables[varName]) {

        return console.log('The variable you\'ve tried to get is not registered with the spark Cloud');

      } else if(varCommand.number || varCommand.continuous) {

        //Set autoupdate or default it.
        myCore[varName].autoupdate = varCommand.interval || 1000;

        //Listen and log, stopping when necessary.
        myCore[varName].on('update', function(err, data) {
          if(err) {
            console.log('ERROR: ', err);
          }
          if(varCommand.continuous || numCompletions++ < varCommand.number) {
            console.log(data);
          } else {
            myCore[varName].autoupdate = false;
          }
        });
      } else {
        myCore[varName](function(err, data) {
          console.log(data);
        });
      }
    });

    myCore.on('error', function(err) {
      console.log(err);
    });
  });
}

function add (newToken, id) {
  var result;

  if(id) {
    result = new Core(newToken, id, {skipEvents: true});
  } else {
    result = new Collection(newToken, {cacheFile: rcFile, skipEvents: true});
  }

  result.on('connect', function() {
    console.log('The following cores were found and saved: ');
    _.each(result._cores, function (core) {
      console.log(core.name, core.id);
    });
  });

  result.on('error', function(err) {
    console.log('ERROR: ', err);
  });
}

spark.command('add <token> [id]')
.description('Get either a spark collection or a single device')
.action(add);

//Write details of the given core to output.
function logCore(core) {
  console.log('Core: ' + core.name + ' (' + core.id + ')');
  console.log('\nFunctions: ');
  _.each(core.functions, function(fun) {
    console.log('  ' + fun);
  });
  console.log('\nVariables: ');
  _.each(core.variables, function(type, varName) {
    console.log('  ' + varName);
  });
  console.log('\nConnected: ' + core.connected);
}

var lsCommand = spark.command('ls [coreName]')
.description('Get a list of variables and functions, optionally for only one core.')
.option('-u, --update', 'Update from the spark cloud first.')
.action( function ls(coreName) {
  //Show a list of cores or details for a given core.
  checkConfig(function() {
    function printCores () {
      if(coreName && cache.byName[coreName]) {

        logCore(cache.byName[coreName]);
      } else {
        _.each(cache.byName, function(core) {
          logCore(core);
          console.log('\n-----------\n');
        });
      }
    }

    if(lsCommand.update) {
      
      var newToken = _.find(cache.byName, function() {return true}).accessToken;

      var result = new Collection(newToken, {cacheFile: rcFile, skipEvents: true});

      result.on('connect', printCores);
    } else {
      printCores();
    }
  });
});

var eventsCommand = spark.command('events [coreName]')
.description('Get a list of events as they happen.')
.option('-p, --public', 'Get a list of public events')
.option('-n, --name <name>', 'Specify the name of the event')
.action(event);

function event (coreName) {
  checkConfig(function() {
    var opts = {
      pub: eventsCommand['public'],
      coreName: coreName,
      eventName: eventsCommand.name,
      accessToken: cache.cores[0].accessToken
    };

    getEvents(opts).on('event', function(e) {console.log(e);});
  });
}

spark.parse(process.argv);
