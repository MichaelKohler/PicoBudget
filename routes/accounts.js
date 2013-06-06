"use strict";

var globals = require('../globals').init();

exports.accounts = function (req, res) {
  globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accountList) {
    if (accountList) {
      globals.accounts.sumBalance(accountList, function (sum) {
        globals.helpers.getAllAvailableCurrencies(globals.db, function (currencyList) {
          if (currencyList) {
            res.render('accounts', { locals: {
              user: req.session.user || '',
              currencies: currencyList,
              accounts: accountList,
              balanceSum: sum,
              formatAmount: globals.helpers.formatAmount,
              accNumber: accountList.length
            }});
          }
        });
      });
    }
  });
};

exports.accountAdded = function (req, res) {
  var accName = req.body.nameInput;
  var accCurrency = req.body.currDropdown;
  var accBalance = req.body.initBalanceInput;
  globals.accounts.addAccount(req.session.user.user, accName, accCurrency, accBalance, globals.db, function (success) {
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
  globals.accounts.editAccount(req.session.user.user, oldName, accName, accBalance, globals.db, function (success) {
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
  globals.accounts.deleteAccount(req.session.user.user, accName, globals.db, function (success) {
    if (success) {
      res.flash('success', 'The account has been deleted.');
    }
    else {
      res.flash('error', 'The account could not be deleted.');
    }
    res.redirect('/accounts');
  });
};
