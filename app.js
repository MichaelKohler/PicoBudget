var express = require('express');
var server = express.createServer();

server.configure(function () {
  server.use('/bootstrap', express.static(__dirname + '/bootstrap'));
  server.use('/js', express.static(__dirname + '/js'));
  server.use(express.static(__dirname + '/html'));
});

server.listen(1337);

