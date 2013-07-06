"use strict";

module.exports.authenticate = function (aLogin, aPassword, db, aCallback) {
  db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, user) {
      if (user) {
        user.pw === aPassword ? aCallback(user) : aCallback(null);
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.create = function (aLogin, aPassword, db, aCallback) {
  db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, foundUser) {
      if (!foundUser) {
        var newUser = { user: aLogin, pw: aPassword, role: 'user', curr: "CHF" };
        collection.insert(newUser, function (err, result) {
          if (result) {
            aCallback(newUser);
          }
          else {
            aCallback(null);
          }
        });
      }
      else {
        aCallback("EXISTS");
      }
    });
  });
};

module.exports.changeSettings = function (aLogin, aOldPassword, aNewPassword, aPrefCurr, db, aCallback) {
  db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, user) {
      if (user) { // user was found
        if (aOldPassword !== '' && aNewPassword !== '') {
          if (user.pw === aOldPassword) {
            collection.update({user: aLogin}, {$set: {pw: aNewPassword, curr: aPrefCurr}}, function (err) {
              user.pw = aNewPassword;
              user.curr = aPrefCurr;
              if (err) {
                aCallback(null);
              }
              else {
                aCallback(user);
              }
            });
          }
          else {
            aCallback(false);
          }
        }
        else { // only save prefcurr
          collection.update({user: aLogin}, {$set: {curr: prefCurr}}, function (err) {
            user.curr = prefCurr;
            err ? aCallback(null) : aCallback(user);
          });
        }
      }
      else { // user was not found
        aCallback(null);
      }
    });
  });
};

module.exports.removeUser = function (aLogin, aPassword, db, aCallback) {
  db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, user) {
      if (user.pw === aPassword) {
        collection.remove({user: aLogin}, function (err) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};
