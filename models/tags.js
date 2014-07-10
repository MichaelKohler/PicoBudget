'use strict';

var globals = require('../globals');

module.exports.getAllTags = function (aLogin, aCallback) {
    globals.db.collection('tags', function (err, collection) {
        collection.find({user: aLogin}, {sort: [
            ['name', 1]
        ]}).toArray(function (err, items) {
            aCallback(items);
        });
    });
};

module.exports.saveTag = function (aLogin, aTagName, aTagType, aAmount, aCallback) {
    globals.db.collection('tags', function (err, collection) {
        collection.findOne({user: aLogin, name: aTagName, type: aTagType}, function (err, foundTag) {
            if (!foundTag) {
                collection.insert({user: aLogin, name: aTagName, type: aTagType, current: parseFloat(aAmount),
                                              lastUpdated: new Date(), amount: 0.00}, function (err, result) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
            else {
                var currentAmount = foundTag.current + aAmount;
                if (foundTag.lastUpdated.getMonth() < new Date().getMonth()) {
                    currentAmount = parseFloat(aAmount);
                }
                collection.update(foundTag, {$set: {current: currentAmount, lastUpdated: new Date()}}, function (err) {
                    if (err) {
                        aCallback(null);
                    }
                    else {
                        aCallback(true);
                    }
                });
            }
        });
    });
};

module.exports.deleteTag = function (aLogin, aTagName, aTagType, aCallback) {
    globals.db.collection('tags', function (err, collection) {
        collection.findOne({user: aLogin, name: aTagName, type: aTagType}, function (err, foundTag) {
            if (foundTag) {
                collection.remove({user: aLogin, name: aTagName, type: aTagType}, function (err) {
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

module.exports.updateBudgetTag = function (aLogin, aTagName, aNewAmount, aCallback) {
    globals.db.collection('tags', function (err, collection) {
        collection.findOne({user: aLogin, name: aTagName}, function (err, foundTag) {
            if (foundTag) {
                collection.update(foundTag, {$set: {amount: parseFloat(aNewAmount)}}, function (err) {
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
