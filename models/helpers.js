'use strict';

var globals = require('../globals');
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

module.exports.sendMail = function (aReceiver, aSubject, aMessage, aCallback) {
  var smtpTransport = globals.nodemailer.createTransport('SMTP',{
    service: 'Gmail',
    auth: {
      user: 'mkohler@picobudget.com',
      pass: 'ger4dyxjer9885gc'
    }
  });
  var mailOptions = {
    from: 'PicoBudget.com <no-reply@picobudget.com>',
    to: aReceiver,
    subject: aSubject,
    html: aMessage
  };
  smtpTransport.sendMail(mailOptions, function(err, response) {
    smtpTransport.close();
    aCallback(true);
  });
};

module.exports.getGeneratedCode = function() {
  var generatedCode = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return generatedCode;
};