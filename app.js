(function () {
  'use strict';

  var globals = require('./globals');

  globals.db.open(function (err, db) {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to DB on port 27017.');
    }
  });

  var express = require('express');
  var server = express();
  var flashify = require('flashify');

  server.configure(function () {
    server.set('port', 1337);
    server.set('publicfolder', 'public');
    server.use('/bootstrap', express.static(server.get('publicfolder') + '/bootstrap'));
    server.use('/css', express.static(server.get('publicfolder') + '/css'));
    server.use('/js', express.static(server.get('publicfolder') + '/js'));
    server.use('/webapp', express.static(server.get('publicfolder') + '/webapp'));
    server.set('view engine', 'jade');
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.bodyParser());
    server.use(express.cookieParser('' + require('crypto').randomBytes(64) + ''));
    server.use(express.session());
    server.use(flashify);
  });

  server.configure('development', function () {
    server.use(express.logger('dev'));
  });

  server.listen(server.get('port'), function () {
    console.log('Server started on Port ' + server.get('port'));
  });

  server.get('/webapp/*.webapp', function (req, res, next) {
    res.contentType('application/x-web-app-manifest+json');
    next();
  });

  /** SESSIONS **/
  function requiresLogin(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  }

  /** ROUTES **/
  var authenticationRoutes = require('./routes/authentication.js');
  server.get('/login', authenticationRoutes.login);
  server.post('/authenticated', authenticationRoutes.authenticated);
  server.post('/registered', authenticationRoutes.registered);
  server.get('/logout', authenticationRoutes.logout);
  server.get('/activate/:code', authenticationRoutes.activated);
  server.get('/forgotPassword', authenticationRoutes.forgotPassword);
  server.post('/resetPassword', authenticationRoutes.sendResetPasswordMail);
  server.get('/newPassword/:code', authenticationRoutes.newPassword);
  server.post('/savePassword', authenticationRoutes.saveNewPassword);

  var mainsiteRoutes = require('./routes/mainsite.js');
  server.get('/', mainsiteRoutes.index);
  server.get('/introduction', mainsiteRoutes.introduction);

  var dashboardRoutes = require('./routes/dashboard.js');
  server.get('/dashboard', requiresLogin, dashboardRoutes.index);

  var accountsRoutes = require('./routes/accounts.js');
  server.get('/accounts', requiresLogin, accountsRoutes.accounts);
  server.post('/accountAdded', requiresLogin, accountsRoutes.accountAdded);
  server.post('/accountEdited', requiresLogin, accountsRoutes.accountEdited);
  server.post('/accountDeleted', requiresLogin, accountsRoutes.accountDeleted);
  server.get('/account/:name/:transpage', requiresLogin, accountsRoutes.accountOverview);

  var transactionsRoutes = require('./routes/transactions.js');
  server.get('/transactions/:transpage(\\d+)', requiresLogin, transactionsRoutes.transactions);
  server.post('/transactionAdded', requiresLogin, transactionsRoutes.transactionAdded);
  server.post('/transferAdded', requiresLogin, transactionsRoutes.transferAdded);

  var tagsRoutes = require('./routes/tags.js');
  server.post('/tagAdded', requiresLogin, tagsRoutes.tagAdded);
  server.post('/tag/delete/:tagname/:tagtype', requiresLogin, tagsRoutes.tagDeleted);
  server.get('/tag/:tagname/:tagtype/:transpage(\\d+)', requiresLogin, tagsRoutes.tagOverview);

  var budgetRoutes = require('./routes/budget.js');
  server.get('/budget', requiresLogin, budgetRoutes.budget);
  server.post('/updateBudget', requiresLogin,  budgetRoutes.update);

  var reportsRoutes = require('./routes/reports.js');
  server.get('/reports', requiresLogin, reportsRoutes.reports);

  var settingsRoutes = require('./routes/settings.js');
  server.get('/settings', requiresLogin, settingsRoutes.settings);
  server.post('/settingsChanged', requiresLogin, settingsRoutes.settingsChanged);
  server.post('/userDeleted', requiresLogin, settingsRoutes.userDeleted);
  server.get('/exportAll', requiresLogin, settingsRoutes.exportAll);

  server.locals({
    functions : {
      formatAmount: globals.helpers.formatAmount
    },
    data : {
      currencies: globals.currencies
    }
  });
}());