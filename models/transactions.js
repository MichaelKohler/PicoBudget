"use strict";

module.exports.Transaction = {
  id: 0,
  account: "",
  fromAccount: "",
  toAccount: "",
  type: "",
  name: "",
  tags: [],
  amount: 0.0,

  init: function (aID, aAccount, aType, aName, aTags, aAmount) {
    this.id = aID;
    this.account = aAccount;
    this.type = aType;
    this.name = aName;
    this.tags = aTags;
    this.amount = aAmount;
    return this;
  },

  initTransfer: function (aID, aFromAccount, aToAccount, aAmount) {
    this.id = aID;
    this.fromAccount = aFromAccount;
    this.toAccount = aToAccount;
    this.amount = aAmount;
    this.name = aFromAccount + " -> " + aToAccount;
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

module.exports.getTransactionsByAccount = function (aLogin, db, aName, aCallback) {
  db.collection('transactions', function (err, collection) {
    collection.find({user: aLogin, $or:[{acc: aName}, {accTo: aName}, {accFrom: aName}]}, {sort: [
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
    var newTransaction = { user: aLogin, date: currentDate, id: aTransaction.id, acc: aTransaction.account, art: aTransaction.type,
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
    var transaction = { user: aLogin, id: aTransaction.id };
    var newTransaction = { id: aTransaction.id, art: aTransaction.type, name: aTransaction.name, tags: aTransaction.tags,
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
module.exports.removeTransaction = function (aLogin, aID, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    var transaction = { user: aLogin, id: aID };
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

module.exports.addTransfer = function (aLogin, aTransaction, db, aCallback) {
  db.collection('transactions', function (err, collection) {
    var currentDate = new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate();
    var newTransfer = { user: aLogin, date: currentDate, id: aTransaction.id, accFrom: aTransaction.fromAccount,
                        accTo: aTransaction.toAccount, amount: parseFloat(aTransaction.amount).toFixed(2),
                        name: aTransaction.name};
    collection.insert(newTransfer, function (err, result) {
      if (result) {
        aCallback(newTransfer);
      }
      else {
        aCallback(null);
      }
    });
  });
};