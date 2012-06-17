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
server.use(express.bodyParser());
server.use(express.cookieParser({ secret: "keyboard cat" }));
var memStore = require('connect').session.MemoryStore;
server.use(express.session({ secret: "keyboard cat", store: memStore( {
  reapInterval: 60000 * 10
})}));

server.listen(1337);
console.log('Express server started on port %s', server.address().port);

/** SESSIONS **/
function requiresLogin(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    res.redirect('/login?redir=' + req.url);
  }
}

var pseudoUsers = require('./users');

server.get('/login', function(req, res) {
  res.render('login.html');
});
server.post('/authenticated', function(req, res) {
  pseudoUsers.authenticate(req.body['emailInput'], req.body['passwordInput'], function(user) {
     if (user) {
       req.session.user = user;
       res.redirect('/dashboard');
     }
     else {
       res.redirect('/login?wrongCredentials=true');
     }
  });
});

/* ROUTERS ****************/
/**************************/
server.get('/home', function(req, res) {
  res.render('index.html');
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
server.get('/dashboard', requiresLogin, function(req, res) {
  res.render('dashboard.html');
});
server.get('/accounts', requiresLogin, function(req, res) {
  res.render('accounts.html');
});
server.get('/transactions', requiresLogin, function(req, res) {
  res.render('transactions.html');
});
server.get('/budget', requiresLogin, function(req, res) {
  res.render('budget.html');
});
server.get('/reports', requiresLogin, function(req, res) {
  res.render('reports.html');
});
server.get('/settings', requiresLogin, function(req, res) {
  res.render('settings.html');
});
server.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/login?loggedOut=true');
});
