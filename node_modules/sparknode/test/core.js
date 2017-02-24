'use strict';

var assert = require('assert')
  , Core = require('../lib/core')
  , common = require('../lib/common')
  , nock = require('nock')
  , _ = require('lodash')._;

var a;
var spark;
var myFuncs = [ 'getdata',
  'digitalread',
  'digitalwrite',
  'analogread'
];

describe('core constructor', function() {

  beforeEach(function() {

    spark = nock('https://api.spark.io').get('/v1/devices/bar').reply(200, {
      id: 'bar',
      name: 'core1',
      variables: {
        delay: 'int32'
      },
      functions: myFuncs
    });

    nock('https://api.spark.io').get('/v1/devices/bar/delay').reply(200, {
      cmd: 'VarReturn',
      name: 'delay',
      result: 1000,
      coreInfo: {
        last_app: '',
        last_heard: '2014-01-23T13:20:23.131Z',
        connected: true,
        deviceID: 'foo'
      }
    });

    nock('https://api.spark.io').post('/v1/devices/bar/getdata', {args: 'foo'}).reply(200, {
      id: 'bar',
      name: 'bar',
      last_app: null,
      connected: true,
      return_value: 10118
    });

    a = new Core('foo', 'bar');

  });

  afterEach(function() {
    assert(spark.isDone());
  });

  it('should add functions for each function returned by the server.', function(done) {
    a.on('connect', function() {
      _.each(myFuncs, function (expectedFunction) {
        assert(!!a[expectedFunction], 'core "a" was expected to have a ' + expectedFunction + ' function');
      });
      done();
    });
  });

  it('should add a variable to the core was well', function(done) {
    a.on('connect', function() {
      assert(!!a.delay, 'Variable was not added.');
      done();
    });
  });

  it('should add autoupdate and value.', function(done) {
    a.on('connect', function() {
      assert(a.delay.autoupdate !== undefined, 'Variable autoupdate property was not added.');
      a.delay.autoupdate = 1000;
      a.delay.on('update', function(err, value) {
        assert(value === 1000, 'Variable did not return the proper value');
        assert(a.delay.value === 1000, 'value property was not set.');
        a.delay.autoupdate = false;
        done();
      });
    });
  });

  it('should not autoupdate twice.', function(done) {
    a.on('connect', function () {
      a.delay.autoupdate = 100;
      a.delay.autoupdate = 99;
      a.delay.autoupdate = 98;
      a.delay.autoupdate = 97;
      a.delay.autoupdate = 96;

      a.delay.on('update', function(err, data) {
        assert(data === 1000, 'autoupdate did not retreive data.');
        a.delay.autoupdate = false;
        done();
      });
    });
  });

  it('should update the core\'s meta properties', function(done) {
    a.on('connect', function () {
      a.delay(function() {
        assert(a.connected === true, '"connected" property was not updated after variable return.');
        assert(a.last_heard.toString() === new Date('2014-01-23T13:20:23.131Z').toString(), '"last_heard" property was not updated after variable return.');
        assert(a.last_app === '', '"last_app" property was not updated after variable return.');
        done();
      });
    });
  });

  it('should not expose the authtoken outside of closure', function (done) {
    a.on('connect', function () {
      assert(!a.authtoken, '"authtoken" was exposed.');
      done();
    });
  });

  describe('auto update for variables', function() {
  });
});
