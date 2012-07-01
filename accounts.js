module.exports.getAllAccounts = function(login, password, db, callback) {
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
    sum += accounts[i].balance;
  }
  callback(sum);
}
