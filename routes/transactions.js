'use strict';

var globals = require('../globals').init();

exports.transactions = function (req, res) {
  var transpage = parseInt(req.params.transpage, 10);
  var locals = { user: req.session.user || '', page: transpage };
  var limit = 10;
  globals.async.parallel([
    function getAllTrans(callback) {
      globals.transactions.getAllTransactions(req.session.user.user, globals.db, function(allTransactionsList) {
        if (!allTransactionsList) { return callback(null); }
        locals.transactions = allTransactionsList.slice(transpage*limit-limit, transpage*limit);
        locals.needsMorePages = (allTransactionsList.length - transpage * 10 > 0);
        callback();
      });
    },
    function getAllTags(callback) {
      globals.tags.getAllTags(req.session.user.user, globals.db, function (tagList) {
        if (!tagList) { return callback(null); }
        locals.tags = tagList;
        callback();
      });
    },
    function getAllAccounts(callback) {
      globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accList) {
        if (!accList) { return callback(null); }
        locals.accounts = accList;
        callback();
      });
    }
  ], function (err) {
    if (err) {
      res.redirect('/dashboard');
    }
    else {
      res.render('transactions', locals);
    }
  });
};

exports.transactionAdded = function (req, res) {
  var transID = parseInt(req.body.lastTransIDInput, 10) + 1;
  var transAcc = req.body.transAccDropdown;
  var transType = req.body.transArtDropdown;
  var transName = req.body.transNameInput;
  var transTags = req.body.transTagsInput.split(' ');
  var transAmount = parseFloat(req.body.transAmountInput);
  var newTransaction = globals.transactions.Transaction.init(transID, transAcc, transType, transName, transTags, transAmount);
  globals.async.series([
    function addTransaction(callback) {
      globals.transactions.addTransaction(req.session.user.user, newTransaction, globals.db, function (success) {
        success ? callback() : callback({err: 'We could not add the transaction.'});
      });
    },
    function setBalance(callback) {
      globals.accounts.setBalanceForTransaction(req.session.user.user, globals.db, newTransaction, function(success) {
        success ? callback() : callback({err: 'We could not set the new balance.'});
      });
    }
  ], function (err) {
    if (err) {
      res.flash('error', 'Unfortunately there was an error while adding your transaction! Please try again later.');
    }
    else {
      res.flash('success', 'The transaction has been added successfully!');
    }
    res.redirect('/transactions/1');
  });
};

exports.transferAdded = function (req, res) {
  var transID = parseInt(req.body.lastTransIDInput, 10) + 1;
  var transFromAcc = req.body.transAccFromDropdown;
  var transToAcc = req.body.transAccToDropdown;
  var transAmount = parseFloat(req.body.transferAmountInput);
  var newTransfer = globals.transactions.Transaction.initTransfer(transID, transFromAcc, transToAcc, transAmount);
  globals.async.series([
    function addTransfer(callback) {
      globals.transactions.addTransfer(req.session.user.user, newTransfer, globals.db, function (success) {
        success ? callback() : callback({err: 'We could not add the transfer.'});
      });
    },
    function setBalance(callback) {
      globals.accounts.setBalanceForTransfer(req.session.user.user, globals.db, newTransfer, function(success) {
        success ? callback() : callback({err: 'We could not set the new balance.'});
      });
    }
  ], function (err) {
    if (err) {
      res.flash('error', 'Unfortunately there was an error while adding your transfer: ' + err.err);
    }
    else {
      res.flash('success', 'The transfer has been added successfully!');
    }
    res.redirect('/transactions/1');
  });
};
