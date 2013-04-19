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

module.exports.formatAmount = function (amount) {
  var fixedAmount = parseFloat(amount).toFixed(2);
  var formattedAmount = fixedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return formattedAmount;
};