'use strict';

var globals = require('../globals');

module.exports.Account = {
    name: '',
    currency: '',
    balance: '',

    initFull: function (aName, aCurrency, aBalance) {
        this.name = aName;
        this.currency = aCurrency;
        this.balance = aBalance;
        return this;
    },

    init: function (aName, aBalance) {
        this.name = aName;
        this.balance = aBalance;
        return this;
    }
};

module.exports.getAllAccounts = function (aLogin, aPrefCur, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.find({user: aLogin}).toArray(function (err, items) {
            var counter = 0;
            var accounts = [];
            if (items.length === 0) {
                aCallback(items); // immediately call callback since we don't have to go through conversion
            }

            // TODO: maybe we can find a better way to do this? seems quite hacky..
            globals.async.forEach(items, function(item, callback) {
                globals.helpers.convertCurrency(item.curr, aPrefCur, item.bal, function(converted) {
                    item.converted = converted;
                    accounts.push(item);
                    counter++;
                    if (counter === items.length) {
                        accounts.sort(function (acc1, acc2) {
                            return acc1.name.localeCompare(acc2.name);
                        });
                        aCallback(accounts);
                    }
                    callback();
                });
            });
        });
    });
};

module.exports.getAccount = function (aLogin, aName, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.findOne({user: aLogin, name: aName}, function (err, account) {
            if (err) {
                aCallback(null);
            }
            else {
                aCallback(account);
            }
        });
    });
};

module.exports.addAccount = function (aLogin, aAccount, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.findOne({user: aLogin, name: aAccount.name}, function (err, foundAccount) {
            if (!foundAccount) {
                var newAccount = { user: aLogin, name: aAccount.name, curr: aAccount.currency,
                    bal: parseFloat(aAccount.balance) };
                collection.insert(newAccount, function (err, result) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
            else {
                aCallback(null);
            }
        });
    });
};

module.exports.editAccount = function (aLogin, aOldName, aEditedAccount, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.findOne({user: aLogin, name: aOldName}, function (err, foundAccount) {
            if (foundAccount) {
                collection.update({user: aLogin, name: aOldName}, {$set: {name: aEditedAccount.name, bal: parseFloat(aEditedAccount.balance)}}, function (err) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
            else {
                aCallback(null);
            }
        });
    });
};

module.exports.deleteAccount = function (aLogin, aAccName, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.findOne({user: aLogin, name: aAccName}, function (err, foundAccount) {
            if (foundAccount) {
                collection.remove({user: aLogin, name: aAccName}, function (err) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
            else {
                aCallback(null);
            }
        });
    });
};

module.exports.deleteAllAccounts = function (aLogin, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.remove({user: aLogin}, function (err) {
            if (err) {
                aCallback(null);
            }
            else {
                aCallback(true);
            }
        });
    });
};

module.exports.setBalanceForTransaction = function (aLogin, aTransaction, aCallback) {
    globals.db.collection('accounts', function (err, collection) {
        collection.findOne({user: aLogin, name: aTransaction.account}, function (err, foundAccount) {
            if (foundAccount) {
                var newBalance = 0.00;
                if (aTransaction.type === '+') {
                    newBalance = parseFloat(foundAccount.bal) + parseFloat(aTransaction.amount);
                }
                else if (aTransaction.type === '-') {
                    newBalance = parseFloat(foundAccount.bal) - parseFloat(aTransaction.amount);
                }

                collection.update({name: aTransaction.account}, {$set: {bal: newBalance}}, function (err) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
            else {
                aCallback(null);
            }
        });
    });
};

module.exports.setBalanceForTransfer = function (aLogin, aTransaction, aCallback) {
    if (aTransaction.fromAccount === aTransaction.toAccount) {
        return aCallback(true);
    }
    globals.db.collection('accounts', function (err, collection) {
        globals.async.parallel([
            function updateFirstAccount(callback) {
                collection.findOne({user: aLogin, name: aTransaction.fromAccount}, function (err, foundAccount) {
                    if (foundAccount) {
                        var newFromBalance = parseFloat(foundAccount.bal) - parseFloat(aTransaction.amount);
                        collection.update({user: aLogin, name: aTransaction.fromAccount}, {$set: {bal: newFromBalance}}, function (err) {
                            if (err) {
                                callback(null);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            },
            function updateSecondAccount(callback) {
                collection.findOne({user: aLogin, name: aTransaction.toAccount}, function (err, foundAccount) {
                    if (foundAccount) {
                        var newToBalance = parseFloat(foundAccount.bal) + parseFloat(aTransaction.amount);
                        collection.update({user: aLogin, name: aTransaction.toAccount}, {$set: {bal: newToBalance}}, function (err) {
                            if (err) {
                                callback(null);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            }
        ], function (err) {
            if (err) {
                aCallback(null);
            }
            else {
                aCallback(true);
            }
        });
    });
};