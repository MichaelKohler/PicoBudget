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
  // TODO: check if user exists
  db.collection('users', function(err, collection) {
    var newUser = { username: login, password: password };
    collection.insert(newUser, function(err, result) {
      if (result)
        callback(newUser);
      else
        callback(null);
    });
  });
};

module.exports.changeSettings = function(login, oldPassword, newPassword, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({username:login}, function(err, user) {
      if (user) { // user was found
        if (user.password == oldPassword) { // old password matched
          collection.update({username:login}, {$set: {password: newPassword}}, function(err) {
            if (user && typeof(err) == 'undefined') { // sanity check for user + there was no error
              user.password = newPassword;
              callback(user);
            }
            else {
              callback(null);
            }
          });
        }
        else { // old password didn't match
          callback(null);
        }
      }
      else { // user was not found
        callback(null);
      } 
    });
  });
};
