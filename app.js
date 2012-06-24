var express = require('express');
var server = express.createServer();

server.configure(function () {
  server.use('/bootstrap', express.static(__dirname + '/bootstrap'));
  server.use('/css', express.static(__dirname + '/css'));
  server.use('/js', express.static(__dirname + '/js'));
});
server.set('view engine', 'jade');
server.set('views', __dirname + '/views');
server.set('view options', { layout: false });
server.use(express.bodyParser());
server.use(express.cookieParser({ secret: "keyboard cat" }));
var memStore = require('connect').session.MemoryStore;
server.use(express.session({ secret: "keyboard cat", store: memStore( {
  reapInterval: 60000 * 10
})}));

server.listen(1337);
console.log('Express server started on port %s', server.address().port);

/** MongoDB  */
var mongo = require('mongodb');
var MongoServer = mongo.Server;
var MongoDatabase = mongo.Db;
var dbServer = new MongoServer('localhost', 27017, {auto_reconnect: true, poolSize: 1 })
var db = new MongoDatabase('mydb', dbServer)

db.open(function(err, db){
  if(err) console.log(err);
});

/** SESSIONS **/
function requiresLogin(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    res.redirect('/login');
  }
}

var pseudoUsers = require('./users');

server.get('/login', function(req, res) {
  res.render('login', { locals: { user: req.session.user || ''} });
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
server.get('/', function(req, res) {
  res.render('index', { locals: { user: req.session.user || ''} });
});
server.get('/home', function(req, res) {
  res.render('index', { locals: { user: req.session.user || ''} });
});
server.get('/faq', function(req, res) {
  res.render('faq', { locals: { user: req.session.user || ''} });
});
server.get('/introduction', function(req, res) {
  res.render('introduction', { locals: { user: req.session.user || ''} });
});
server.get('/premium', function(req, res) {
  res.render('premium', { locals: {user: req.session.user || ''} });
});
server.get('/about', function(req, res) {
  res.render('about', { locals: { user: req.session.user || ''} });
});
server.get('/dashboard', requiresLogin, function(req, res) {
  res.render('dashboard');
});
server.get('/accounts', requiresLogin, function(req, res) {
  res.render('accounts');
});
server.get('/transactions', requiresLogin, function(req, res) {
  res.render('transactions');
});
server.get('/budget', requiresLogin, function(req, res) {
  res.render('budget');
});
server.get('/reports', requiresLogin, function(req, res) {
  res.render('reports');
});
server.get('/settings', requiresLogin, function(req, res) {
  res.render('settings');
});
server.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/login?loggedOut=true');
});
server.get('/admin_dashboard', requiresLogin, function(req, res) {
  res.render('admin_dashboard');
});
server.get('/admin_users', requiresLogin, function(req, res) {
  res.render('admin_users');
});
server.get('/admin_pricing', requiresLogin, function(req, res) {
  res.render('admin_pricing');
});
