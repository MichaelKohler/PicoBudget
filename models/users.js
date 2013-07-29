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
  var generatedCode = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  globals.db.collection('activation', function (err, collection) {
    collection.insert({user: aLogin, code: generatedCode}, function (err) {
      var smtpTransport = globals.nodemailer.createTransport('SMTP',{
        service: 'Gmail',
        auth: {
          user: 'EMAILHERE!',
          pass: 'PASSWORDHERE!'
        }
      });
      var messageText = '<p>Hi there,<br /><br />thanks for registering at PicoBudget.com! ' +
        'Please activate your account by clicking the following link: <a href=\'http://www.picobudget.com/activate/' +
        generatedCode + '\'>http://www.picobudget.com/activate/' + generatedCode + '</a></p>' +
        '<p>Please note, that your account will be deleted after <b>5 days</b> if you do not activate it.</p>' +
        '<p>We hope you enjoy our product. If you have any questions, feel free to contact us at servicedesk@picobudget.com.</p>' +
        '<p>Have a nice day,<br />Michael Kohler<br />Founder PicoBudget.com</p>';
      var mailOptions = {
        from: 'PicoBudget.com <no-reply@picobudget.com>',
        to: aLogin,
        subject: "Welcome to PicoBudget.com - Please activate your account",
        html: messageText
      };
      smtpTransport.sendMail(mailOptions, function(err, response) {
        smtpTransport.close();
        aCallback(true);
      });
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
  var generatedCode = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  globals.db.collection('passwordreset', function (err, collection) {
    collection.insert({user: aMail, code: generatedCode}, function (err) {
      var smtpTransport = globals.nodemailer.createTransport('SMTP',{
        service: 'Gmail',
        auth: {
          user: 'mkohler@picobudget.com',
          pass: 'ger4dyxjer9885gc'
        }
      });
      var messageText = '<p>Hi there,<br /><br />somebody just did a password recovery for your email address on PicoBudget.com! ' +
        'If this was you, click on the following link and set a new password: <a href=\'http://www.picobudget.com/newPassword/' +
        generatedCode + '\'>http://www.picobudget.com/newPassword/' + generatedCode + '</a></p>' +
        '<p>If this was not you, you can ignore this mail and continue to use our services.</p>' +
        '<p>We hope you enjoy our product. If you have any questions, feel free to contact us at servicedesk@picobudget.com.</p>' +
        '<p>Have a nice day,<br />Michael Kohler<br />Founder PicoBudget.com</p>';
      var mailOptions = {
        from: 'PicoBudget.com <no-reply@picobudget.com>',
        to: aMail,
        subject: "PicoBudget.com - Password reset request",
        html: messageText
      };
      smtpTransport.sendMail(mailOptions, function(err, response) {
        smtpTransport.close();
        aCallback(true);
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
