;(function(module, undefined) {

  var EventEmitter2, EventVat;

  if(!EventEmitter2 && require) {
    EventEmitter2 = require('eventemitter2').EventEmitter2;
    if(!EventEmitter2) {
      throw new Error('`EventEmitter2` is not defined.');
    }
  }

  function init() {
    this._events = new Object;
  }

  this.wildcard = ' ';
  this.listenerTree = new Object;

  //
  // Determine if a key exists within an object
  //
  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  EventVat = module.exports = function EventVat(conf) {

    if (!(this instanceof EventVat)) {
      return new EventVat(conf);
    }

    this.hash = conf && conf.data || {};
  };

  for (var member in EventEmitter2.prototype) {
    EventVat.prototype[member] = EventEmitter2.prototype[member];
  }

  EventVat.prototype.publish     = EventEmitter2.prototype.emit;
  EventVat.prototype.subscribe   = EventEmitter2.prototype.on;
  EventVat.prototype.unsubscribe = EventEmitter2.prototype.removeListener;

  EventVat.prototype.die = function(key) {
    for (var key in this.hash) {
      if (has(this.hash, key)) {
        if (this.hash[key].tid) {
          clearTimeout(this.hash[key].tid);
        }
      }
    }
  };

  // KEYS
  // ----

  //
  // Delete a key
  //
  EventVat.prototype.del = function(key /* ... */) {
    var n = 0;

    for (var i = 0, l = arguments.length; i < l; i++) {
      key = arguments[i];
      if(has(this.hash, key)) {
        delete this.hash[key];
        this.emit('del ' + key);
        this.emit('del', key);
        n++;
      }
    }

    return n;
  };

  //
  // Determine if a key exists
  //
  EventVat.prototype.exists = function(key) {
    var exists = has(this.hash, key);
    this.emit('exists ' + key, exists);
    this.emit('exists', key, exists);
    return exists;
  };

  //
  // Set a key's time to live in seconds
  //
  EventVat.prototype.expire = function(key, ttl) {

    if (has(this.hash, key) && typeof ttl === 'number' && ttl > -1) {
      if (this.hash[key].tid) {
        clearTimeout(this.hash[key].tid);
      }

      var ms = ttl * 1000;
      var that = this;
      that.hash[key].tid = setTimeout(function() {
        that.del(key);
      }, ms);
      that.hash[key].tend = +new Date() + ms;

      this.emit('expire ' + key, ttl);
      this.emit('expire', key, ttl);
      return true;

    }
    else {
      return false;
    }
  };

  //
  // Set the expiration for a key as a UNIX timestamp
  //
  EventVat.prototype.expireat = function(key, dueDate) {
    var ttl = dueDate - (Math.round(new Date() / 1000));
    var rs = this.expire(key, ttl);

    if (rs) {
      this.emit('expireat ' + key, dueDate);
      this.emit('expireat', key, dueDate);
    }

    return rs;
  };

  //
  // Find all keys matching the given pattern
  //
  EventVat.prototype.keys = function(regex) {
    var keys = [];

    for(var k in this.hash) {
      if(has(this.hash, k) && regex.test(k)) {
        keys.push(k);
      }
    }

    this.emit('keys', keys, regex);
    return keys;
  };

  //
  // Move a key to another database
  //
  EventVat.prototype.move = function(key, db) {
    if(db && db.hash) {
      this.persist(key);
      db.hash[key] = this.hash[key];
      delete this.hash[key];
      this.emit('move ' + key, db);
      this.emit('move', key, db);
      return true;
    }
    return false;
  }

  //
  // Inspect the internals of EventVat objects
  //
  EventVat.prototype.object = function(subcommend /* ... */) {
    throw new Error('Not implemented.');
  };

  //
  // Remove the expiration from a key
  //
  EventVat.prototype.persist = function(key) {
    if(has(this.hash, key) && this.hash[key].tid) {
      clearTimeout(this.hash[key].tid);
      delete this.hash[key].tid;
      delete this.hash[key].tend;
      this.emit('persist ' + key);
      this.emit('persist', key);
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Return a random key from the keyspace
  //
  EventVat.prototype.randomkey = function() {
    var keys = this.keys(/^/);
    var index = Math.floor(Math.random()*keys.length);
    var key = keys[index];
    this.emit('randomkey', key);
    return key;
  };

  //
  // Rename a key
  //
  EventVat.prototype.rename = function(oldKey, newKey) {
    if(has(this.hash, oldKey)) {
      this.persist(oldKey);
      this.hash[newKey] = this.hash[oldKey];
      delete this.hash[oldKey];
      this.emit('rename ' + oldKey, newKey);
      this.emit('rename', oldKey, newKey);
      return this.hash[newKey].value;
    }
    else {
      return false;
    }
  };

  //
  // Rename a key, only if the new key does not exist
  //
  EventVat.prototype.renamenx = function(oldKey, newKey) {
    if(has(this.hash, oldKey) && !has(this.hash, newKey)) {
      this.persist(oldKey);
      this.hash[newKey] = this.hash[oldKey];
      this.emit('renamenx ' + oldKey, newKey);
      this.emit('renamenx', oldKey, newKey);
      return this.hash[key].value;
    }
    else {
      return false;
    }
  };  

  //
  // Sort key by pattern
  //
  EventVat.prototype.sort = function() {
    throw new Error('Not implemented.');

    // fast javascript sort...
    
    //
    //SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]
    //

  };

  //
  // Determine the type stored at key
  //
  EventVat.prototype.type = function(key) {
    if (has(this.hash, key)) {
      var value = this.hash[key].value;
      var type = typeof value;

      if (type === 'object') {
        return this.hash[key].type
          || (Object.prototype.toString.call(value) === '[object Array]'
              ? 'list' : 'hash');
      } else {
        return type;
      }
    } else {
      return 'none';
    }
  };

  //
  // Get the time to live for a key
  //
  EventVat.prototype.ttl = function(key) {
    var ttl = has(this.hash, key) && this.hash[key].tid
      ? Math.round((this.hash[key].tend - new Date()) / 1000)
      : -1;

    this.emit('ttl ' + key, ttl);
    this.emit('ttl', key, ttl);
    return ttl;
  };

  // STRINGS
  // -------

  //
  // Append a value to a key
  //
  EventVat.prototype.append = function(key, value) {
    if(has(this.hash, key) && this.type(key) === 'string') {
      this.persist(key);
      var newValue = this.hash[key].value += value;
      this.emit('append ' + key, value, newValue);
      this.emit('append', key, value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Decrement the integer value of a key by one
  //
  EventVat.prototype.decr = function(key) {
    var value = this.decrby(key, 1);
    if (value !== false) {
      this.emit('decr ' + key, value);
      this.emit('decr', key, value);
    }
    return value;
  };

  //
  // Decrement the integer value of a key by N
  //
  EventVat.prototype.decrby = function(key, value) {
    if (!has(this.hash, key)) {
      this.hash[key] = { value: 0 };
    } else if (this.type(key) !== 'number') {
      return false;
    }

    this.persist(key);
    var newValue = value ? this.hash[key].value -= value : this.hash[key].value--;
    this.emit('decrby ' + key, value, newValue);
    this.emit('decrby', key, value, newValue);
    return newValue;
  };

  //
  // Get the value of a key
  //
  EventVat.prototype.get = function(key) {

    var newValue;

    if(has(this.hash, key)) {
      var newValue = this.hash[key].value;
      this.emit('get ' + key, newValue);
      this.emit('get', key, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Returns the bit value at offset in the string value stored at key
  //
  EventVat.prototype.getbit = function(key) {
    throw new Error('Not implemented.');
  };

  //
  // Get a substring of the string stored at a key
  //
  EventVat.prototype.getrange = function(key, start, end) {
    if (has(this.hash, key) && this.type(key) === 'string') {
      var value = this.hash[key].value.slice(start, end);
      this.emit('getrange ' + key, value);
      this.emit('getrange', key, value);
      return value;
    } else {
      return false;
    }
  };

  //
  // Set the string value of a key and return its old value
  //
  EventVat.prototype.getset = function(key, value) {
    var old = this.get(key);
    this.set(key, value);
    return old;
  };

  //
  // Increment the integer value of a key by one
  //
  EventVat.prototype.incr = function(key) {
    var value = this.incrby(key, 1);
    if (value !== false) {
      this.emit('incr ' + key, value);
      this.emit('incr', key, value);
    }
    return value;
  };

  //
  // Increment the integer value of a key by the given number
  //
  EventVat.prototype.incrby = function(key, value) {
    value = +value;

    if (!has(this.hash, key)) {
      this.hash[key] = { value: 0 };
    } else if (this.type(key) !== 'number') {
      return false;
    }

    this.persist(key);
    var newValue = this.hash[key].value += value;
    this.emit('incrby ' + key, value, newValue);
    this.emit('incrby', key, value, newValue);
    return newValue;
  };

  //
  // Get the values of all the given keys
  //
  EventVat.prototype.mget = function(key /* ... */) {
    var values = [];
    for(var i=0, l=arguments.length; i < l; i++) {
      values.push(this.get(arguments[i]));
    }
    this.emit('mget', values);
    return values;
  };

  //
  // Set multiple keys to multiple values
  //
  EventVat.prototype.mset = function(keys /* ... */, values /* ... */) {
    var key, value;

    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      if (has(this.hash, key)) {
        this.persist(key);
        this.hash[key].value = value;
      } else {
        this.hash[key] = { value: value };
      }
    }

    // set events must be emitted after keys are updated
    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      this.emit('set ' + key, value);
      this.emit('set', key, value);
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('mset');
    this.emit.apply(this, args);
    return true;
  };

  //
  // Set multiple keys to multiple values, only if none of the keys exist
  //
  EventVat.prototype.msetnx = function(keys /* ... */, values /* ... */) {
    var key, value;

    for(var i=0, l=arguments.length; i < l; i += 2) {
      if (has(this.hash, arguments[i])) {
        return false;
      }
    }
      
    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];

      if (!has(this.hash, key)) {
        this.hash[key] = { value: value };
      }
    }

    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      this.emit('set ' + key, value);
      this.emit('set', key, value);
      this.emit('setnx ' + key, value);
      this.emit('setnx', key, value);
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('msetnx');
    this.emit.apply(this, args);
    return true;
  };

  //
  // Set the string value of a key
  //
  EventVat.prototype.set = function(key, value, ttl) {
    var that = this;
    
    if(has(this.hash, key)) {
      this.hash[key].value = value;
    }
    else {
      this.hash[key] = { value: value };
    }

    this.persist(key);
    this.expire(key, ttl);
    this.emit('set ' + key, value);
    this.emit('set', key, value);
    return true;
  };

  //
  // Sets or clears the bit at offset in the string value stored at key
  //
  EventVat.prototype.setbit = function(key, offset, value) {
    throw new Error('Not implemented.');
  };

  //
  // Set the value and expiration of a key
  //
  EventVat.prototype.setex = function(key, seconds, value) {
    throw new Error('Not implemented.');
  };

  //
  // Set the value and expiration of a key
  //
  EventVat.prototype.setnx = function(key, value, ttl) {
    if(!has(this.hash, key)) {
      this.set(key, value, ttl);
      this.emit('setnx ' + key, value);
      this.emit('setnx', key, value);
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Set the value of a string within the given range
  //
  EventVat.prototype.setrange = function(key, offset, value) {
    if (has(this.hash, key) && this.type(key) === 'string') {
      var p1 = this.hash[key].value.slice(0, offset);
      var p2 = this.hash[key].value.slice(offset + value.length);
      var newValue = p1 + value + p2;
      var l = newValue.length;

      this.persist(key);
      this.hash.value = newValue;

      this.emit('setrange ' + key, newValue);
      this.emit('setrange', key, newValue);
      return l;
    } else {
      return false;
    }
  };

  //
  // Get the length of the value stored in a key
  //
  EventVat.prototype.strlen = function(key) {
    if(has(this.hash, key) && this.type(key) === 'string') {
      var l = this.hash[key].value.length;
      this.emit('strlen ' + key, l);
      this.emit('strlen', key, l);
      return l;
    }
    return false;
  };

  //
  // HASHES
  // ------
  //

  //
  // delete one or more hash fields
  //
  EventVat.prototype.hdel = function(key, field /* ... */) {
    var n = 0;

    if (this.type(key) === 'hash') {
      for (var i=1, l = arguments.length; i < l; i++) {
        field = arguments[i];
        if (has(this.hash[key].value, field)) {
          delete this.hash[key].value[field];
          this.emit('hdel ' + key, field);
          this.emit('hdel', key, field);
          n++;
        }
      }
    }

    return n;
  };

  //
  // determine if a hash field exists
  //
  EventVat.prototype.hexists = function(key, field) {
    var e = this.type(key) === 'hash' && has(this.hash[key].value, field);
    this.emit('hexists ' + key, field, e);
    this.emit('hexists', key, field, e);
    return e;
  };

  //
  // get the value of a hash field.
  //
  EventVat.prototype.hget = function(key, field) {
    if(this.type(key) === 'hash' && has(this.hash[key].value, field)) {
      var value = this.hash[key].value[field];
      this.emit('hget ' + key, field, value);
      this.emit('hget', key, field, value);
      return value;
    }
    else {
      return false;
    }
  };

  //
  // get all the fields and values in a hash
  //
  EventVat.prototype.hgetall = function(key) {
    var hash = this.type(key) === 'hash' ? this.hash[key].value : {};
    this.emit('hgetall ' + key, hash);
    this.emit('hgetall', key, hash);
    return hash;
  };

  //
  // increment the integer value of a hash field by 1
  //
  EventVat.prototype.hincr = function(key, field) {
    var value = this.hincrby(key, field, 1);
    if (value !== false) {
      this.emit('hincr ' + key, field, value);
      this.emit('hincr', key, field, value);
    }
    return value;
  };

  //
  // increment the integer value of a hash field by the given number
  //
  EventVat.prototype.hincrby = function(key, field, value) {
    value = +value;

    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    }

    if (!has(this.hash[key].value, field)) {
      this.hash[key].value[field] = 0;
    } else if (typeof this.hash[key].value[field] !== 'number') {
      return false;
    }

    var newValue = this.hash[key].value[field] += value;
    this.emit('hincrby ' + key, field, value, newValue);
    this.emit('hincrby', key, field, value, newValue);
    return newValue;
  };

  //
  // decrement the integer value of a hash field by 1
  //
  EventVat.prototype.hdecr = function(key, field) {
    var value = this.hdecrby(key, field, 1);
    if (value !== false) {
      this.emit('hdecr ' + key, field, value);
      this.emit('hdecr', key, field, value);
    }
    return value;
  };

  //
  // decrement the integer value of a hash field by the given number
  //
  EventVat.prototype.hdecrby = function(key, field, value) {
    value = +value;

    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    }

    if (!has(this.hash[key].value, field)) {
      this.hash[key].value[field] = 0;
    } else if (typeof this.hash[key].value[field] !== 'number') {
      return false;
    }

    var newValue = this.hash[key].value[field] -= value;
    this.emit('hdecrby ' + key, field, value, newValue);
    this.emit('hdecrby', key, field, value, newValue);
    return newValue;
  };

  //
  // get all the fields in a hash
  //
  EventVat.prototype.hkeys = function(key) {
    var fields = [];

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          fields.push(k);
        }
      }
    }

    this.emit('hkeys ' + key, fields);
    this.emit('hkeys', key, fields);
    return fields;
  };

  //
  // get the number of fields in a hash
  //
  EventVat.prototype.hlen = function(key) {
    var len = 0;

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          len++;
        }
      }
    }

    this.emit('hlen ' + key, len);
    this.emit('hlen', key, len);
    return len;
  };

  //
  // get the values of all the given hash fields
  //
  EventVat.prototype.hmget = function(key, field /* ... */) {
    var values = [];

    for(var i=1, l=arguments.length; i < l; i++) {
      values.push(this.hget(key, arguments[i]));
    }

    this.emit('hmget ' + key, values);
    this.emit('hmget', key, values);
    return values;
  };

  //
  // set multiple hash fields to multiple values
  //
  EventVat.prototype.hmset = function(key, fields /* ... */, values /* ... */) {
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    }

    for(var i=1, l=arguments.length; i < l; i += 2) {
      this.hash[key].value[arguments[i]] = arguments[i + 1];
    }

    // set events must be emitted after keys are updated
    var field, value;
    for(var i=1, l=arguments.length; i < l; i += 2) {
      field = arguments[i];
      value = arguments[i + 1];
      
      this.emit('hset ' + key, field, value);
      this.emit('hset', key, field, value);
    }

    var args = Array.prototype.slice.call(arguments)
    this.emit.apply(this, ['hmset ' + key].concat(args.slice(1)));
    this.emit.apply(this, ['hmset'].concat(args));
    return true;
  };

  //
  // set the string value of a hash field
  //
  EventVat.prototype.hset = function(key, field, value) {
    var update;
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
      update = false;
    } else if (type === 'hash') {
      update = has(this.hash[key].value, field);
    } else {
      return false;
    }

    this.hash[key].value[field] = value;
    this.emit('hset ' + key, field, value);
    this.emit('hset', key, field, value);

    return update;
  };

  //
  // Set the value of a hash field, only if the field does not exist
  //
  EventVat.prototype.hsetnx = function(key, field, value /* ... */) {
    if (this.type(key) === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    }

    if (!has(this.hash[key].value, field)) {
      this.hset(key, field, value);
      this.emit('hsetnx ' + key, field, value);
      this.emit('hsetnx', key, field, value);
      return true;
    } else {
      return false;
    }
  };

  //
  // get all the values in a hash
  //
  EventVat.prototype.hvals = function(key) {
    var values = [];

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          values.push(hash[k]);
        }
      }
    }

    this.emit('hvals ' + key, values);
    this.emit('hvals', key, values);
    return values;
  };

  //
  //
  // Non stsandard methods.
  //
  //
  EventVat.prototype.dump = function(stringify) {
    
    var dump = {};
    
    for(var key in this.hash) {
      if(has(this.hash, key)) {
        dump[key] = this.hash[key].value;
      }
    }
    
    dump = stringify ? JSON.stringify(dump) : dump;
    
    this.emit('dump', null, dump);
    return dump;
  };

  //
  // swap the values of two keys
  //
  EventVat.prototype.swap = function(a, b, depth) {
    if(has(this.hash, a) && has(this.hash, b)) {
      
      var av = this.hash[a]; 
      var bv = this.hash[b];
      
      if(depth) {
        av = this.hash[a] = [bv, bv = this.hash[b] = av][0];
      }
      else {
        av.value = [bv.value, bv.value = av.value][0];
      }

      this.persist(a);
      this.persist(b);
      this.emit('swap ' + a, b, depth);
      this.emit('swap ' + b, a, depth);
      this.emit('swap', a, b, depth);
      return depth ? [a, b] : [a.value, b.value];
    }
    else {
      return false;
    }

  };

  //
  // check if a value is in a key
  //
  EventVat.prototype.findin = function(key, value) {
    if(has(this.hash, key)) {
      var index = this.hash[key].value.indexOf(value)
      this.emit('findin ' + key, value, index);
      this.emit('findin', key, value, index);
      return index;
    }
    else {
      return false;
    }
  };

  //
  // set the current revision
  //

}((typeof process !== 'undefined' && process.title) ? module : window));
