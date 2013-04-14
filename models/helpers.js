"use strict";

module.exports.getAllAvailableCurrencies = function (db, callback) {
  db.collection('currencies', function (err, collection) {
    collection.find(function (err, cursor) {
      cursor.toArray(function (err, items) {
        callback(items);
      });
    });
  });
};

module.exports.formatBalance = function (balance) {
  var formattedBalance = parseFloat(balance).toFixed(2);
  return formattedBalance;
};