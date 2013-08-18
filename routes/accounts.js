'use strict';

var globals = require('../globals');

exports.accounts = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Accounts - ' + globals.titleAddition;
  locals.editmode = globals.helpers.sanitize(req.query.editAccount || '');
  if (locals.editmode !== '') {
    locals.editname = globals.helpers.sanitize(req.query.n || '');
    locals.editbalance = globals.helpers.sanitize(req.query.b || '');
  }
  if (locals.deletemode !== '') {
    locals.deletename = globals.helpers.sanitize(req.query.n || '');
  }
  locals.deletemode = globals.helpers.sanitize(req.query.deleteAccount || '');
  globals.accounts.getAllAccounts(req.session.user.user, function (accountList) {
    if (accountList) {
      locals.accounts = accountList;
      globals.helpers.sumAccountBalance(accountList, req.session.user.curr, function (sum) {
        locals.balanceSum = sum;
        res.render('accounts', locals);
      });
    }
  });
};

exports.accountOverview = function (req, res) {
  var transpage = parseInt(globals.helpers.sanitize(req.params.transpage), 10);
  var name = globals.helpers.sanitize(req.params.name);
  var limit = 10;
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Account overview - ' + globals.titleAddition;
  globals.async.parallel([
    function getAccount(callback) {
      globals.accounts.getAccount(req.session.user.user, name, function (account) {
        locals.account = account;
        callback();
      });
    },
    function getTransByAccount(callback) {
      globals.transactions.getTransactionsByAccount(req.session.user.user, name, function (allTransactionsList) {
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
  var accName = globals.helpers.sanitize(req.body.nameInput);
  var accCurrency = globals.helpers.sanitize(req.body.currDropdown);
  var accBalance = globals.helpers.sanitize(req.body.initBalanceInput);
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
  var oldName = globals.helpers.sanitize(req.body.hiddenOldName);
  var accName = globals.helpers.sanitize(req.body.editNameInput);
  var accBalance = globals.helpers.sanitize(req.body.editInitBalanceInput);
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
  var accName = globals.helpers.sanitize(req.body.deleteNameInput);
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
