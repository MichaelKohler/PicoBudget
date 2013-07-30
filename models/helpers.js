'use strict';

var validator = require('validator');

module.exports.formatAmount = function (aAmount) {
  var fixedAmount = parseFloat(aAmount).toFixed(2);
  var formattedAmount = fixedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\'');
  return formattedAmount;
};

module.exports.sumAccountBalance = function (aAccounts) {
  var sum = 0;
  for (var i = 0; i < aAccounts.length; i++) {
    sum += parseFloat(aAccounts[i].bal);
  }
  return sum;
};

module.exports.sanitize = function (aInput) {
  var sanitizedForJSON = aInput.replace('{', '').replace('}', '');
  var sanitized = validator.sanitize(sanitizedForJSON).xss();
  return sanitized;
};