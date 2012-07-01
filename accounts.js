module.exports.getAllAccounts = function(login, password, db, callback) {
  db.collection('accounts', function(err, collection) {
    collection.find({user:login}, function(err, cursor) {
      cursor.toArray(function (err, items) {
        if (items)
          callback(items);
        else
          callback(null);
      });
    });
  });
};
