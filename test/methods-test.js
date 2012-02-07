var EventVat = require('../lib/eventvat');

var origTimeout = setTimeout;
this.methodSuite = {
    setUp: function(test) {

      setTimeout = function(fn, ms) {
        return origTimeout(fn, 0);
      };

      if (typeof test === 'function') {
        test();
      }
      else {
        test.done();
      }

    },

    tearDown: function(test) {

      setTimeout = origTimeout;

      if (typeof test === 'function') {
        test();
      }
      else {
        test.done();
      }

    },

    'Invoke `get` method and return value': function (test) {

      var vat = EventVat();

      test.equal(vat.get('a'), false);
      
      vat.die();
      test.done();

    },
    'Invoke `set` method and check value at key': function (test) {

      var vat = EventVat();

      vat.set('a', 123);
      test.equal(vat.get('a'), 123);
      
      vat.die();
      test.done();

    },
    'Invoke `setnx` method against a key that exists': function (test) {

      var vat = EventVat();

      vat.set('a', 123);
      test.equal(vat.setnx('a', 'hi'), false);
      test.equal(vat.get('a'), 123);

      vat.die();
      test.done();

    },
    'Invoke `setnx` method against a key does not exist': function (test) {

      var vat = EventVat();

      test.equal(vat.setnx('a', 'hi'), true);;
      test.equal(vat.get('a'), 'hi');

      vat.die();
      test.done();

    },    
    'Invoke `rename` method and get the value of the new key': function (test) {

      var vat = EventVat();

      vat.set('a', 'hello');
      vat.rename('a', 'b');
      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), 'hello');

      vat.die();
      test.done();

    },
    'Invoke `decr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.decr('a'), 4);
      test.equal(vat.get('a'), 4);

      test.equal(vat.get('b'), false);
      test.equal(vat.decr('b'), -1);
      test.equal(vat.get('b'), -1);

      vat.die();
      test.done();

    },    
    'Invoke `incr` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      vat.incr('a');
      test.equal(vat.get('a'), 6);

      test.equal(vat.get('b'), false);
      test.equal(vat.incr('b'), 1);
      test.equal(vat.get('b'), 1);

      vat.die();
      test.done();

    },
    'Invoke `decrby` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.decrby('a', 3), 2);
      test.equal(vat.get('a'), 2);

      test.equal(vat.get('b'), false);
      test.equal(vat.decrby('b', 2), -2);
      test.equal(vat.get('b'), -2);

      vat.die();
      test.done();

    },    
    'Invoke `incrby` method and report new value before and after': function (test) {

      var vat = EventVat();

      vat.set('a', 5);
      test.equal(vat.get('a'), 5);

      test.equal(vat.incrby('a', 4), 9);
      test.equal(vat.get('a'), 9);

      test.equal(vat.get('b'), false);
      test.equal(vat.incrby('b', 42), 42);
      test.equal(vat.get('b'), 42);

      vat.die();
      test.done();

    },
    
    
    'Invoke `swap` method and report value of both keys before and after': function (test) {
      
      var vat = EventVat();

      vat.set('a', 5);
      vat.set('b', 'hi');
      test.equal(vat.get('a'), 5);
      test.equal(vat.get('b'), 'hi');

      vat.swap('a', 'b');
      test.equal(vat.get('b'), 5);
      test.equal(vat.get('a'), 'hi');


      vat.die();
      test.done();
      
    },
    'Invoke `findin` method and report value': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'hello');
      test.equal(vat.findin('foo', 'll'), 2);

      vat.die();
      test.done();
      
    },
    'Invoke `del` method and report value before and after': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.set('key2', 'thing');
      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.get('key2'), 'thing');

      test.equal(vat.del('foo', 'key2', 'key3'), 2);
      test.equal(vat.get('foo'), false);
      test.equal(vat.get('key2'), false);

      vat.die();
      test.done();
      
    },
    'Invoke `exists` method against a key that does not exist': function (test) {
      
      var vat = EventVat();

      test.equal(vat.exists('foo'), false);

      vat.die();
      test.done();
      
    },
    'Invoke `exists` method against a key that does exist': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar');
      test.equal(vat.exists('foo'), true);

      vat.die();
      test.done();
      
    },
    'Invoke `persist` method against a key and get the ttl': function (test) {
      
      var vat = EventVat();

      vat.set('foo', 'bar', 60);
      test.equal(vat.ttl('foo'), 60);

      vat.persist('foo');
      test.equal(vat.ttl('foo'), -1);

      vat.die();
      test.done();

    },
    'Invoke `randomkey` method and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.set('a', 1);
      vat.set('b', 2);
      vat.set('c', 3);

      var key = vat.randomkey();
      test.ok(key === 'foo' || key === 'a' || key === 'b' || key === 'c');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a String value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 'bar');

      test.equal(vat.type('foo'), 'string');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Number value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', 4);

      test.equal(vat.type('foo'), 'number');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Boolean value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', true);

      test.equal(vat.type('foo'), 'boolean');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a List value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', [1, 2, 3]);

      test.equal(vat.type('foo'), 'list');

      vat.die();
      test.done();

    },
    'Invoke `type` method on a key containing a Hash value and report the value returned': function (test) {

      var vat = EventVat();

      vat.set('foo', { hello: 'world' });

      test.equal(vat.type('foo'), 'hash');

      vat.die();
      test.done();

    },
    'Invoke `append` method and report value before and after': function (test) {

      var vat = EventVat();

      vat.set('foo', 'hello');
      test.equal(vat.get('foo'), 'hello');

      vat.append('foo', ' world!');
      test.equal(vat.get('foo'), 'hello world!');

      vat.die();
      test.done();

    },
    'Invoke `expire` method and report value after key expires': function(test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.expire('foo', 1);

      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.ttl('foo'), 1);

      vat.on('del foo', function() {
        test.equal(vat.get('foo'), false);
        test.equal(vat.ttl('foo'), -1);
        vat.die();
        test.done();
      });
    },
    'Invoke `expireat` method and report value after key expires': function(test) {

      var vat = EventVat();

      vat.set('foo', 'bar');
      vat.expireat('foo', Math.round(new Date() / 1000) + 1);

      test.equal(vat.get('foo'), 'bar');
      test.equal(vat.ttl('foo'), 1);

      vat.on('del foo', function() {
        test.equal(vat.get('foo'), false);
        test.equal(vat.ttl('foo'), -1);
        vat.die();
        test.done();
      });
    },
    'Invoke `keys` method and report keys returned': function(test) {

      var vat = EventVat();

      vat.set('foo1', 1);
      vat.set('foo2', 2);
      vat.set('foobar', 3);
      vat.set('ufoo', 4);

      test.deepEqual(vat.keys(/^foo/), ['foo1', 'foo2', 'foobar']);
      vat.die();
      test.done();

    },
    'Invoke `move` method and report keys in both databases before and after': function(test) {

      var vat = EventVat();
      var vat2 = EventVat();

      vat.set('foo', 42);

      test.equal(vat.get('foo'), 42);
      test.equal(vat2.get('foo'), false);

      vat.move('foo', vat2);

      test.equal(vat.get('foo'), false);
      test.equal(vat2.get('foo'), 42);

      vat.die();
      test.done();

    },
    'Invoke `randomkey` method and report key returned': function(test) {

      var vat = EventVat();

      vat.set('a', 1);
      vat.set('b', 2);
      vat.set('c', 3);

      var key = vat.randomkey();
      test.ok(key === 'a' || key === 'b' || key === 'c');

      vat.die();
      test.done();

    },
    'Invoke `getrange` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      test.equal(vat.getrange('foo', 6, 11), 'world');

      vat.die();
      test.done();

    },
    'Invoke `mget` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      vat.set('bar', 42);
      test.deepEqual(vat.mget('foo', 'bar'), ['hello world!', 42]);

      vat.die();
      test.done();

    },
    'Invoke `mset` method and report values': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), false);
      test.equal(vat.get('c'), false);

      vat.mset('a', 1, 'b', 2, 'c', 3);

      test.equal(vat.get('a'), 1);
      test.equal(vat.get('b'), 2);
      test.equal(vat.get('c'), 3);

      vat.die();
      test.done();
    },
    'Invoke `msetnx` method': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), false);
      test.equal(vat.get('c'), false);

      vat.set('foo', 'bar');
      test.equal(vat.msetnx('a', 1, 'b', 2, 'c', 3), true);

      test.equal(vat.get('a'), 1);
      test.equal(vat.get('b'), 2);
      test.equal(vat.get('c'), 3);

      vat.die();
      test.done();

    },
    'Invoke `msetnx` method with a key that already exists': function(test) {

      var vat = EventVat();

      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), false);
      test.equal(vat.get('c'), false);

      vat.set('b', 'bar');
      test.equal(vat.msetnx('a', 1, 'b', 2, 'c', 3), false);

      test.equal(vat.get('a'), false);
      test.equal(vat.get('b'), 'bar');
      test.equal(vat.get('c'), false);

      vat.die();
      test.done();

    },
    'Invoke `strlen` method': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!')
      test.equal(vat.strlen('foo'), 12);

      vat.die();
      test.done();

    },
    'Invoke `setrange` method and return value': function(test) {

      var vat = EventVat();

      vat.set('foo', 'hello world!');
      test.equal(vat.setrange('foo', 6, 'redis'), 12);

      vat.die();
      test.done();

    },
    'Invoke `hset` method and report `hget` value before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), false);
      vat.hset('foo', 'a', 'hello');
      test.equal(vat.hget('foo', 'a'), 'hello');

      test.equal(vat.hget('foo', 'b'), false);
      vat.hset('foo', 'b', 42);
      test.equal(vat.hget('foo', 'b'), 42);

      vat.die();
      test.done();
    },
    'Invoke `hexists` method and return value': function(test) {

      var vat = EventVat();

      test.equal(vat.hexists('foo', 'a'), false);
      vat.hset('foo', 'a', 'hello');
      test.equal(vat.hexists('foo', 'a'), true);
      test.equal(vat.hexists('foo', 'b'), false);

      vat.die();
      test.done();
    },
    'Invoke `hdel` method and report values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), false);
      test.equal(vat.hget('foo', 'b'), false);
      test.equal(vat.hget('foo', 'c'), false);

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);

      test.equal(vat.hget('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'b'), 2);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.hdel('foo', 'a', 'b');
      test.equal(vat.hget('foo', 'a'), false);
      test.equal(vat.hget('foo', 'b'), false);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.die();
      test.done();

    },
    'Invoke `hgetall` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('bob', 'foo', 'bar');
      vat.hset('bob', 'hello', 'world');
      vat.hset('bob', 'answer', 42);
      test.deepEqual(vat.hgetall('bob'), { foo: 'bar', hello: 'world', answer: 42 });

      vat.die();
      test.done();

    },
    'Invoke `hdecr` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), false);
      test.equal(vat.hdecr('foo', 'a'), -1);
      test.equal(vat.hget('foo', 'a'), -1);

      vat.die();
      test.done();

    },
    'Invoke `hdecrby` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      vat.hset('bar', 'a', 5);
      test.equal(vat.hget('bar', 'a'), 5);
      test.equal(vat.hdecrby('bar', 'a', 3), 2);
      test.equal(vat.hget('bar', 'a'), 2);

      vat.die();
      test.done();

    },
    'Invoke `hincr` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), false);
      test.equal(vat.hincr('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'a'), 1);

      vat.die();
      test.done();

    },
    'Invoke `hincrby` method and repoprt values before and after': function(test) {

      var vat = EventVat();

      vat.hset('bar', 'a', 5);
      test.equal(vat.hget('bar', 'a'), 5);
      test.equal(vat.hincrby('bar', 'a', 3), 8);
      test.equal(vat.hget('bar', 'a'), 8);

      vat.die();
      test.done();

    },
    'Invoke `hkeys` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hkeys('foo'), ['a', 'b', 'c']);

      vat.die();
      test.done();

    },
    'Invoke `hlen` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hlen('foo'), 3);

      vat.die();
      test.done();

    },
    'Invoke `hvals` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hvals('foo'), [1, 2, 3]);

      vat.die();
      test.done();

    },
    'Invoke `hsetnx` method and report value before and after': function(test) {

      var vat = EventVat();

      vat.hget('foo', 'a', false);
      vat.hsetnx('foo', 'a', 42);
      vat.hget('foo', 'a', 42);

      vat.hsetnx('foo', 'a', 'hi');
      vat.hget('foo', 'a', 42);

      vat.die();
      test.done();

    },
    'Invoke `hmget` method and return value': function(test) {

      var vat = EventVat();

      vat.hset('foo', 'a', 1);
      vat.hset('foo', 'b', 2);
      vat.hset('foo', 'c', 3);
      test.deepEqual(vat.hmget('foo', 'a', 'b', 'd'), [1, 2, false]);

      vat.die();
      test.done();

    },
    'Invoke `hmset` method and report values before and after': function(test) {

      var vat = EventVat();

      test.equal(vat.hget('foo', 'a'), false);
      test.equal(vat.hget('foo', 'b'), false);
      test.equal(vat.hget('foo', 'c'), false);

      test.ok(vat.hmset('foo', 'a', 1, 'b', 2, 'c', 3));

      test.equal(vat.hget('foo', 'a'), 1);
      test.equal(vat.hget('foo', 'b'), 2);
      test.equal(vat.hget('foo', 'c'), 3);

      vat.die();
      test.done();
    },
};