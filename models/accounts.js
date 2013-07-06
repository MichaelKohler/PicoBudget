"use strict";

var globals = require('../globals').init();

module.exports.Account = {
  name: "",
  currency: "",
  balance: "",

  initFull: function (aName, aCurrency, aBalance) {
    this.name = aName;
    this.currency = aCurrency;
    this.balance = aBalance;
    return this;
  },

  init: function(aName, aBalance) {
    this.name = aName;
    this.balance = aBalance;
    return this;
  }
};

module.exports.getAllAccounts = function (aLogin, db, callback) {
  db.collection('accounts', function (err, collection) {
    collection.find({user: aLogin}, function (err, cursor) {
      cursor.toArray(function (err, items) {
        callback(items);
      });
    });
  });
};

module.exports.addAccount = function (aLogin, db, aAccount, callback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aAccount.name}, function (err, foundAccount) {
      if (!foundAccount) {
        var newAccount = { user: aLogin, name: aAccount.name, curr: aAccount.currency,
          bal: parseFloat(aAccount.balance).toFixed(2) };
        collection.insert(newAccount, function (err, result) {
          if (result) {
            callback(true);
          }
          else {
            callback(false);
          }
        });
      }
      else {
        callback(false);
      }
    });
  });
};

module.exports.editAccount = function (aLogin, db, aOldName, aEditedAccount, callback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({name: aOldName}, function (err, foundAccount) {
      if (foundAccount) {
        collection.update({name: aOldName}, {$set: {name: aEditedAccount.name, bal: aEditedAccount.balance}}, function (err) {
          if (!err) {
            callback(true);
          }
          else {
            callback(false);
          }
        });
      }
      else {
        callback(false);
      }
    });
  });
};

module.exports.deleteAccount = function (aLogin, db, aAccName, callback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({name: aAccName}, function (err, foundAccount) {
      if (foundAccount) {
        collection.remove({name: aAccName}, function (err) {
          if (err) {
            callback(false);
          }
          else {
            callback(true);
          }
        });
      }
      else {
        callback(false);
      }
    });
  });
};