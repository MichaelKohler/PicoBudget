'use strict';

var globals = require('../globals');

exports.index = function (req, res) {
    var locals = { user: req.session.user || '', registeredInfo: req.session.user.isNew };
    locals.pagetitle = 'Dashboard - ' + globals.titleAddition;
    globals.async.parallel([
        function getLimitedTransactions(callback) {
            globals.transactions.getLimitedTransactions(req.session.user.user, 1, 10, function (transactionList) {
                locals.transactions = transactionList;
                callback();
            });
        },
        function getAllAccounts(callback) {
            globals.accounts.getAllAccounts(req.session.user.user, req.session.user.curr, function (accountList) {
                locals.accounts = accountList;
                callback();
            });
        }
    ], function (err) {
        res.render('dashboard', locals);
    });
};
