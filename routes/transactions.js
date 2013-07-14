"use strict";

var globals = require('../globals').init();

exports.transactions = function (req, res) {
  var transpage = parseInt(req.params.transpage);
  var limit = 10;
  globals.transactions.getAllTransactions(req.session.user.user, globals.db, function(allTransactionsList) {
    globals.tags.getAllTags(req.session.user.user, globals.db, function (tagList) {
      globals.accounts.getAllAccounts(req.session.user.user, globals.db, function (accList) {
        if (allTransactionsList && tagList && accList) {
          res.render('transactions', { locals: {
            user: req.session.user || '',
            transactions: allTransactionsList.slice(transpage*limit-limit, transpage*limit),
            tags: tagList,
            accounts: accList,
            page: transpage,
            needsMorePages: (allTransactionsList.length - transpage * 10 > 0)
          }});
        }
        else {
          res.flash('error', 'Unfortunately there was an error of which we can not recover! Please try again later.');
          res.redirect('/transactions/1');
        }
      });
    });
  });
};

exports.transactionAdded = function (req, res) {
  var transID = parseInt(req.body.lastTransIDInput) + 1;
  var transAcc = req.body.transAccDropdown;
  var transType = req.body.transArtDropdown;
  var transName = req.body.transNameInput;
  var transTags = req.body.transTagsInput.split(' ');
  var transAmount = parseFloat(req.body.transAmountInput);
  var newTransaction = globals.transactions.Transaction.init(transID, transAcc, transType, transName, transTags, transAmount);
  globals.transactions.addTransaction(req.session.user.user, newTransaction, globals.db, function (success) {
      if (success) {
        globals.accounts.setBalanceForTransaction(req.session.user.user, globals.db, newTransaction, function(err) {
          if (err) {
            res.flash('error', 'We could not update your balance correctly. Please change it manually.!');
          }
          else {
            res.flash('success', 'The transaction has been added successfully!');
          }
        });
      }
      else {
        res.flash('error', 'Unfortunately there was an error while adding your transaction! Please try again later.');
      }
      res.redirect('/transactions/1');
    });
};

exports.transferAdded = function (req, res) {
  var transID = parseInt(req.body.lastTransIDInput) + 1;
  var transFromAcc = req.body.transAccFromDropdown;
  var transToAcc = req.body.transAccToDropdown;
  var transAmount = parseFloat(req.body.transferAmountInput);
  var newTransfer = globals.transactions.Transaction.initTransfer(transID, transFromAcc, transToAcc, transAmount);
  globals.transactions.addTransfer(req.session.user.user, newTransfer, globals.db, function (success) {
    if (success) {
      globals.accounts.setBalanceForTransfer(req.session.user.user, globals.db, newTransfer, function(err) {
        if (err) {
          res.flash('error', 'We could not update your balance correctly. Please change it manually.!');
        }
        else {
          res.flash('success', 'The transfer has been added successfully!');
        }
      });
    }
    else {
      res.flash('error', 'Unfortunately there was an error while adding your transfer! Please try again later.');
    }
    res.redirect('/transactions/1');
  });
};
