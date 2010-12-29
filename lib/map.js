var fs = require('./node-fs/lib/fs');
var flr = require('./FileLineReader');

Array.prototype.sum = function() {
  return (! this.length) ? 0 : this.slice(1).sum() +
      ((typeof this[0] == 'number') ? this[0] : 0);
};

exports.run = function(store, limit, callback) {
  var reader = new flr.FileLineReader(store + '/_index');
  while ((limit && limit > 0 || !limit) && reader.hasNextLine()) {
    callback(JSON.parse(reader.nextLine()));
    limit--;
  }
}

exports.data = undefined;
exports.emit = function(keys, values, callback) {
  exports.data = {};
  exports.data[keys] = values;
  if (callback) callback(exports.data);
}
