'use strict';

var globals = require('../globals');

exports.accounts = function (req, res) {
  globals.accounts.getAllAccounts(req.session.user.user, function (accountList) {
    if (accountList) {
      var sum = globals.helpers.sumAccountBalance(accountList);
      var locals = {};
      locals.user = req.session.user || '';
      locals.accounts = accountList;
      locals.balanceSum = sum;
      res.render('accounts', locals);
    }
  });
};

exports.accountOverview = function (req, res) {
  var transpage = parseInt(req.params.transpage, 10);
  var limit = 10;
  var locals = { user: req.session.user || '' };
  globals.async.parallel([
    function getAccount(callback) {
      globals.accounts.getAccount(req.session.user.user, req.params.name, function (account) {
        locals.account = account;
        callback();
      });
    },
    function getTransByAccount(callback) {
      globals.transactions.getTransactionsByAccount(req.session.user.user, req.params.name, function (allTransactionsList) {
        locals.transactions = allTransactionsList;
        locals.page = transpage;
        locals.needsMorePages = (allTransactionsList.length - transpage * limit > 0);
        callback();
      });
    }
  ], function (err) {
    res.render('account', locals);
  });
};

exports.accountAdded = function (req, res) {
  var accName = globals.helpers.sanitizeForJSON(req.body.nameInput);
  var accCurrency = globals.helpers.sanitizeForJSON(req.body.currDropdown);
  var accBalance = globals.helpers.sanitizeForJSON(req.body.initBalanceInput);
  var newAccount = globals.accounts.Account.initFull(accName, accCurrency, accBalance);
  globals.accounts.addAccount(req.session.user.user, newAccount, function (success) {
    if (success) {
      res.flash('success', 'The account has been added.');
    }
    else {
      res.flash('error', 'The account could not be added.');
    }
    res.redirect('/accounts');
  });
};

exports.accountEdited = function (req, res) {
  var oldName = globals.helpers.sanitizeForJSON(req.body.hiddenOldName);
  var accName = globals.helpers.sanitizeForJSON(req.body.editNameInput);
  var accBalance = globals.helpers.sanitizeForJSON(req.body.editInitBalanceInput);
  var editedAccount = globals.accounts.Account.init(accName, accBalance);
  globals.accounts.editAccount(req.session.user.user, oldName, editedAccount, function (success) {
    if (success) {
      res.flash('success', 'The account has been updated.');
    }
    else {
      res.flash('error', 'The account could not be updated.');
    }
    res.redirect('/accounts');
  });
};

exports.accountDeleted = function (req, res) {
  var accName = globals.helpers.sanitizeForJSON(req.body.deleteNameInput);
  globals.accounts.deleteAccount(req.session.user.user, accName, function (success) {
    if (success) {
      res.flash('success', 'The account has been deleted.');
    }
    else {
      res.flash('error', 'The account could not be deleted.');
    }
    res.redirect('/accounts');
  });
};
