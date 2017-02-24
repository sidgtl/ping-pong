'use strict';
var _ = require('lodash')
  , events = require('events')
  , Core = require('./core')
  , fs = require('fs')
  , common = require('./common')
  , makeReq = common.makeReq
  , getEvents = common.getEvents
  , cache = common.cache;

module.exports = function(accessToken, options) {
  //Verify contract.
  if(!accessToken) {
    throw 'Please provide an access token when instantiating your Collection.';
  }
  options = options || {};
  cache.fileName = options.cacheFile ||  __dirname + '/.sparkCache.json';

  //Maintain a reference to the collection.
  var collection = this;

  //A new event emitter for each core.
  var emitter = new events.EventEmitter();
  collection.on = function(event, handler) {
    emitter.on(event, handler);
  };

  collection.add = function add (newCore) {
    //Collection must only contain cores.
    if(!(newCore instanceof Core)) {
      emitter.emit('error', 'Collection cannot contain a non-core');
      return false;
    }

    collection[newCore.name] = newCore;
  };

  function addCores(coreList) {
    var count = 0;
    //Add each core to the collection.
    _.each(coreList, function(core) {
      core.accessToken = accessToken;
      core = new Core(core, null, {skipEvents: options.skipEvents});

      core.on('connect', function(newCore) {
        collection.add(newCore);

        //Cache each core's properties.
        cache.add(newCore);

        //Save updated cache to disk.
        cache.write();

        if(!collection.connected && ++count === coreList.length) {
          collection.connected = true;
          emitter.emit('connect', coreList, 'Connected to the spark Cloud API');

          if(!options.skipEvents) {
            getEvents({accessToken: accessToken}).on('event', function(event) {
              emitter.emit(event.event, event.data);
              emitter.emit('event', event);
            });
          }
        }
      });

      //Pass error down.
      core.on('error', function(err) {
        emitter.emit('error', err);
      });
    });
  }

  process.nextTick(function() {
    var fsCache = '';

    if(!options.skipCache) {
      //Check for cached collection details as this is the slower call.
      cache.read(function(err) {
        if(err) {
          emitter.emit('info', err);
          return;
        }

        if(!_.isArray(cache)) {
          return;
        }

        addCores(cache);
      });
    }


    var opts = {
      path: '?access_token=' + accessToken
    };

    makeReq(opts, function(err, coreList) {
      if (err) {
        //Remove errors
        emitter.emit('error', err);
        return;
      } else if (JSON.stringify(coreList) !== fsCache) {

        //Filter out cores we already know about.
        var newCores = _.filter(coreList, function(core) {
          return !collection[core.name];
        });

        collection._cores = _.map(newCores, function(core) {
          return {
            name: core.name,
            id: core.id
          };
        });

        //Keep the cache up to date.
        _.each(coreList, function(core) {
          cache.add(core);
        });

        addCores(newCores);

        //Store cache to disk. This should rarely change (unless you buy a new core).
        cache.write();

      }
    });
  });
};
