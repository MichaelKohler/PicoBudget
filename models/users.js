'use strict';

var globals = require('../globals');

module.exports.authenticate = function (aLogin, aPassword, aCallback) {
  var loginname = aLogin.toLowerCase();
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: loginname}, function (err, user) {
      (user && user.pw === aPassword) ? aCallback(user) : aCallback(null);
    });
  });
};

module.exports.create = function (aLogin, aPassword, aCallback) {
  var loginname = aLogin.toLowerCase();
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: loginname}, function (err, foundUser) {
      if (!foundUser) {
        var newUser = {user: loginname, pw: aPassword, role: 'user', curr: 'CHF'};
        collection.insert(newUser, function (err, result) {
          err ? aCallback(null) : aCallback(newUser);
        });
      }
      else {
        aCallback('EXISTS');
      }
    });
  });
};

module.exports.changeSettings = function (aLogin, aOldPassword, aNewPassword, aPrefCurr, aCallback) {
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, user) {
      if (user) { // user was found
        if (aOldPassword !== '' && aNewPassword !== '') {
          if (user.pw === aOldPassword) {
            collection.update({user: aLogin}, {$set: {pw: aNewPassword, curr: aPrefCurr}}, function (err) {
              user.pw = aNewPassword;
              user.curr = aPrefCurr;
              err ? aCallback(null) : aCallback(user);
            });
          }
          else {
            aCallback(null);
          }
        }
        else { // only save prefcurr
          collection.update({user: aLogin}, {$set: {curr: aPrefCurr}}, function (err) {
            user.curr = aPrefCurr;
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

module.exports.removeUser = function (aLogin, aPassword, aCallback) {
  globals.db.collection('users', function (err, collection) {
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
