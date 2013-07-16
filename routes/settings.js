"use strict";

var globals = require('../globals').init();

exports.settings = function (req, res) {
  res.render('settings', { locals: {
    user: req.session.user || ''
  }});
};

exports.settingsChanged = function (req, res) {
  var oldPW = req.body.oldPasswordInput;
  var newPW = req.body.newPasswordInput;
  var prefCurr = req.body.prefCurrDropdown;

  globals.users.changeSettings(req.session.user.user, oldPW, newPW, prefCurr, globals.db, function (updatedUser) {
    if (updatedUser) {
      req.session.user = updatedUser; // we need to reinit the session because of the new password
      res.flash('success', 'Your settings are saved.');
      res.render('settings', { locals: {
        user: req.session.user || ''
      }});
    }
    else {
      res.flash('error', 'We could not update the settings. Please try again.');
      res.render('settings', { locals: {
        user: req.session.user || ''
      }});
    }
  });
};

exports.userDeleted = function (req, res) {
  var locals = {};
  globals.async.series([
    function deleteUser(callback) {
      globals.users.removeUser(req.session.user.user, req.body.passwordInput, globals.db, function (userRemoved) {
        if (userRemoved) {
          callback();
        }
        else {
          callback(null);
        }
      });
    },
    function deleteAccounts(callback) {
      globals.accounts.deleteAllAccounts(req.session.user.user, globals.db, function (accsRemoved) {
        if (accsRemoved) {
          callback();
        }
        else {
          callback(null);
        }
      });
    },
    function deleteTransactions(callback) {
      globals.transactions.deleteAllTransactions(req.session.user.user, globals.db, function (transRemoved) {
        if (transRemoved) {
          callback();
        }
        else {
          callback(null);
        }
      });
    }
  ], function (err) {
    if (err) {
      locals.user = req.session.user || '';
      res.flash('error', 'We could not remove all your data. Did you enter the correct password? If so, please contact us so we can remove it manually.');
      res.render('about', locals);
    }
    else {
      locals.user = '';
      delete req.session.user;
      res.flash('success', 'Your user account and all data associated with it was removed.');
      res.render('login', locals);
    }
  });
};
