/* jslint node: true */
"use strict";

var express = require('express');
var server = express();
var users = require('./models/users');
var accounts = require('./models/accounts.js');
var helpers = require('./models/helpers.js');
var transactions = require('./models/transactions.js');
var tags = require('./models/tags.js');

server.configure(function () {
    server.set('port', 1337);
    server.set('dbname', 'pb');
    server.set('dbport', 27017);
    server.set('publicfolder', 'public');
    server.use('/bootstrap', express.static(server.get('publicfolder') + '/bootstrap'));
    server.use('/css', express.static(server.get('publicfolder') + '/css'));
    server.use('/js', express.static(server.get('publicfolder') + '/js'));
    server.set('view engine', 'jade');
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.bodyParser());
    server.use(express.cookieParser('' +  require('crypto').randomBytes(64) + ''));
    server.use(express.session());
});

server.configure('development', function () {
    server.use(express.logger('dev'));
});

server.listen(server.get('port'), function () {
    console.log("Server started on Port " + server.get('port'));
});


/** MongoDB  */
var mongo = require('mongodb');
var MongoServer = mongo.Server;
var MongoDatabase = mongo.Db;
var dbServer = new MongoServer('localhost', server.get('dbport'), { auto_reconnect: true, poolSize: 1 });
var db = new MongoDatabase(server.get('dbname'), dbServer, { safe: true });

db.open(function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to DB.");
    }
});

/** SESSIONS **/
function requiresLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}
function requiresAdminLogin(req, res, next) {
    if (req.session.user.role === 'admin') {
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

var mainsiteRoutes = require('./routes/mainsite.js');
server.get('/', mainsiteRoutes.index);
server.get('/faq', mainsiteRoutes.faq);
server.get('/introduction', mainsiteRoutes.introduction);
server.get('/premium', mainsiteRoutes.premium);
server.get('/about', mainsiteRoutes.about);

var dashboardRoutes = require('./routes/dashboard.js');
server.get('/dashboard', requiresLogin, dashboardRoutes.index);

var accountsRoutes = require('./routes/accounts.js');
server.get('/accounts', requiresLogin, accountsRoutes.accounts);
server.post('/accountAdded', requiresLogin, accountsRoutes.accountAdded);
server.post('/accountEdited', requiresLogin, accountsRoutes.accountEdited);
server.post('/accountDeleted', requiresLogin, accountsRoutes.accountDeleted);

var transactionsRoutes = require('./routes/transactions.js');
server.get('/transactions', requiresLogin, transactionsRoutes.transactions);
server.post('/transactionAdded', requiresLogin, transactionsRoutes.transactionAdded);
server.post('/transactionEdited', requiresLogin, transactionsRoutes.transactionEdited);
server.post('/transactionDeleted', requiresLogin, transactionsRoutes.transactionDeleted);

var tagsRoutes = require('./routes/tags.js');
server.post('/tagDeleted', requiresLogin, tagsRoutes.tagDeleted);

var budgetRoutes = require('./routes/budget.js');
server.get('/budget', requiresLogin, budgetRoutes.budget);

var reportsRoutes = require('./routes/reports.js');
server.get('/reports', requiresLogin, reportsRoutes.reports);

var settingsRoutes = require('./routes/settings.js');
server.get('/settings', requiresLogin, settingsRoutes.settings);
server.post('/settingsChanged', requiresLogin, settingsRoutes.settingsChanged);
server.post('/userDeleted', requiresLogin, settingsRoutes.userDeleted);
