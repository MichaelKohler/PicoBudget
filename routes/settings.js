"use strict";

var globals = require('../globals').init();

exports.settings = function (req, res) {
  globals.helpers.getAllAvailableCurrencies(globals.db, function (currencyList) {
    if (currencyList) {
      res.render('settings', { locals: {
        user: req.session.user || '',
        currencies: currencyList,
        changed: false
      }});
    }
  });
};

exports.settingsChanged = function (req, res) {
  var oldPW = req.body.oldPasswordInput;
  var newPW = req.body.newPasswordInput;
  var prefCurr = req.body.prefCurrDropdown;

  globals.users.changeSettings(req.session.user.user, oldPW, newPW, prefCurr, globals.db, function (updatedUser) {
    if (updatedUser === "NOPWMATCH") {
      res.redirect('/settings?passwordsDidntMatch=true');
    }
    else if (updatedUser) {
      req.session.user = updatedUser; // we need to reinit the session because of the new password
      globals.helpers.getAllAvailableCurrencies(globals.db, function (currencyList) {
        if (currencyList) {
          res.render('settings', { locals: {
            user: req.session.user || '',
            currencies: currencyList,
            changed: true
          }});
        }
      });
    }
    else {
      res.redirect('/settings?unknownError=true');
    }
  });
};

exports.userDeleted = function (req, res) {
  globals.users.removeUser(req.session.user.user, req.body.passwordInput, globals.db, function (removed) {
    if (removed) {
      delete req.session.user;
      res.redirect('/login?removed=true');
    }
    else {
      res.redirect('/settings?removed=false');
    }
  });
  // TODO: remove other data too!
};
