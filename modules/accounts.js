module.exports.getAllAccounts = function(login, db, callback) {
  db.collection('accounts', function(err, collection) {
    collection.find({user:login}, function(err, cursor) {
      cursor.toArray(function (err, items) {
        callback(items);
      });
    });
  });
};

module.exports.sumBalance = function(accounts, callback) {
  var sum = 0;
  for (var i = 0; i < accounts.length; i++) {
    sum += parseFloat(accounts[i].balance);
  }
  callback(sum);
}

module.exports.addAccount = function(login, accName, accCurrency, accBalance, db, callback) {
  db.collection('accounts', function(err, collection) {
    collection.findOne({user:login, name:accName}, function(err, foundAccount) {
      if (!foundAccount) {
        var newAccount = { user: login, name: accName, curr: accCurrency,
                            bal: parseFloat(accBalance).toFixed(2) };
        collection.insert(newAccount, function(err, result) {
          if (result)
            callback(true);
          else
            callback(null);
        });
      }
      else {
        callback("EXISTS");
      }
    });  
  });
};

module.exports.editAccount = function(login, oldName, accName, accBalance, db, callback) {
  db.collection('accounts', function(err, collection) {
    collection.findOne({name:oldName}, function(err, foundAccount) {
      if (foundAccount) {
        collection.update({name:oldName}, {$set: {name:accName, bal:accBalance}}, function(err) {
          if (typeof(err) == 'undefined') {
            callback(true);
          }
          else {
            callback(null);
          }
        });
      }
      else {
        callback(null);
      }
    });  
  });
};

module.exports.deleteAccount = function(login, accName, db, callback) {
  db.collection('accounts', function(err, collection) {
    collection.findOne({name:accName}, function(err, foundAccount) {
      if (foundAccount) {
        collection.remove({name:accName}, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });  
  });
};
