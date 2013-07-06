"use strict";

module.exports.Transaction = {
  account: "",
  type: "",
  name: "",
  tags: [],
  amount: "",

  init: function (aAccount, aType, aName, aTags, aAmount) {
    this.account = aAccount;
    this.type = aType;
    this.name = aName;
    this.tags = aTags;
    this.amount = aAmount;
    return this;
  }
};

module.exports.getAllTransactions = function (aLogin, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    collection.find({user: aLogin}, {sort: [
      ['date', -1]
    ]}, function (err, cursor) {
      cursor.toArray(function (err, items) {
        aCallback(items);
      });
    });
  });
};

module.exports.getLimitedTransactions = function (aLogin, db, aLimitedEntries, aCallback) {
  db.collection('transactions', function (err, collection) {
    collection.find({user: aLogin}, {limit: aLimitedEntries, sort: [
      ['date', -1]
    ]}, function (err, cursor) {
      cursor.toArray(function (err, items) {
        aCallback(items);
      });
    });
  });
};

module.exports.addTransaction = function (aLogin, aTransaction, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    var currentDate = new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate();
    var newTransaction = { user: aLogin, date: currentDate, acc: aTransaction.account, art: aTransaction.type,
      name: aTransaction.name, tags: aTransaction.tags, amount: parseFloat(aTransaction.amount).toFixed(2) };
    collection.insert(newTransaction, function (err, result) {
      if (result) {
        aCallback(newTransaction);
      }
      else {
        aCallback(null);
      }
    });
  });
};

// not yet used:
module.exports.editTransaction = function (aLogin, aTransaction, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    var transaction = { user: aLogin, name: aTransaction.name }; // we should not identify it with the name
    var newTransaction = { art: aTransaction.type, name: aTransaction.name, tags: aTransaction.tags,
                           amount: parseFloat(aTransaction.amount).toFixed(2) };
    collection.findOne(transaction, function (err, foundTransaction) {
      if (foundTransaction) {
        collection.update(transaction, {$set: newTransaction}, function (err) {
          if (err) {
            aCallback(null);
          }
          else {
            aCallback(transaction);
          }
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

// not yet used:
module.exports.removeTransaction = function (aLogin, aName, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    var transaction = { user: aLogin, name: aName };
    collection.findOne(transaction, function (err, foundTag) {
      if (foundTag) {
        collection.remove(transaction, function (err) {
          if (err) {
            aCallback(null);
          }
          else {
            aCallback(true);
          }
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.deleteAllTransactions = function (aLogin, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    collection.remove({user: aLogin}, function (err) {
      if (err) {
        aCallback(false);
      }
      else {
        aCallback(true);
      }
    });
  });
};