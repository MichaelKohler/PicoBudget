"use strict";

var globals = require('../globals').init();

exports.accounts = function (req, res) {
  globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accountList) {
    if (accountList) {
      var sum = globals.helpers.sumAccountBalance(accountList);
      res.render('accounts', { locals: {
        user: req.session.user || '',
        currencies: globals.currencies,
        accounts: accountList,
        balanceSum: sum
      }});
    }
  });
};

exports.accountAdded = function (req, res) {
  var accName = req.body.nameInput;
  var accCurrency = req.body.currDropdown;
  var accBalance = req.body.initBalanceInput;
  var newAccount = globals.accounts.Account.initFull(accName, accCurrency, accBalance);
  globals.accounts.addAccount(req.session.user.user, globals.db, newAccount, function (success) {
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
  var oldName = req.body.hiddenOldName;
  var accName = req.body.editNameInput;
  var accBalance = req.body.editInitBalanceInput;
  var editedAccount = globals.accounts.Account.init(accName, accBalance);
  globals.accounts.editAccount(req.session.user.user, globals.db, oldName, editedAccount, function (success) {
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
  var accName = req.body.deleteNameInput;
  globals.accounts.deleteAccount(req.session.user.user, globals.db, accName, function (success) {
    if (success) {
      res.flash('success', 'The account has been deleted.');
    }
    else {
      res.flash('error', 'The account could not be deleted.');
    }
    res.redirect('/accounts');
  });
};
