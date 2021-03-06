'use strict';

var globals = require('../globals');

exports.transactions = function (req, res) {
    var transpage = parseInt(globals.helpers.sanitize(req.params.transpage), 10);
    var locals = { user: req.session.user || '', page: transpage };
    locals.currentDateString = new Date().toString();
    locals.pagetitle = 'Transactions - ' + globals.titleAddition;
    var limit = 10;
    globals.async.parallel([
        function getAllTrans(callback) {
            globals.transactions.getAllTransactions(req.session.user.user, function (allTransactionsList) {
                if (!allTransactionsList) {
                    return callback(null);
                }
                locals.transactions = allTransactionsList.slice(transpage * limit - limit, transpage * limit);
                locals.needsMorePages = (allTransactionsList.length - transpage * 10 > 0);
                callback();
            });
        },
        function getAllTags(callback) {
            globals.tags.getAllTags(req.session.user.user, function (tagList) {
                if (!tagList) {
                    return callback(null);
                }
                locals.tags = tagList;
                locals.tagsForAutocompletion = tagList.map(function (item) {
                    return item.name;
                });
                callback();
            });
        },
        function getAllAccounts(callback) {
            globals.accounts.getAllAccounts(req.session.user.user, req.session.user.curr, function (accList) {
                if (!accList) {
                    return callback(null);
                }
                locals.accounts = accList;
                callback();
            });
        }
    ], function (err) {
        if (err) {
            res.redirect('/dashboard');
        }
        else {
            res.render('transactions', locals);
        }
    });
};

exports.transactionAdded = function (req, res) {
    var transID = parseInt(globals.helpers.sanitize(req.body.lastTransIDInput), 10) + 1;
    var transAcc = globals.helpers.sanitize(req.body.transAccDropdown);
    var transType = globals.helpers.sanitize(req.body.transArtDropdown);
    var transName = globals.helpers.sanitize(req.body.transNameInput);
    var tags = globals.helpers.sanitize(req.body.transTagsInput);
    var transTags = tags.split(',');
    var transAmount = parseFloat(globals.helpers.sanitize(req.body.transAmountInput));
    var transDate = new Date(Date.parse(globals.helpers.sanitize(req.body.transDateInput)));
    var newTransaction = globals.transactions.Transaction.init(transID, transAcc, transType, transName, transTags, transAmount, transDate);
    globals.async.series([
        function addTransaction(callback) {
            globals.transactions.addTransaction(req.session.user.user, newTransaction, function (success) {
                success ? callback() : callback({err: 'We could not add the transaction.'});
            });
        },
        function setBalance(callback) {
            globals.accounts.setBalanceForTransaction(req.session.user.user, newTransaction, function (success) {
                success ? callback() : callback({err: 'We could not set the new balance.'});
            });
        },
        function addTagsToDB(callback) {
            globals.async.forEach(transTags, function (tag, callback) {
                globals.tags.saveTag(req.session.user.user, tag, transType, transAmount, function (success) {
                    success ? callback() : callback({err: 'We could not save a tag.'});
                });
            }, function (err) {
                err ? callback({err: 'We could not save all new tags.'}) : callback();
            });
        }
    ], function (err) {
        if (err) {
            res.flash('error', 'Unfortunately there was an error while adding your transaction: ' + err.err);
        }
        else {
            res.flash('success', 'The transaction has been added successfully!');
        }
        res.redirect('/transactions/1');
    });
};

exports.transferAdded = function (req, res) {
    var transID = parseInt(globals.helpers.sanitize(req.body.lastTransIDInput), 10) + 1;
    var transFromAcc = globals.helpers.sanitize(req.body.transAccFromDropdown);
    var transToAcc = globals.helpers.sanitize(req.body.transAccToDropdown);
    var transAmount = parseFloat(globals.helpers.sanitize(req.body.transferAmountInput));
    var transDate = new Date(Date.parse(globals.helpers.sanitize(req.body.transDateInput)));
    var newTransfer = globals.transactions.Transaction.initTransfer(transID, transFromAcc, transToAcc, transAmount, transDate);
    globals.async.series([
        function addTransfer(callback) {
            globals.transactions.addTransfer(req.session.user.user, newTransfer, function (success) {
                success ? callback() : callback({err: 'We could not add the transfer.'});
            });
        },
        function setBalance(callback) {
            globals.accounts.setBalanceForTransfer(req.session.user.user, newTransfer, function (success) {
                success ? callback() : callback({err: 'We could not set the new balance.'});
            });
        }
    ], function (err) {
        if (err) {
            res.flash('error', 'Unfortunately there was an error while adding your transfer: ' + err.err);
        }
        else {
            res.flash('success', 'The transfer has been added successfully!');
        }
        res.redirect('/transactions/1');
    });
};

exports.getMonthSpendingTransactions = function (req, res) {
    exports.getMonthXTransactions(req, res, "-");
};

exports.getMonthEarningTransactions = function (req, res) {
    exports.getMonthXTransactions(req, res, "+");
};

exports.getMonthXTransactions = function (req, res, aType) {
    var data = {};
    globals.transactions.getAllTransactions(req.session.user.user, function (allTransactionsList) {
        if (!allTransactionsList) {
            return callback(null);
        }
        var filtered = allTransactionsList.filter(function (element) {
            return element.date.getMonth() == new Date().getMonth() && element.art == aType;
        });
        var dates = [];
        var today = new Date();
        var dayOfMonth = today.getDate();
        for (var i = 1; i <= dayOfMonth; i++) {
            var entry = {};
            entry.date = new Date(today.getFullYear(), today.getMonth(), i);
            entry.amount = 0.00;
            entry.formattedDate = entry.date.getDate() + ".";
            dates.push(entry);
        }
        filtered.forEach(function (item) {
            var year = item.date.getFullYear();
            var month = item.date.getMonth();
            var day = item.date.getDate();
            dates.forEach(function (entry) {
                if (entry.date.getFullYear() == year && entry.date.getMonth() == month && entry.date.getDate() == day) {
                    entry.amount = parseFloat(entry.amount) + parseFloat(item.amount);
                    entry.amount.toFixed(2);
                }
            });
        });
        data.sums = dates;
        data.categories = dates.map(function (item) {
            return item.formattedDate;
        });
        res.send(data);
    });
};