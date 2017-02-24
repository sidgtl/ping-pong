var equal     = require('assert').equal;
var deepEqual = require('assert').deepEqual;

var createError = require('../create-error');

describe('create-error', function() {

  describe('error creation', function() {

    it('should create a new error', function() {
      var TestingError = createError('TestingError');
      var a = new TestingError('msgA');
      var b = new TestingError('msgB');
      equal((a instanceof TestingError), true);
      equal((a instanceof Error), true);
      equal(a.message, 'msgA');
      equal(b.message, 'msgB');
      equal((a.stack.length > 0), true);
    });

    it('should attach properties in the second argument', function() {
      var TestingError = createError('TestingError', {anArray: []});
      var a = new TestingError('Test the array');
      deepEqual(a.anArray, []);
    });

    it('should give the name "CustomError" if the name is omitted', function() {
      var TestingError = createError();
      var a = new TestingError("msg");
      equal(a.name, 'CustomError');
    });

    it('should not reference the same property in subsequent errors', function() {
      var TestingError = createError('TestingError', {anArray: []});
      var a = new TestingError('Test the array');
      a.anArray.push('a');
      var b = new TestingError('');
      deepEqual(b.anArray, []);
    });

    it('should allow for empty objects on the cloned hash', function() {
      var TestingError = createError('TestingError', {anEmptyObj: Object.create(null)});
      var a = new TestingError('Test the array');
      deepEqual(a.anEmptyObj, Object.create(null));
    });

    it('attaches attrs in the second arg of the error ctor, #3', function() {
      var RequestError = createError('RequestError', {status: 400});
      var reqErr = new RequestError('404 Error', {status: 404});
      equal(reqErr.status, 404);
      equal(reqErr.message, '404 Error');
      equal(reqErr.name, 'RequestError');
    });

  });

  describe('subclassing errors', function() {

    it('takes an object in the first argument', function() {
      var TestingError = createError('TestingError');
      var SubTestingError = createError(TestingError, 'SubTestingError');
      var x = new SubTestingError();
      equal((x instanceof SubTestingError), true);
      equal((x instanceof TestingError), true);
      equal((x instanceof Error), true);
    });

    it('attaches the properties appropriately.', function() {
      var TestingError = createError('TestingError');
      var SubTestingError = createError(TestingError, 'SubTestingError', {key: []});
      var x = new SubTestingError();
      deepEqual(x.key, []);
    });

    it('allows for a default message, #4', function() {
      var TestingError = createError('TestingError', {message: 'Error with testing'});
      var x = new TestingError();
      equal(x.message, 'Error with testing');
    });

  });

  describe('invalid values sent to the second argument', function() {

    it('should ignore falsy values', function() {
      var TestingError  = createError('TestingError', '');
      var TestingError2 = createError('TestingError', null);
      var TestingError3 = createError('TestingError', void 0);
      var a = new TestingError('Test the array');
      var b = new TestingError2('Test the array');
      var c = new TestingError3('Test the array');
    });

    it('should ignore arrays', function() {
      var TestingError = createError('TestingError', [{anArray: []}]);
      var a = new TestingError('Test the array');
      equal(a.anArray, void 0);
    });

  });

});