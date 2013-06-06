"use strict";

var globals = require('../globals').init();

exports.login = function (req, res) {
  if (req.session.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('login', { locals: {
      user: req.session.user || ''
    }});
  }
};

exports.authenticated = function (req, res) {
  globals.users.authenticate(req.body.emailInput, req.body.passwordInput, globals.db, function (user) {
    if (user) {
      req.session.user = user;
      res.redirect('/dashboard');
    }
    else {
      res.flash('error', 'Either the username or password were wrong! Please try again.');
      res.render('login', { locals: {
        user: req.session.user || ''
      }});
    }
  });
};

exports.registered = function (req, res) {
  globals.users.create(req.body.emailInputReg, req.body.passwordInputReg, globals.db, function (user) {
    if (user === "EXISTS") {
      res.flash('error', 'The given email address is already used! Please log in on the left side with your email address or use another address.');
      res.render('login', { locals: {
        user: req.session.user || ''
      }});
    }
    else if (user) {
      req.session.user = user;
      req.session.user.isNew = true;
      res.redirect('/dashboard');
      // TODO: send email to the user
    }
    else {
      res.flash('error', 'The user could not be created. Please try again.');
      res.render('login', { locals: {
        user: req.session.user || ''
      }});
    }
  });
};

exports.logout = function (req, res) {
  delete req.session.user;
  res.flash('info', 'You are logged out now.');
  res.render('login', { locals: {
    user: ''
  }});
};
