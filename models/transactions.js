'use strict';

var globals = require('../globals');

module.exports.Transaction = {
    id: 0,
    account: '',
    fromAccount: '',
    toAccount: '',
    type: '',
    name: '',
    tags: [],
    amount: 0.0,

    init: function (aID, aAccount, aType, aName, aTags, aAmount, aDate) {
        this.id = aID;
        this.account = aAccount;
        this.type = aType;
        this.name = aName;
        this.tags = aTags;
        this.amount = aAmount;
        this.date = aDate;
        return this;
    },

    initTransfer: function (aID, aFromAccount, aToAccount, aAmount, aDate) {
        this.id = aID;
        this.fromAccount = aFromAccount;
        this.toAccount = aToAccount;
        this.amount = aAmount;
        this.name = aFromAccount + ' -> ' + aToAccount;
        this.date = aDate;
        return this;
    }
};

module.exports.getAllTransactions = function (aLogin, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
        collection.find({user: aLogin}, {sort: [
            ['date', -1]
        ]}).toArray(function (err, items) {
            aCallback(items);
        });
    });
};

module.exports.getAllTransactionsByTag = function (aLogin, aTagName, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
        collection.find({user: aLogin, tags: aTagName}, {sort: [
            ['date', -1]
        ]}).toArray(function (err, items) {
            aCallback(items);
        });
    });
};

module.exports.getLimitedTransactions = function (aLogin, aPage, aLimitedEntries, aCallback) {
    var begin = (aPage - 1) * aLimitedEntries;
    globals.db.collection('transactions', function (err, collection) {
        collection.find({user: aLogin}, {skip: begin, limit: aLimitedEntries, sort: [
            ['date', -1]
        ]}).toArray(function (err, items) {
            aCallback(items);
        });
    });
};

module.exports.getTransactionsByAccount = function (aLogin, aName, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
        collection.find({user: aLogin, $or: [
                    {acc: aName},
                    {accTo: aName},
                    {accFrom: aName}
                ]},
                {sort: [
                    ['date', 1]
                ]}, function (err, cursor) {
                    cursor.toArray(function (err, items) {
                        aCallback(items);
                    });
                });
    });
};

module.exports.addTransaction = function (aLogin, aTransaction, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
        if (!aTransaction.date) {
            aTransaction.date = new Date();
        }
        var newTransaction = { user: aLogin, date: aTransaction.date, id: aTransaction.id, acc: aTransaction.account, art: aTransaction.type,
            name: aTransaction.name, tags: aTransaction.tags, amount: parseFloat(aTransaction.amount) };
        collection.insert(newTransaction, function (err, results) {
            if (err) {
                aCallback(null);
            }
            else {
                aCallback(true);
            }
        });
    });
};

module.exports.deleteAllTransactions = function (aLogin, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
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

module.exports.addTransfer = function (aLogin, aTransaction, aCallback) {
    globals.db.collection('transactions', function (err, collection) {
        if (!aTransaction.date) {
            aTransaction.date = new Date();
        }
        var newTransfer = { user: aLogin, date: aTransaction.date, id: aTransaction.id, accFrom: aTransaction.fromAccount,
            accTo: aTransaction.toAccount, amount: parseFloat(aTransaction.amount),
            name: aTransaction.name};
        collection.insert(newTransfer, function (err, result) {
            if (err) {
                aCallback(null);
            }
            else {
                aCallback(result);
            }
        });
    });
};