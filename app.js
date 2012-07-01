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
function requiresAdminLogin(req, res, next) {
  if (req.session.user.role == 'admin') {
    next();
  }
  else {
    res.redirect('/login');
  }
}

server.get('/login', function(req, res) {
  if (req.session.user)
    res.render('dashboard');
  else
    res.render('login', { locals: { user: req.session.user || ''} });
});

var users = require('./users');
server.post('/authenticated', function(req, res) {
  users.authenticate(req.body['emailInput'], req.body['passwordInput'], db, function(user) {
     if (user) {
       req.session.user = user;
       res.redirect('/dashboard');
     }
     else {
       res.redirect('/login?wrongCredentials=true');
     }
  });
});
server.post('/registered', function(req, res) {
  users.create(req.body['emailInputReg'], req.body['passwordInputReg'], db, function(user) {
    if (user == "EXISTS") {
      res.redirect('/login?userExists=true');
    }
    else if (user) {
      req.session.user = user;
      res.redirect('/dashboard?registered=true');
      // TODO: send email to the user
    }
    else {
      res.redirect('/login?userNotCreated=true');
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
  res.render('dashboard', { locals: { user: req.session.user || ''} });
});

var accounts = require('./accounts.js');
server.get('/accounts', requiresLogin, function(req, res) {
  accounts.getAllAccounts(req.session.user.username, req.session.user.password,
                          db, function(accountList) {
    if (accountList) {
      accounts.sumBalance(accountList, function(sum) {
        res.render('accounts', { locals: {
          user: req.session.user || '',
          accounts: accountList,
          balanceSum: sum,
          accNumber: accountList.length
        }});
      });
    }
  });
});

server.get('/transactions', requiresLogin, function(req, res) {
  res.render('transactions', { locals: { user: req.session.user || ''} });
});
server.get('/budget', requiresLogin, function(req, res) {
  res.render('budget', { locals: { user: req.session.user || ''} });
});
server.get('/reports', requiresLogin, function(req, res) {
  res.render('reports', { locals: { user: req.session.user || ''} });
});

var globals = require('./globals.js');
server.get('/settings', requiresLogin, function(req, res) {
  globals.getAllAvailableCurrencies(db, function(currencyList) {
    if (currencyList) {
      res.render('settings', { locals: {
        user: req.session.user || '',
        currencies: currencyList,
        changed: false
      }});
    }
  });
});
server.post('/settingsChanged', requiresLogin, function(req, res) {
  var oldPW = req.body['oldPasswordInput'];
  var newPW = req.body['newPasswordInput'];
  var prefCurr = req.body['prefCurrDropdown'];
  if (oldPW != newPW) {
    users.changeSettings(req.session.user.username, oldPW, newPW, prefCurr, db, function(user) {
      if (user) {
        req.session.user = user; // we need to reinit the session because of the new password
        globals.getAllAvailableCurrencies(db, function(currencyList) {
          if (currencyList) {
            res.render('settings', { locals: {
              user: req.session.user || '',
              currencies: currencyList,
              changed: true
            }});
          }
        });
      }
      else {
        res.redirect('/settings?oldPasswordNotOK=true');
      }
    });
  }
});
server.post('/userDeleted', requiresLogin, function(req, res) {
  users.remove(req.session.user.username, req.body["passwordInput"], db, function(removed) {
    if (removed) {
      delete req.session.user;
      res.redirect('/login?removed=true');
    }
    else {
      res.redirect('/settings?removed=false');
    } 
  });
  // TODO: remove other data too!
});
server.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/login?loggedOut=true');
});
