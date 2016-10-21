'use strict';

var assert = require('assert')
  , Collection = require('../lib/collection')
  , nock = require('nock');

var a;
var myFuncs = [ 'getdata',
  'digitalread',
  'digitalwrite',
  'analogread'
];

describe('coll constructor', function() {

  beforeEach(function() {

    nock('https://api.spark.io').get('/v1/devices/bar').reply(200, {
      id: 'bar',
      name: 'core1',
      variables: {
        delay: 'int32'
      },
      functions: myFuncs
    });

    nock('https://api.spark.io').get('/v1/devices/foo').reply(200, {
      id: 'foo',
      name: 'core2',
      variables: {
        delay: 'int32'
      },
      functions: myFuncs
    });

    nock('https://api.spark.io').get('/v1/devices').reply(200, [{
        'id': 'foo',
        'name': 'foo',
        'last_app': null,
        'connected': true
      },{
        'id': 'bar',
        'name': 'bar',
        'last_app': null,
        'connected': false
      }
    ]);

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

    a = new Collection('123');

    it('should add two cores to the collection.', function(done) {
      a.on('connect', function () {
        assert(a.foo, 'foo should be in the collection');
        assert(a.bar, 'bar should be in the collection');
        done();
      });
    });

  });

});
