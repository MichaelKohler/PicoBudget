var express = require('express');
var server = express.createServer();

server.configure(function () {
  server.use('/bootstrap', express.static(__dirname + '/bootstrap'));
  server.use('/css', express.static(__dirname + '/css'));
  server.use('/js', express.static(__dirname + '/js'));
  server.use(express.static(__dirname + '/html'));
});
server.set('views', __dirname + '/html');
server.register('.html', require('handlebars'));
server.set('view options', { layout: false });

server.listen(1337);
console.log('Express server started on port %s', server.address().port);

/* ROUTERS ****************/
/**************************/
server.get('/home', function(req, res) {
  res.render('index.html');
});

server.get('/login', function(req, res) {
  res.render('login.html');
});

server.get('/faq', function(req, res) {
  res.render('faq.html');
});

server.get('/introduction', function(req, res) {
  res.render('introduction.html');
});

server.get('/premium', function(req, res) {
  res.render('premium.html');
});

server.get('/about', function(req, res) {
  res.render('about.html');
});

server.get('/dashboard', function(req, res) {
  res.render('dashboard.html');
});

server.get('/accounts', function(req, res) {
  res.render('accounts.html');
});

server.get('/transactions', function(req, res) {
  res.render('transactions.html');
});

server.get('/budget', function(req, res) {
  res.render('budget.html');
});

server.get('/reports', function(req, res) {
  res.render('reports.html');
});

server.get('/settings', function(req, res) {
  res.render('settings.html');
});

server.get('/logout', function(req, res) {
  // TODO: logout
  res.render('login.html');
});
