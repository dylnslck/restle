var express = require('express');
var app = express();
var port = 3000;

app.use(express.static(__dirname + '/site/public'));
app.listen(port);
console.log('Site hosted at port', port);
