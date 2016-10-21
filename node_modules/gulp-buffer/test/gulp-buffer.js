var fs = require('fs');
var File = require('vinyl');
var buffer = require('..');
var through = require('through2');
var assert = require('assert');
var Stream = require('stream');

describe('gulp-buffer', function() {

  describe('with null contents', function() { 
    it('should let null files pass through', function(done) {
      var b = buffer();
      var n = 0;
      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, null);
        n++;
	callback();
      }
      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
	callback();
      }
      var t = through.obj(_transform, _flush);
      b.pipe(t);
      b.end(new File({
        contents: null
      }));
    });
  });

  describe('with buffer contents', function() { 
    it('should let buffer files pass through', function(done) {
      var b = buffer();
      var n = 0;
      var c = new Buffer("data");
      var _transform = function(file, enc, callback) {
        assert.equal(file.contents, c);
        n++;
	callback();
      }
      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
	callback();
      }
      var t = through.obj(_transform, _flush);
      b.pipe(t);
      b.end(new File({
        contents: c
      }));
    });
  });

  describe('with stream contents', function() { 
    it('should transform stream to buffer', function(done) {
      var b = buffer();
      var n = 0;
      var c = Readable();
      var _transform = function(file, enc, callback) {
	assert.equal(file.isBuffer(), true);
        assert.equal(file.contents.toString(), "data");
        n++;
	callback();
      }
      var _flush = function(callback) {
        assert.equal(n, 1);
        done();
	callback();
      }
      var t = through.obj(_transform, _flush);
      b.pipe(t);
      b.end(new File({
        contents: c
      }));
    });
  });


});

function Readable(cb){
  var readable = new Stream.Readable();
  readable._read = function() {
    this.push(new Buffer('data'));
    this.push(null); // no more data
  };
  if (cb) readable.on('end', cb);
  return readable;
}


