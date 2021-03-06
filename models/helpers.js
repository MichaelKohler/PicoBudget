'use strict';

var globals = require('../globals');
var validator = require('validator');
var request = require('request');

module.exports.formatAmount = function (aAmount) {
    var fixedAmount = parseFloat(aAmount).toFixed(2);
    return fixedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\'');
};

module.exports.convertCurrency = function (aFrom, aTo, aAmount, aCallback) {
    var requestURL = 'http://rate-exchange.appspot.com/currency?from=' + aFrom + '&to=' + aTo;
    request(requestURL, function (error, response, result) {
        if (!error && response.statusCode === 200) {
            var converted = parseFloat(JSON.parse(result).rate) * aAmount;
            aCallback(converted);
        }
        else {
            aCallback(null);
        }
    });
};


module.exports.sumAccountBalance = function (aAccounts, aPreferredCurrency, aCallback) {
    var sum = 0;
    globals.async.each(aAccounts, function (account, callback) {
        var fromCurrency = account.curr;
        if (fromCurrency !== aPreferredCurrency) {
            module.exports.convertCurrency(fromCurrency, aPreferredCurrency, account.bal, function (converted) {
                sum += converted;
                callback();
            });
        }
        else {
            sum += parseFloat(account.bal);
            callback();
        }
    }, function (err) {
        aCallback(sum.toFixed(2));
    });
};

module.exports.sanitize = function (aInput) {
    var sanitizedForJSON = aInput.replace('{', '').replace('}', '');
    return validator.sanitize(sanitizedForJSON).xss();
};

module.exports.sendMail = function (aReceiver, aSubject, aMessage, aCallback) {
    var smtpTransport = globals.nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: '...',
            pass: '...'
        }
    });
    var mailOptions = {
        from: 'PicoBudget.com <no-reply@picobudget.com>',
        to: aReceiver,
        subject: aSubject,
        html: aMessage
    };
    smtpTransport.sendMail(mailOptions, function (err, response) {
        smtpTransport.close();
        aCallback(true);
    });
};

module.exports.getGeneratedCode = function () {
    var generatedCode = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return generatedCode;
};