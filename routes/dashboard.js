"use strict";

var globals = require('../globals').init();

exports.index = function (req, res) {
  globals.transactions.getLimitedTransactions(req.session.user.user, globals.db, 1, 10, function (transactionList) {
    globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accountList) {
      res.render('dashboard', { locals: {
        user: req.session.user || '',
        accounts: accountList,
        transactions: transactionList,
        registeredInfo: req.session.user.isNew
      }});
    });
  });
};
