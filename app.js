var express = require('express');
var server = express.createServer();
var accounts = require('./accounts.js');
var globals = require('./globals.js');
var transactions = require('./transactions.js');
var tags = require('./tags.js');

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

/* ROUTES ****************/
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
  accounts.getAllAccounts(req.session.user.username, db, function(accountList) {
    res.render('dashboard', { locals: {
      user: req.session.user || '',
      accounts: accountList,
      accNumber: accountList.length
    }});
  });
});

server.get('/accounts', requiresLogin, function(req, res) {
  accounts.getAllAccounts(req.session.user.username, db, function(accountList) {
    if (accountList) {
      accounts.sumBalance(accountList, function(sum) {
        globals.getAllAvailableCurrencies(db, function(currencyList) {
          if (currencyList) {
            res.render('accounts', { locals: {
              user: req.session.user || '',
              currencies: currencyList,
              accounts: accountList,
              balanceSum: globals.formatBalance(sum),
              accNumber: accountList.length
            }});
          }
        });
      });
    }
    // TODO: ELSE??
  });
});

server.post('/accountAdded', requiresLogin, function(req, res) {
  var accName = req.body['nameInput'];
  var accCurrency = req.body['currDropdown'];
  var accBalance = req.body['initBalanceInput'];
  accounts.addAccount(req.session.user.username, accName, accCurrency, accBalance, db, function(success) {
    if (success) {
      res.redirect('/accounts?accountAdded=true');
    }
    else if (success == "EXISTS") {
      res.redirect('/accounts?accountAlreadyExists=true');
    }
  });
});

server.post('/accountEdited', requiresLogin, function(req, res) {
  var oldName = req.body['hiddenOldName'];
  var accName = req.body['editNameInput'];
  var accBalance = req.body['editInitBalanceInput'];
  accounts.editAccount(req.session.user.username, oldName, accName, accBalance, db, function(success) {
    if (success) {
      res.redirect('/accounts?accountEdited=true');
    }
    else {
      res.redirect('/accounts?notEdited=true');
    }
  });
});

server.post('/accountDeleted', requiresLogin, function(req, res) {
  var accName = req.body['deleteNameInput'];
  accounts.deleteAccount(req.session.user.username, accName, db, function(success) {
    if (success) {
      res.redirect('/accounts?accountDeleted=true');
    }
    else {
      res.redirect('/accounts?notDeleted=true');
    }
  });
});

server.get('/transactions', requiresLogin, function(req, res) {
  transactions.getAllTransactions(req.session.user.username, db, function(transactionList) {
    if (transactionList) {
      tags.getAllTags(req.session.user.username, db, function(tagList) {
        if (tagList) {
          accounts.getAllAccounts(req.session.user.username,db, function(accList) {
            if (accList) {
              res.render('transactions', { locals: {
                user: req.session.user || '',
                transactions: transactionList,
                tags: tagList,
                accounts: accList
              }});
            }
          });
        }
      }); 
    }
    // TODO: ELSE??
  });
});

server.post('/transactionAdded', requiresLogin, function(req, res) {
  var transID = req.body['transIDInput'];
  var transAcc = req.body['transAccDropdown'];
  var transArt = req.body['transArtInput'];
  var transName = req.body['transNameInput'];
  var transTags = req.body['transTags'].split(',');
  var transAmount = req.body['transAmount'];
  transactions.addTransaction(req.session.user.username, transID, transAcc, transArt, transName,
                              transTags, transAmount, db, function(success) {
    success ? res.redirect('/transactions?added=true') : res.redirect('/transactions?added=false');
  });
});

server.post('/transactionEdited', requiresLogin, function(req, res) {
  var transID = req.body['transID'];
  var transArt = req.body['transArtEditInput'];
  var transOldName = req.body['transOldName'];
  var transName = req.body['transNameEditInput'];
  var transTags = req.body['transTagsEdit'];
  var transAmount = req.body['transEditAmount'];
  transactions.editTransaction(req.session.user.username, transID, transArt, transName,
                               transTags, transAmount, db, function(successTrans) {
    tags.addTags(req.session.user.username, transTags.split(','), db, function(successTags) {
      successTrans ? res.redirect('/transactions?edited=true') : res.redirect('/transactions?edited=false');
    });
  });
});

server.post('/transactionDeleted', requiresLogin, function(req, res) {
  var transID = req.body['transID'];
  transactions.removeTransaction(req.session.user.username, transID, db, function(success) {
    success ? res.redirect('/transactions?deleted=true') : res.redirect('/transactions?deleted=false');
  });
});

server.post('/tagDeleted', requiresLogin, function(req, res) {
  var tagName = req.body['tagNameInput'];
  tags.removeTag(req.session.user.username, tagName, db, function(success) {
    success ? res.redirect('/transactions?tagDeleted=true') : res.redirect('/transactions?tagDeleted=false');
  });
});

server.get('/budget', requiresLogin, function(req, res) {
  res.render('budget', { locals: { user: req.session.user || ''} });
});

server.get('/reports', requiresLogin, function(req, res) {
  res.render('reports', { locals: { user: req.session.user || ''} });
});

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

  users.changeSettings(req.session.user.username, oldPW, newPW, prefCurr, db, function(changed) {
    if (changed == "NOPWMATCH") {
      res.redirect('/settings?passwordsDidntMatch=true');
    }
    else if (changed) {
      req.session.user = changed; // we need to reinit the session because of the new password
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
      res.redirect('/settings?unknownError=true');
    }    
  });
});

server.post('/userDeleted', requiresLogin, function(req, res) {
  users.removeUser(req.session.user.username, req.body["passwordInput"], db, function(removed) {
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
