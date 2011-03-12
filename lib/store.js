var sys = require('sys');
var fs = require('./node-fs/lib/fs');
var uuid = require('./uuid');
var map = require('./map');
var index_fds = {};

var generateHash = function (uuid, levels, size) {
  var hash = [], pos = 0;
  levels = levels || 3;
  size = size || 2;
  for (var i = 0; i < size * levels; i += size) {
    hash[pos++] = uuid.slice(i, i + size);
  }
  return hash;
}

write = function(store, meta, jsonData, callback) {
  var buffer = new Buffer(Buffer.byteLength(jsonData));
  buffer.write(jsonData, 0);  
  fs.writeFile(meta.file, buffer, function(err) {
    if (null == err) {
      // write information on the index
      fs.write(index_fds[store], JSON.stringify([meta.id, meta.file]) + "\n", undefined, undefined, function(err, written) {
        if (callback) {
          callback(err);
        }       
      });
    } else {
      if (24 == err.errno || 2 == err.errno) {
        process.nextTick(function() {
          write(store, meta, jsonData, callback);
        });
      } else {
        throw err;
      }
    }
  });
}

read = function(file, callback) {
  fs.readFile(file, function(err, data) {
    if (!err) {
      callback(data);
    } else {
      if (err.errno == 24 || err.errno == 2) {
        setTimeout(read, 100, file, callback);
      } else {
        throw err;
      }      
    }
  });
}

exports.open = function(store) {
  fs.mkdirSync(store, 0700);
  index_fds[store] = fs.openSync(store + '/_index', 'a', 0600);    
}

exports.close = function(store) {
  fs.closeSync(index_fds[store]);
  index_fds[store] = undefined;
}

exports.save = function(store, data, meta, callback) {
  if (undefined == index_fds[store]) {
    exports.open(store);
  }
  meta = meta || {};
  // generate uuid
  meta.id = meta.id || uuid.generate(32, 16);

  // generate hash
  meta.hash = generateHash(meta.id, 2);
  meta.store = store + '/' + meta.hash.join('/');
  meta.file = meta.store + '/' + meta.id;

  data._meta = meta;

  var jsonData = JSON.stringify(data);

  // create folder
  fs.mkdir(meta.store, 0700, true, function(err) {
    write(store, meta, jsonData, function(err) {
        callback(err, data, jsonData);
    });
  });
}

exports.view = function(store, limit, map_fun, reduce_fun) {
  var all_data = {};
  var data = undefined;
  var d = [];
  map.run(store, limit, function(meta) {
    if (2 == meta.length) {
      data = JSON.parse(fs.readFileSync(meta[1]));
//      read(meta[1], function(data) {
//        data = JSON.parse(data);

      map_fun(data);

      if (undefined != map.data) {
        if (undefined != reduce_fun) {
          for (var key in map.data) { }
          all_data[key] = all_data[key] || [];
          all_data[key].push(map.data[key]);
        } else {
          console.log(map.data);
        }
        map.data = undefined;
      }
//    });
    }
  });
  if (undefined != reduce_fun) {
    var reduce_results = [];
    for (var key in all_data) {
      var single_result = {};
      single_result[key] = reduce_fun(key, all_data[key]);
      reduce_results.push(single_result);
    }
    console.log(reduce_results);
  }
}
