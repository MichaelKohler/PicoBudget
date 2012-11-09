module.exports.authenticate = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({user:login}, function(err, user) {
      if (user)
        user.pw == password ? callback(user) : callback(null);
      else
        callback(null);
    });
  });
};

module.exports.create = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({user:login}, function(err, foundUser) {
      if (!foundUser) {
        var newUser = { user: login, pw: password, role: 'user', curr: "CHF" };
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
    collection.findOne({user:login}, function(err, user) {
      if (user) { // user was found
        if (oldPassword != '' && newPassword != '') { // pw change needed?
          if (user.pw == oldPassword) { // pw matches?
            collection.update({user:login}, {$set: {pw:newPassword, curr:prefCurr}}, function(err) {
              user.pw = newPassword;
              user.curr = prefCurr;
              typeof(err) == 'undefined' ? callback(user) : callback(null);
            });
          }
          else { // old password didn't match
            callback("NOPWMATCH");
          }
        }
        else { // only save prefcurr
          collection.update({user:login}, {$set: {curr:prefCurr}}, function(err) {
            user.curr = prefCurr;
            typeof(err) == 'undefined' ? callback(user) : callback(null);
          });
        }
      }
      else { // user was not found
        callback(null);
      }
    });
  });
};

module.exports.removeUser = function(login, password, db, callback) {
  db.collection('users', function(err, collection) {
    collection.findOne({user:login}, function(err, user) {
      if (user.pw == password) {
        collection.remove({user:login}, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });
  });
};