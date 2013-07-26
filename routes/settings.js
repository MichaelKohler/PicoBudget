'use strict';

var globals = require('../globals');

exports.settings = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('settings', locals);
};

exports.settingsChanged = function (req, res) {
  var oldPW = globals.helpers.sanitizeForJSON(req.body.oldPasswordInput);
  var newPW = globals.helpers.sanitizeForJSON(req.body.newPasswordInput);
  var prefCurr = globals.helpers.sanitizeForJSON(req.body.prefCurrDropdown);

  globals.users.changeSettings(req.session.user.user, oldPW, newPW, prefCurr, function (updatedUser) {
    var locals = {user: req.session.user || ''};
    if (updatedUser) {
      req.session.user = updatedUser; // we need to reinit the session because of the new password
      res.flash('success', 'Your settings are saved.');
    }
    else {
      res.flash('error', 'We could not update the settings. Please try again.');
    }
    res.render('settings', locals);
  });
};

exports.userDeleted = function (req, res) {
  var locals = {};
  globals.async.series([
    function deleteUser(callback) {
      globals.users.removeUser(req.session.user.user, globals.helpers.sanitizeForJSON(req.body.passwordInput), function (success) {
        success ? callback() : callback({err: 'We could not remove the user.'});
      });
    },
    function deleteAccounts(callback) {
      globals.accounts.deleteAllAccounts(req.session.user.user, function (success) {
        success ? callback() : callback({err: 'We could not remove the accounts.'});
      });
    },
    function deleteTransactions(callback) {
      globals.transactions.deleteAllTransactions(req.session.user.user, function (success) {
        success ? callback() : callback({err: 'We could not remove the transactions.'});
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
