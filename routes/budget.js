'use strict';

var globals = require('../globals');
var intl = require('intl');
var POSITIVE_SYMBOL = '+';
var NEGATIVE_SYMBOL = '-';

exports.budget = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Budget - ' + globals.titleAddition;
  var options = { month: "long", year: "numeric" };
  locals.currentMonth = intl.DateTimeFormat("de-DE", options).format(new Date());

  locals.earningPositions = [];
  locals.spendingPositions = [];
  globals.tags.getAllTags(req.session.user.user, function(allTagsList) {
    globals.async.each(allTagsList, function (position, callback) {
      if (position.type == POSITIVE_SYMBOL) {
        locals.earningPositions.push(position);
      }
      else if (position.type == NEGATIVE_SYMBOL) {
        locals.spendingPositions.push(position);
      }
      callback();
    }, function (err) {
      res.render('budget', locals);
    });
  });
};