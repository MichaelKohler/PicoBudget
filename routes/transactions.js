'use strict';

var globals = require('../globals');

exports.transactions = function (req, res) {
  var transpage = parseInt(req.params.transpage, 10);
  var locals = { user: req.session.user || '', page: transpage };
  var limit = 10;
  globals.async.parallel([
    function getAllTrans(callback) {
      globals.transactions.getAllTransactions(req.session.user.user, function(allTransactionsList) {
        if (!allTransactionsList) { return callback(null); }
        locals.transactions = allTransactionsList.slice(transpage*limit-limit, transpage*limit);
        locals.needsMorePages = (allTransactionsList.length - transpage * 10 > 0);
        callback();
      });
    },
    function getAllTags(callback) {
      globals.tags.getAllTags(req.session.user.user, function (tagList) {
        if (!tagList) { return callback(null); }
        locals.tags = tagList;
        callback();
      });
    },
    function getAllAccounts(callback) {
      globals.accounts.getAllAccounts(req.session.user.user, function (accList) {
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
  var transID = parseInt(globals.helpers.sanitizeForJSON(req.body.lastTransIDInput), 10) + 1;
  var transAcc = globals.helpers.sanitizeForJSON(req.body.transAccDropdown);
  var transType = globals.helpers.sanitizeForJSON(req.body.transArtDropdown);
  var transName = globals.helpers.sanitizeForJSON(req.body.transNameInput);
  var transTags = globals.helpers.sanitizeForJSON(req.body.transTagsInput).split(' ');
  var transAmount = parseFloat(globals.helpers.sanitizeForJSON(req.body.transAmountInput));
  var newTransaction = globals.transactions.Transaction.init(transID, transAcc, transType, transName, transTags, transAmount);
  globals.async.series([
    function addTransaction(callback) {
      globals.transactions.addTransaction(req.session.user.user, newTransaction, function (success) {
        success ? callback() : callback({err: 'We could not add the transaction.'});
      });
    },
    function setBalance(callback) {
      globals.accounts.setBalanceForTransaction(req.session.user.user, newTransaction, function(success) {
        success ? callback() : callback({err: 'We could not set the new balance.'});
      });
    },
    function addTagsToDB(callback) {
      globals.async.forEach(transTags, function(tag, callback) {
        globals.tags.saveTag(req.session.user.user, tag, transType, function (success) {
          success ? callback() : callback({err: 'We could not save a tag.'});
        });
      }, function (err) {
        err ? callback({err: 'We could not save all new tags.'}) : callback();
      });
    }
  ], function (err) {
    if (err) {
      res.flash('error', 'Unfortunately there was an error while adding your transaction: ' + err.err);
    }
    else {
      res.flash('success', 'The transaction has been added successfully!');
    }
    res.redirect('/transactions/1');
  });
};

exports.transferAdded = function (req, res) {
  var transID = parseInt(globals.helpers.sanitizeForJSON(req.body.lastTransIDInput), 10) + 1;
  var transFromAcc = globals.helpers.sanitizeForJSON(req.body.transAccFromDropdown);
  var transToAcc = globals.helpers.sanitizeForJSON(req.body.transAccToDropdown);
  var transAmount = parseFloat(globals.helpers.sanitizeForJSON(req.body.transferAmountInput));
  var newTransfer = globals.transactions.Transaction.initTransfer(transID, transFromAcc, transToAcc, transAmount);
  globals.async.series([
    function addTransfer(callback) {
      globals.transactions.addTransfer(req.session.user.user, newTransfer, function (success) {
        success ? callback() : callback({err: 'We could not add the transfer.'});
      });
    },
    function setBalance(callback) {
      globals.accounts.setBalanceForTransfer(req.session.user.user, newTransfer, function(success) {
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
