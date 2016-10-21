'use strict';
var _ = require('lodash')
  , events = require('events')
  , common = require('./common')
  , makeReq = common.makeReq
  , getEvents = common.getEvents
  , cache = common.cache;

module.exports = function Core (accessToken, deviceId, options) {
  //Definition object
  var core = this;
  var emitter = new events.EventEmitter();
  core.on = function(event, handler) {
    emitter.on(event, handler);
  };

  options = options || {};

  process.nextTick(function() {

    //Allow overloaded params, and hide accessToken.
    if (_.isObject(accessToken)) {
      //Leave accessToken property out of the core
      _.extend(core, _.omit(accessToken, 'accessToken'));
      accessToken = accessToken.accessToken;
    } else {
      core.id = deviceId;
    }

    var coreOptions = {
      accessToken: accessToken,
      path: '/' + core.id
    };

    //Https request for spark information.
    makeReq(coreOptions, function(err, data) {
      if(err) {
        return emitter.emit('error', err);
      }

      //Add information from API to core.
      _.extend(core, data);

      //Dynamically add variables as a function on the core class.
      _.each(data.variables, function(type, variable) {

        var _updateInterval = 0;
        var cancelUpdate;

        var emitterForVariable = new events.EventEmitter();

        //Add each core variable.
        core[variable] = function(callback) {

          //Request options.
          var opts = {
            accessToken: accessToken,
            path: '/' + core.id + '/' + variable
          };


          makeReq(opts, function(err, data) {
            if(err) {
              return callback(err);
            }

            core.last_app = data.coreInfo.last_app;
            core.last_heard = new Date(data.coreInfo.last_heard);
            core.connected = data.coreInfo.connected;

            //Try to handle temporary spark buffer bug. 
            //https://community.sparkdevices.com/t/example-response-for-spark-variable/827
            if(_.isArray(data.result)) {
              data.result = new Buffer(data.result).toString();
            }

            if(callback) {
              if(data.result) {
                core[variable].value = data.result;
                callback(null, data.result);
              } else {
                //Handle undefined responses nicely.
                callback('No data returned by the API.');
              }
            }

            if(_updateInterval) {
              scheduleUpdate();
            }
          });
        };

        //Set event handler.
        core[variable].on = function(event, handler) {
          emitterForVariable.on(event, handler);
        };



        //Schedule an update
        function scheduleUpdate() {
          if(!_updateInterval) {
            throw 'Update interval was unset.';
          }

          if(cancelUpdate) {
            clearTimeout(cancelUpdate);
          }

          cancelUpdate = setTimeout(function() {
            core[variable]( function(err, value) {
              if(err) {
                emitterForVariable.emit('error', err);
                return emitter.emit('error', err);
              }

              emitterForVariable.emit('update', err, value);
              core.variables[variable] = value;
            });
          }, _updateInterval);
        }

        Object.defineProperty(core[variable], 'autoupdate', {
          get: function() {
            return _updateInterval;
          },
          set: function(newVal) {
            if(_.isNumber(newVal)) {
              _updateInterval = Number(newVal);
              scheduleUpdate();
            } else if (newVal === true) {
              //Default update interval
              _updateInterval = 1000 * 5;
              scheduleUpdate();
            } else if (newVal === false) {
              _updateInterval = false;
              clearTimeout(cancelUpdate);
            } else {
              throw 'variable.autoupdate must be a number or true or false.';
            }

            return _updateInterval;
          }
        });

        cache.add(core);
        cache.write();
      });

      //Dynamically add functions as, uh, functions... on the core class.
      _.each(data.functions, function(func) {
        core[func] = function(param, callback) {
          param = param || '';

          var opts = {
            accessToken: accessToken,
            path: '/' + core.id + '/' + func,
            method: 'POST',
            data: {
              args: param
            }
          };

          makeReq(opts, function(err, data) {
            if(err) {
              return emitter.emit('error', err);
            }

            if(callback) {
              //Handle undefined responses nicely.
              if(data) {
                callback(null, data.return_value);
              } else {
                callback('Undefined was returned. Is you core powered on?');
              }
            }
          });
        };
      });

      //Let everything know you're done loading.
      emitter.emit('connect', core);

      if(!options.skipEvents) {
        getEvents({coreName: core.id, accessToken: accessToken}).on('event', function(event) {
          emitter.emit(event.event, event.data);
          emitter.emit('event', event);
        });
      }
    });
  });
};
