var sys = require('sys');
var fs = require('./node-fs/lib/fs');
var uuid = require('./uuid');
var map = require('./map');

var generateHash = function (uuid, levels, size) {
  var hash = [], pos = 0;
  levels = levels || 3;
  size = size || 2;
  for (var i = 0; i < size * levels; i += size) {
    hash[pos++] = uuid.slice(i, i + size);
  }
  return hash;
}

var index = function(store, id, location) {
  var fd = fs.openSync(store + '/_index', 'a', 0600);
  fs.writeSync(fd, JSON.stringify([id, location]) + "\n", undefined, undefined, undefined);
  fs.closeSync(fd);
}

exports.save = function(store, data, meta, callback) {
  meta = meta || {};
  if (!meta.id) {
    // generate uuid
    meta.id = uuid.generate(32, 16);
  }

  // generate hash
  meta.hash = generateHash(meta.id, 3);
  meta.store = store + '/' + meta.hash.join('/');
  meta.file = meta.store + '/' + meta.id;

  data._meta = meta;

  var jsonData = JSON.stringify(data);

  // create folder
  fs.mkdir(meta.store, 0700, true, function(err) {
    if (!err) {
      fs.writeFile(meta.file, jsonData, function(err) {
        if (!err && callback) {
          // write information on the index
          index(store, meta.id, meta.file);
          callback(err, data, jsonData);
        }
      })
    } else {
      if (callback) {
        callback(err);
      }
    }
  });
}

mmap_file = function(file) {
  fd = fs.openSync(file, 'r');
  size = fs.fstatSync(fd).size;
  buffer = new mmap.Buffer(size, mmap.PROT_READ, mmap.MAP_PRIVATE, fd, 0);
  fs.close(fd);
  var s = '';
  for (var i=0; i<size; i++) {
    s += chr(buffer[i]);
  }
  buffer = undefined;
  return s;
}

exports.view = function(store, limit, map_fun, reduce_fun) {
  var out_fd = fs.openSync('out', 'w', 0600);
  var all_data = {};
  var data = undefined;
  map.run(store, limit, function(meta) {
    if (2 == meta.length) {
      data = JSON.parse(fs.readFileSync(meta[1]));
      map_fun(data);

      if (undefined != map.data) {
        if (undefined != reduce_fun) {
          for (var key in map.data) { }
          all_data[key] = all_data[key] || [];
          all_data[key].push(map.data[key]);
        } else {
          fs.write(out_fd, JSON.stringify(map.data) + "\n", undefined, undefined, undefined);
          console.log(map.data);
        }
        map.data = undefined;
      }
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