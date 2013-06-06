"use strict";

var globals = require('../globals').init();

exports.settings = function (req, res) {
  res.render('settings', { locals: {
    user: req.session.user || '',
    currencies: globals.currencies
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
        user: req.session.user || '',
        currencies: globals.currencies
      }});
    }
    else {
      res.flash('error', 'We could not update the settings. Please try again.');
      res.render('settings', { locals: {
        user: req.session.user || '',
        currencies: globals.currencies
      }});
    }
  });
};

exports.userDeleted = function (req, res) {
  globals.users.removeUser(req.session.user.user, req.body.passwordInput, globals.db, function (removed) {
    if (removed) {
      delete req.session.user;
      res.flash('success', 'Your user account and all data associated with it was removed.');
      res.render('login', { locals: {
        user: ''
      }});
    }
    else {
      req.flash('error', 'Your user account could not be removed. Did you enter a correct password?');
      res.render('settings', { locals: {
        user: req.session.user || '',
        currencies: globals.currencies
      }});
    }
  });
  // TODO: remove other data too!
};
