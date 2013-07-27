'use strict';

var globals = require('../globals');

exports.login = function (req, res) {
  var locals = {user: req.session.user || ''};
  if (req.session.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('login', locals);
  }
};

exports.authenticated = function (req, res) {
  var email = globals.helpers.sanitizeForJSON(req.body.emailInput);
  var password = globals.helpers.sanitizeForJSON(req.body.passwordInput);
  globals.users.authenticate(email, password, function (user) {
    if (user) {
      req.session.user = user;
      res.redirect('/dashboard');
    }
    else {
      res.flash('error', 'Either the username or password were wrong! Please try again.');
      var locals = {user: req.session.user || ''};
      res.render('login', locals);
    }
  });
};

exports.registered = function (req, res) {
  var email = globals.helpers.sanitizeForJSON(req.body.emailInputReg);
  var password = globals.helpers.sanitizeForJSON(req.body.passwordInputReg);
  globals.users.create(email, password, function (user) {
    var locals = {user: req.session.user || ''};
    if (user === 'EXISTS') {
      res.flash('error', 'The given email address is already used! Please log in on the left side with your email address or use another address.');
      res.render('login', locals);
    }
    else if (user) {
      req.session.user = user;
      req.session.user.isNew = true;
      globals.users.startActivationProcess(email, function(success) {});
      res.redirect('/dashboard');
    }
    else {
      res.flash('error', 'The user could not be created. Please try again.');
      res.render('login', locals);
    }
  });
};

exports.activated = function (req, res) {
  var code = req.params.code;
  globals.users.activate(code, function (success) {
    if (success) {
      res.flash('success', 'The account has been activated.');
    }
    else {
      res.flash('error', 'The account could not be activated. Please get in touch with us.');
    }
    res.redirect('/dashboard');
  });
};

exports.logout = function (req, res) {
  delete req.session.user;
  res.flash('info', 'You are logged out now.');
  var locals = {user: ''};
  res.render('login', locals);
};
