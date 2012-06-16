var express = require('express');
var server = express.createServer();

server.configure(function () {
  server.use('/bootstrap', express.static(__dirname + '/bootstrap'));
  server.use('/js', express.static(__dirname + '/js'));
  server.use(express.static(__dirname + '/html'));
});
server.set('views', __dirname + '/html');
server.register('.html', require('handlebars'));
server.set('view options', { layout: false });

server.listen(1337);
console.log('Express server started on port %s', server.address().port);

/*server.get('/about', function(req, res) {
  res.render('blubb.html');
});*/
