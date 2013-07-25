'use strict';

module.exports.Account = {
  name: '',
  currency: '',
  balance: '',

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
    collection.find({user: aLogin}, {sort: [
      ['name', 1]
    ]}).toArray(function (err, items) {
        callback(items);
    });
  });
};

module.exports.getAccount = function (aLogin, db, aName, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aName}, function (err, account) {
      err ? aCallback(null) : aCallback(account);
    });
  });
};

module.exports.addAccount = function (aLogin, db, aAccount, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aAccount.name}, function (err, foundAccount) {
      if (!foundAccount) {
        var newAccount = { user: aLogin, name: aAccount.name, curr: aAccount.currency,
          bal: parseFloat(aAccount.balance).toFixed(2) };
        collection.insert(newAccount, function (err, result) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.editAccount = function (aLogin, db, aOldName, aEditedAccount, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aOldName}, function (err, foundAccount) {
      if (foundAccount) {
        collection.update({user: aLogin, name: aOldName}, {$set: {name: aEditedAccount.name, bal: aEditedAccount.balance}}, function (err) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.deleteAccount = function (aLogin, db, aAccName, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aAccName}, function (err, foundAccount) {
      if (foundAccount) {
        collection.remove({user: aLogin, name: aAccName}, function (err) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.deleteAllAccounts = function (aLogin, db, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.remove({user: aLogin}, function (err) {
      err ? aCallback(null) : aCallback(true);
    });
  });
};

module.exports.setBalanceForTransaction = function (aLogin, db, aTransaction, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aTransaction.account}, function (err, foundAccount) {
      if (foundAccount) {
        var newBalance = 0.00;
        if (aTransaction.type === '+') {
          newBalance = parseFloat(foundAccount.bal) + parseFloat(aTransaction.amount);
        }
        else if (aTransaction.type === '-') {
          newBalance = parseFloat(foundAccount.bal) - parseFloat(aTransaction.amount);
        }

        collection.update({name: aTransaction.account}, {$set: {bal: newBalance}}, function (result) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.setBalanceForTransfer = function (aLogin, db, aTransaction, aCallback) {
  db.collection('accounts', function (err, collection) {
    collection.findOne({user: aLogin, name: aTransaction.fromAccount}, function (err, foundAccount) {
      if (foundAccount) {
        var newFromBalance = parseFloat(foundAccount.bal) - parseFloat(aTransaction.amount);

        collection.update({user: aLogin, name: aTransaction.fromAccount}, {$set: {bal: newFromBalance}}, function (err) {
          if (!err) {
            collection.findOne({user: aLogin, name: aTransaction.toAccount}, function (err, foundAccount) {
              if (foundAccount) {
                var newToBalance = parseFloat(foundAccount.bal) + parseFloat(aTransaction.amount);

                collection.update({user: aLogin, name: aTransaction.toAccount}, {$set: {bal: newToBalance}}, function (err) {
                  err ? aCallback(null) : aCallback(true);
                });
              }
              else {
                aCallback(null);
              }
            });
          }
          else {
            aCallback(null);
          }
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};