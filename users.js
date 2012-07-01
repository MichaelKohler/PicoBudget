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
    collection.findOne({username:login}, function(err, foundUser) {
      if (!foundUser) {
        var newUser = { username: login, password: password, role: 'user', prefCurr: "CHF" };
        collection.insert(newUser, function(err, result) {
          if (result)
            callback(newUser);
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

module.exports.changeSettings = function(login, oldPassword, newPassword, prefCurr, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({username:login}, function(err, user) {
      if (user) { // user was found
        if (user.password == oldPassword) { // old password matched
          collection.update({username:login}, {$set: {password: newPassword, prefCurr: prefCurr}}, function(err) {
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

module.exports.remove = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({username:login}, function(err, user) {
      if (user.password == password) {
        collection.remove({username:login}, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });
  });
};
