'use strict';

var globals = require('../globals');

module.exports.authenticate = function (aLogin, aPassword, aCallback) {
  var loginname = aLogin.toLowerCase();
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: loginname}, function (err, user) {
      if (user) {
        globals.bcrypt.compareSync(aPassword, user.pw) ? aCallback(user) : aCallback(null);
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.create = function (aLogin, aPassword, aCallback) {
  var loginname = aLogin.toLowerCase();
  var salt = globals.bcrypt.genSaltSync(10);
  var hash = globals.bcrypt.hashSync(aPassword, salt);
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: loginname}, function (err, foundUser) {
      if (!foundUser) {
        var newUser = {user: loginname, pw: hash, role: 'user', curr: 'CHF'};
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

module.exports.startActivationProcess = function (aLogin, aCallback) {
  var generatedCode = globals.helpers.getGeneratedCode();
  var subject = 'Welcome to PicoBudget.com - Please activate your account';
  var messageText = '<p>Hi there,<br /><br />thanks for registering at PicoBudget.com! ' +
    'Please activate your account by clicking the following link: <a href=\'http://www.picobudget.com/activate/' +
    generatedCode + '\'>http://www.picobudget.com/activate/' + generatedCode + '</a></p>' +
    '<p>Please note, that your account will be deleted after <b>5 days</b> if you do not activate it.</p>' +
    '<p>We hope you enjoy our product. If you have any questions, feel free to contact us at servicedesk@picobudget.com.</p>' +
    '<p>Have a nice day,<br />Michael Kohler<br />Founder PicoBudget.com</p>';
  globals.db.collection('activation', function (err, collection) {
    collection.insert({user: aLogin, code: generatedCode, date: new Date()}, function (err) {
      globals.helpers.sendMail(aLogin, subject, messageText, function (success) {
        success ? aCallback(true) : aCallback(null);
      });
    });
  });
};

module.exports.deleteAllTemporaryCodes = function (aLogin, aCallback) {
  globals.async.parallel([
    function deleteAllActivationCodes(callback) {
      globals.db.collection('activation', function (err, collection) {
        collection.remove({user: aLogin}, function (err) {
          err ? callback({err: 'We could not remove all activation codes!'}) : callback();
        });
      });
    },
    function deleteAllPasswordResets(callback) {
      globals.db.collection('passwordreset', function (err, collection) {
        collection.remove({user: aLogin}, function (err) {
          err ? callback({err: 'We could not remove all activation codes!'}) : callback();
        });
      });
    }
  ], function (err) {
    err ? aCallback(null) : aCallback(true);
  });
};

module.exports.getAllPasswordResets = function (aLogin, aCallback) {
  globals.db.collection('passwordreset', function (err, collection) {
    collection.find({user: aLogin}).toArray(function (err, items) {
        aCallback(items);
      });
  });
};

module.exports.activate = function (aCode, aCallback) {
  globals.db.collection('activation', function (err, collection) {
    collection.findOne({code: aCode}, function (err, entry) {
      collection.remove({code: aCode}, function (err) {
        err ? aCallback(null) : aCallback(true);
      });
    });
  });
};

module.exports.checkIfUserExists = function (aMail, aCallback) {
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: aMail}, function (err, user) {
      user ? aCallback(true) : aCallback(null);
    });
  });
};

module.exports.sendNewPassword = function (aMail, aCallback) {
  var generatedCode = globals.helpers.getGeneratedCode();
  var messageText = '<p>Hi there,<br /><br />somebody just did a password recovery for your email address on PicoBudget.com! ' +
    'If this was you, click on the following link and set a new password: <a href=\'http://www.picobudget.com/newPassword/' +
    generatedCode + '\'>http://www.picobudget.com/newPassword/' + generatedCode + '</a></p>' +
    '<p>If this was not you, you can ignore this mail and continue to use our services.</p>' +
    '<p>We hope you enjoy our product. If you have any questions, feel free to contact us at servicedesk@picobudget.com.</p>' +
    '<p>Have a nice day,<br />Michael Kohler<br />Founder PicoBudget.com</p>';
  var subject = 'PicoBudget.com - Password reset request';
  globals.db.collection('passwordreset', function (err, collection) {
    collection.insert({user: aMail, code: generatedCode, date: new Date()}, function (err) {
      globals.helpers.sendMail(aMail, subject, messageText, function (success) {
        success ? aCallback(true) : aCallback(null);
      });
    });
  });
};

module.exports.saveNewPasswordForCode = function (aCode, aPassword, aCallback) {
  var account = '';
  globals.async.series([
    function getAccountForCode(callback) {
      globals.db.collection('passwordreset', function (err, collection) {
        collection.findOne({code: aCode}, function (err, codeItem) {
          if (!err) {
            account = codeItem.user;
            callback();
          }
          else {
            callback({err: 'Could not find account for code!'});
          }
        });
      });
    },
    function savePasswordForAccount(callback) {
      globals.db.collection('users', function (err, collection) {
        collection.findOne({user: account}, function (err, user) {
          var salt = globals.bcrypt.genSaltSync(10);
          var hash = globals.bcrypt.hashSync(aPassword, salt);
          collection.update({user: account}, {$set: {pw: hash}}, function (err) {
            err ? callback({err: 'Could not update password for account!'}) : callback();
          });
        });
      });
    },
    function removeCode(callback) {
      globals.db.collection('passwordreset', function (err, collection) {
        collection.findOne({code: aCode}, function (err, codeItem) {
          if (!err) {
            collection.remove({code: aCode}, function (err) {
              err ? callback({err: 'Could not remove code!'}) : callback();
            });
          }
          else {
            callback({err: 'Could not remove code!'});
          }
        });
      });
    }
  ], function (err) {
    err ? aCallback(null) : aCallback(true);
  });
};

module.exports.changeSettings = function (aLogin, aOldPassword, aNewPassword, aPrefCurr, aCallback) {
  globals.db.collection('users', function (err, collection) {
    collection.findOne({user: aLogin}, function (err, user) {
      if (user) { // user was found
        if (aOldPassword !== '' && aNewPassword !== '') {
          var salt = globals.bcrypt.genSaltSync(10);
          if (globals.bcrypt.compareSync(aOldPassword, user.pw)) {
            var hash = globals.bcrypt.hashSync(aNewPassword, salt);
            collection.update({user: aLogin}, {$set: {pw: hash, curr: aPrefCurr}}, function (err) {
              user.pw = hash;
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
      if (globals.bcrypt.compareSync(aPassword, user.pw)) {
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
