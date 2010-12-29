var store = require('../lib/store');
var map = require('../lib/map');

store.view('/tmp/store', undefined,
  function(data) {
    map.emit(data.name, 1);
  }
,
  function(key, values) {
    return values.sum();
  }
);