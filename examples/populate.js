var store = require('../lib/store');
var map = require('../lib/map');

var names = ['John Doe', 'Lisa Simpson', 'Mark Silva', 'Rod Stewart', 'Michael Jackson'];

for (var total=1; total <= 1000; total++) {
  var data = {'name': names[Math.floor(Math.random() * names.length)], 'age': Math.floor(Math.random() * 61) + 20, 'index': total};
  store.save('/tmp/store', data, undefined, function(err, data, jsonData) {
    if (!err) {
      console.log(data.index + ' ' + data._meta.id);
    } else {
      console.log(err);
    }
  });
}
