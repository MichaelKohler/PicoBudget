module.exports.getAllTransactions = function(login, db, callback) {
  db.collection('transactions', function(err, collection) {
    collection.find({user:login}, function(err, cursor) {
      cursor.toArray(function (err, items) {
        callback(items);
      });
    });
  });
};

module.exports.addTransaction = function(login, transID, transAcc, transArt, transName, transTags,
                                          transAmount, db, callback) {
  db.collection('transactions', function(err, collection) {
    var newTransaction = { username: login, transID:transID, acc:transAcc, art: transArt,
                           name:transName, tags:transTags, amount:transAmount };
    collection.insert(newTransaction, function(err, result) {
      if (result)
        callback(newTransaction);
      else
        callback(null);
    });
  });
};

module.exports.editTransaction = function(login, transID, transArt, transName,
                                           transTags, transAmount, db, callback) {
  db.collection('transactions', function(err, collection) {
    var transaction = { username: login, transID:transID };
    var newTransaction = { art: transArt, name:transName, tags:transTags, amount:transAmount };
    collection.findOne(transaction, function(err, foundTransaction) {
      if (foundTransaction) {
        collection.update(transaction, {$set: newTransaction}, function(err) {
          err ? callback(null) : callback(transaction);
        });
      }
      else {
        callback(null);
      }
    });
  });
};

module.exports.removeTransaction = function(login, transID, db, callback) {
  db.collection('transactions', function(err, collection) {
    var transaction = { username: login, transID:transID };
    collection.findOne(transaction, function(err, foundTag) {
      if (foundTag) {
        collection.remove(transaction, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });
  });
};
