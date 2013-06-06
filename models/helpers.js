"use strict";

module.exports.formatAmount = function (amount) {
  var fixedAmount = parseFloat(amount).toFixed(2);
  var formattedAmount = fixedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return formattedAmount;
};