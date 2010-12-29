var store = require('../lib/store');
var map = require('../lib/map');

store.view('/tmp/store', undefined,
  function(data) {
    map.emit(data._meta.id, data);
  }
);