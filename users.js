module.exports.authenticate = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({username:login}, function(err, user) {
      if (user)
        user.password == password ? callback(user) : callback(null);
      else
        callback(null);
    });
  });
};

module.exports.create = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    var newUser = { username: login, password: password };
    collection.insert(newUser, function(err, result) {
      if (result)
        callback(result);
      else
        callback(null);
    });
  });
};
