
var limit = require('../filter/limitTotal.js');

var obj = limit();

var data = {
  data: [
    {
      id: 1,
      msg: 'xxx'
    }
  ]
}

for (var i = 0; i< 20; i++) {
  obj.process(data);
}

