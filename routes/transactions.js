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
                accounts: accList
              }});
            }
          });
        }
      });
    }
    else {
      res.flash('error', 'Unfortunately there was an error of which we can not recover! Please try again later.');
      res.redirect('/transactions');
    }
  });
};

exports.transactionAdded = function (req, res) {
  var transAcc = req.body.transAccDropdown;
  var transType = req.body.transArtDropdown;
  var transName = req.body.transNameInput;
  var transTags = req.body.transTagsInput.split(',');
  var transAmount = req.body.transAmountInput;
  var newTransaction = globals.transactions.Transaction.init(transAcc, transType, transName, transTags, transAmount);
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
      res.redirect('/transactions');
    });
};
