'use strict';

var globals = require('../globals');

module.exports.BudgetPosition = {
  name: '',
  amount: '',
  type: '',

  init: function (aName, aAmount, aType) {
    this.name = aName;
    this.amount = aAmount;
    this.type = aType;
    return this;
  }
};

module.exports.getAllPositionLists = function (aLogin, aCallback) {
  globals.db.collection('budget', function (err, collection) {
    collection.find({user: aLogin}, {sort: [
      ['name', 1]
    ]}).toArray(function (err, items) {
      var lists = {};
      lists.earningPositions = [];
      lists.spendingPositions = [];
      globals.async.each(items, function (position, callback) {
        if (position.type == 1) {
          lists.earningPositions.push(position);
        }
        else if (position.type == -1) {
          lists.spendingPositions.push(position);
        }
        callback();
      }, function (err) {
        aCallback(lists);
      });
    });
  });
};

module.exports.addPosition = function (aLogin, aPosition, aCallback) {
  globals.db.collection('budget', function (err, collection) {
    collection.findOne({user: aLogin, name: aPosition.name}, function (err, foundPosition) {
      if (!foundPosition) {
        var newPosition = { user: aLogin, name: aPosition.name,
                            amount: parseFloat(aPosition.amount).toFixed(2),
                            type: aPosition.type };
        collection.insert(newPosition, function (err, result) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.deletePosition = function (aLogin, aPositionName, aCallback) {
  globals.db.collection('budget', function (err, collection) {
    collection.findOne({user: aLogin, name: aPositionName}, function (err, foundPosition) {
      if (foundPosition) {
        collection.remove({user: aLogin, name: aPositionName}, function (err) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};

module.exports.deleteAllPositions = function (aLogin, aCallback) {
  globals.db.collection('budget', function (err, collection) {
    collection.remove({user: aLogin}, function (err) {
      err ? aCallback(null) : aCallback(true);
    });
  });
};