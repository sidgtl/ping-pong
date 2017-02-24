'use strict';
var https = require('https')
  , fs = require('fs')
  , events = require('events')
  , _ = require('lodash');

function defaultOptions (auth) {
  var options = {
    hostname: 'api.spark.io',
    path: '/v1/',
    method: 'GET',
    headers: {}
  };

  if(auth) {
    options.headers.Authorization = 'Bearer ' + auth;
  }

  return options;
}

function makeReq (options, callback) {
  //Default http request options.
  var requestOptions = defaultOptions(options.accessToken);

  requestOptions.path += 'devices';

  //Augment the default options.
  requestOptions.path += (options.path ? options.path : '');
  requestOptions.method = options.method || requestOptions.method;
  _.extend(requestOptions.headers, options.headers);

  //Short-circuit boolean test and data reference
  var dataToSend = ['PUT','POST','PATCH'].indexOf(options.method) > -1 && options.data;

  if(dataToSend) {
    requestOptions.headers['Content-Type'] = 'application/json';
  }

  //Storage for the data chunks.
  var data = '';

  var req = https.request(requestOptions, function(res) {
    res.on('data', function(d) {
      data += d;
    });

    res.on('end', function() {
      if(callback) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data);
        } else if (data) {
          callback(null, data);
        } else {
          callback('No data returned by the API.');
        }
      }
    });
  });

  //Send when appropriate
  if(dataToSend) {
    var buf = new Buffer(JSON.stringify(dataToSend));
    req.write(buf);
  }

  req.end();

  req.on('error', function (err) {
    if(callback) {
      callback(err);
    }
  });
}

exports.defaultOptions = defaultOptions;
exports.makeReq = makeReq;

function Cache() {
  var cache = this;

  var cores = cache.cores = [];

  cache.add = function(core) {
    var existingCore = _.find(cores, function(exCore) {
      return exCore.id === core.id;
    });
    if(existingCore) {
      _.extend(cache.byId[core.id], core);
    } else {
      cores.push(core);
      cache.byId[core.id] = core;
      cache.byName[core.name] = core;
    }
  };

  cache.byName = {};
  cache.byId = {};
  cache.fileName = './.sparkcache.json';

  cache.write = function () {
    fs.writeFile(cache.fileName, JSON.stringify(cores));
  };

  cache.read = function(callback) {
    //Safe read.
    fs.exists(cache.fileName, function(exists) {
      if(exists) {
        fs.readFile(cache.fileName, function(err, data) {
          //Fail gracefully.
          try {
            //Parse the saved cache.
            data = JSON.parse(data.toString());

            //Add each core from cache
            _.each(data, function(cachedCore) {
              cache.add(cachedCore);
            });

            //Apply the callback
            callback(null, data);
          } catch (e) {
            //Apply the error callback.
            callback(e);
          }
        });
      } else {
        //Error
        callback('cacheFile does not exist.');
      }
    });
  };
}

/**
 * @name listenForSparkEvents
 * @param {Object} options The options. Consists of public, core, accessToken, and event.
 * @param {EventEmitter} emitter
 */
function listenForSparkEvents(options, emitter) {
  var req = https.request(options, function(res) {

    var lastEventName;

    res.on('data', function(data) {
      if(data[0].toString() === ':') {return;} //Drop ':ok' message

      //Get each line of data in this chunk
      var lines = data.toString().split(/\n/);

      //Make a place to put the data
      var eventMap = {};

      lines.filter(function(string) {
        return string;
      }).forEach(function(line) {
        var keyValPair = line.split(': ');
        eventMap[keyValPair.shift()] = keyValPair.join(': ');
      });

      if(!eventMap.data) {
        if(eventMap.event) {
          lastEventName = eventMap.event;
          return;
        }
      } else {
        try {
          eventMap.data = JSON.parse(eventMap.data);
        } catch(e) {
        }
      }

      if(!eventMap.event && lastEventName) {
        eventMap.event = lastEventName;
        lastEventName = undefined;
      }

      if(eventMap.event && eventMap.data) {
        emitter.emit('event', eventMap);
      }
    });

    // if the request is killed, start a new one
    res.on('end', function() {
      listenForSparkEvents(options, emitter);
    });

    res.on('error', function (e) {
      emitter.emit('error', e);
    });
  });

  req.setSocketKeepAlive(true);

  req.on('error', function (e) {
    emitter.emit('error', e);
  });

  req.end();
}

/**
 * @name getEvents
 * @param {Object} opts The options. Consists of public, core, accessToken, and event.
 * @returns {EventEmitter} Emitter
 */

//Internal abstraction for events
exports.getEvents = function getEvents(opts) {
  var options = defaultOptions(opts.accessToken);
  if(!opts.pub) {
    options.path += 'devices/';

    if (opts.coreName) {
      options.path += opts.coreName + '/';
    }
  }

  options.path += 'events';

  if(opts.eventName) {
    options.path += '/' + opts.eventName;
  }

  var emitter = new events.EventEmitter();

  //Start listening for events
  listenForSparkEvents(options, emitter);

  //With great power comes great responsibility.
  return emitter;
};

//More useful cache. Hopefully.
exports.cache = new Cache();
exports.Cache = Cache;
