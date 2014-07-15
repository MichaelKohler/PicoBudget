'use strict';

var globals = require('../globals');

exports.login = function (req, res) {
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'Login - ' + globals.titleAddition;
    if (req.session.user) {
        res.redirect('/dashboard');
    }
    else {
        res.render('login', locals);
    }
};

exports.forgotPassword = function (req, res) {
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'Forgot password - ' + globals.titleAddition;
    res.render('forgotPassword', locals);
};

exports.sendResetPasswordMail = function (req, res) {
    var email = globals.helpers.sanitize(req.body.emailInput);
    globals.users.checkIfUserExists(email, function (success) {
        if (success) {
            globals.users.sendNewPassword(email, function (success) {
                res.flash('success', 'The reset password email has been sent to your email address.');
                res.redirect('/forgotPassword');
            });
        }
        else {
            res.flash('error', 'The password reset request failed. Please get in touch with us.');
            res.redirect('/forgotPassword');
        }
    });
};

exports.newPassword = function (req, res) {
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'New password - ' + globals.titleAddition;
    locals.code = globals.helpers.sanitize(req.params.code);
    res.render('newPassword', locals);
};

exports.saveNewPassword = function (req, res) {
    var code = globals.helpers.sanitize(req.body.codeInput);
    var password = globals.helpers.sanitize(req.body.passwordInput);
    var confirmPassword = globals.helpers.sanitize(req.body.confirmPasswordInput);
    if (password === confirmPassword) {
        globals.users.saveNewPasswordForCode(code, password, function (success) {
            if (success) {
                res.flash('success', 'The password reset was successful. Please login with your new password.');
                res.redirect('/login');
            }
            else {
                res.flash('error', 'The password reset failed. Please get in touch with us.');
                res.redirect('/newPassword/' + code);
            }
        });
    }
    else {
        res.flash('error', 'The password reset failed. Did your password match?');
        res.redirect('/newPassword/' + code);
    }
};

exports.authenticated = function (req, res) {
    var email = globals.helpers.sanitize(req.body.emailInput);
    var password = globals.helpers.sanitize(req.body.passwordInput);
    globals.users.authenticate(email, password, function (user) {
        if (user) {
            req.session.user = user;
            res.redirect('/dashboard');
        }
        else {
            res.flash('error', 'Either the username or password were wrong! Please try again.');
            var locals = {user: req.session.user || ''};
            locals.pagetitle = 'Login - ' + globals.titleAddition;
            res.render('login', locals);
        }
    });
};

exports.registered = function (req, res) {
    var email = globals.helpers.sanitize(req.body.emailInputReg);
    var password = globals.helpers.sanitize(req.body.passwordInputReg);
    var confirmPassword = globals.helpers.sanitize(req.body.passwordConfirmInputReg);
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'Login - ' + globals.titleAddition;
    if (password === confirmPassword) {
        globals.users.create(email, password, function (user) {
            if (user === 'EXISTS') {
                globals.users.authenticate(email, password, function (user) {
                    if (user) {
                        req.session.user = user;
                        res.redirect('/dashboard');
                    }
                    else {
                        res.flash('error', 'Either the username or password were wrong! Please try again.');
                        res.render('login', locals);
                    }
                });
            }
            else if (user) {
                req.session.user = user;
                req.session.user.isNew = true;
                globals.users.startActivationProcess(email, function (success) {
                    res.redirect('/dashboard');
                });
            }
            else {
                res.flash('error', 'The user could not be created. Please try again.');
                res.render('login', locals);
            }
        });
    }
    else {
        res.flash('error', 'The passwords did not match! Please try again.');
        res.render('login', locals);
    }
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
    locals.pagetitle = 'Login - ' + globals.titleAddition;
    res.render('login', locals);
};
