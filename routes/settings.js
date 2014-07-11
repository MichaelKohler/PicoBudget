'use strict';

var globals = require('../globals');

exports.settings = function (req, res) {
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'Settings - ' + globals.titleAddition;
    globals.accounts.getAllAccounts(req.session.user.user, req.session.user.curr, function (accountList) {
        if (accountList) {
            locals.accounts = accountList;
            res.render('settings', locals);
        }
    });
};

exports.settingsChanged = function (req, res) {
    var oldPW = globals.helpers.sanitize(req.body.oldPasswordInput);
    var newPW = globals.helpers.sanitize(req.body.newPasswordInput);
    var prefCurr = globals.helpers.sanitize(req.body.prefCurrDropdown);
    var prefAcc = globals.helpers.sanitize(req.body.prefAccDropdown);

    globals.users.changeSettings(req.session.user.user, oldPW, newPW, prefCurr, prefAcc, function (updatedUser) {
        if (updatedUser) {
            req.session.user = updatedUser; // we need to reinit the session because of the new password
            res.flash('success', 'Your settings are saved.');
        }
        else {
            res.flash('error', 'We could not update the settings. Please try again.');
        }
        res.redirect('/settings');
    });
};

exports.userDeleted = function (req, res) {
    var locals = {};
    globals.async.series([
        function deleteUser(callback) {
            globals.users.removeUser(req.session.user.user, globals.helpers.sanitize(req.body.passwordInput), function (success) {
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
        },
        function deletePasswordResetsAndActivation(callback) {
            globals.users.deleteAllTemporaryCodes(req.session.user.user, function (success) {
                success ? callback() : callback({err: 'We could not delete all temporary data.'});
            });
        }
    ], function (err) {
        if (err) {
            locals.user = req.session.user || '';
            locals.pagetitle = 'About - ' + globals.titleAddition;
            res.flash('error', 'We could not remove all your data. Did you enter the correct password? If so, please contact us so we can remove it manually.');
            res.render('about', locals);
        }
        else {
            locals.user = '';
            locals.pagetitle = 'Login - ' + globals.titleAddition;
            delete req.session.user;
            res.flash('success', 'Your user account and all data associated with it was removed.');
            res.render('login', locals);
        }
    });
};

exports.exportAll = function (req, res) {
    var exportedData = {};
    globals.async.parallel([
        function getAllTransactions(callback) {
            globals.transactions.getAllTransactions(req.session.user.user, function (transactionList) {
                exportedData.transactions = transactionList;
                callback();
            });
        },
        function getAllAccounts(callback) {
            globals.accounts.getAllAccounts(req.session.user.user, req.session.user.curr, function (accountList) {
                exportedData.accounts = accountList;
                callback();
            });
        },
        function getAllTags(callback) {
            globals.tags.getAllTags(req.session.user.user, function (tagList) {
                exportedData.tags = tagList;
                callback();
            });
        },
        function getUserData(callback) {
            exportedData.user = req.session.user;
            callback();
        },
        function getPasswordResets(callback) {
            globals.users.getAllPasswordResets(req.session.user.user, function (resetList) {
                exportedData.passwordResets = resetList;
                callback();
            });
        }
    ], function (err) {
        res.json(exportedData);
    });
};