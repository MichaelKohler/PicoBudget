"use strict";

var globals = require('../globals').init();

exports.transactions = function (req, res) {
  globals.transactions.getAllTransactions(req.session.user.user, globals.db, function (transactionList) {
    if (transactionList) {
      globals.tags.getAllTags(req.session.user.user, globals.db, function (tagList) {
        if (tagList) {
          globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accList) {
            if (accList) {
              res.render('transactions', { locals: {
                user: req.session.user || '',
                transactions: transactionList,
                tags: tagList,
                formatAmount: globals.helpers.formatAmount,
                accounts: accList
              }});
            }
          });
        }
      });
    }
    else {
      res.redirect('/transactions?error=true');
    }
  });
};

exports.transactionAdded = function (req, res) {
  var transID = req.body.transIDInput;
  var transAcc = req.body.transAccDropdown;
  var transArt = req.body.transArtDropdown;
  var transName = req.body.transNameInput;
  var transTags = req.body.transTagsInput.split(',');
  var transAmount = req.body.transAmountInput;
  globals.transactions.addTransaction(req.session.user.user, transID, transAcc, transArt, transName,
    transTags, transAmount, globals.db, function (success) {
      success ? res.redirect('/transactions?added=true') : res.redirect('/transactions?added=false');
    });
};

exports.transactionEdited = function (req, res) {
  var transID = req.body.transID;
  var transArt = req.body.transArtEditInput;
  var transName = req.body.transNameEditInput;
  var transTags = req.body.transTagsEdit;
  var transAmount = req.body.transEditAmount;
  globals.transactions.editTransaction(req.session.user.user, transID, transArt, transName,
    transTags, transAmount, globals.db, function (successTrans) {
      successTrans ? res.redirect('/transactions?edited=true') : res.redirect('/transactions?edited=false');
    });
};

exports.transactionDeleted = function (req, res) {
  var transID = req.body['transID'];
  globals.transactions.removeTransaction(req.session.user.user, transID, globals.db, function (success) {
    success ? res.redirect('/transactions?deleted=true') : res.redirect('/transactions?deleted=false');
  });
};
