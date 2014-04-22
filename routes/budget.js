'use strict';

var globals = require('../globals');
var intl = require('intl');

exports.budget = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Budget - ' + globals.titleAddition;
  var options = { month: "long", year: "numeric" };
  locals.currentMonth = intl.DateTimeFormat("de-DE", options).format(new Date());

  locals.earningPositions = locals.spendingPositions = [];
  globals.budget.getAllPositionLists(req.session.user.user,  function(allPositionsLists) {
    locals.earningPositions = allPositionsLists.earningPositions;
    locals.spendingPositions = allPositionsLists.spendingPositions;
    res.render('budget', locals);
  });
};

exports.earningAdded = function (req, res) {
  var name = globals.helpers.sanitize(req.body.earningNameInput);
  var amount = globals.helpers.sanitize(req.body.earningAmountInput);
  var type = 1;
  var newPosition = globals.budget.BudgetPosition.init(name, amount, type);
  globals.budget.addPosition(req.session.user.user, newPosition, function (success) {
    if (success) {
      res.flash('success', 'The position has been added.');
    }
    else {
      res.flash('error', 'The position could not be added.');
    }
    res.redirect('/budget');
  });
};

exports.spendingAdded= function (req, res) {
  var name = globals.helpers.sanitize(req.body.spendingNameInput);
  var amount = globals.helpers.sanitize(req.body.spendingAmountInput);
  var type = -1;
  var newPosition = globals.budget.BudgetPosition.init(name, amount, type);
  globals.budget.addPosition(req.session.user.user, newPosition, function (success) {
    if (success) {
      res.flash('success', 'The position has been added.');
    }
    else {
      res.flash('error', 'The position could not be added.');
    }
    res.redirect('/budget');
  });
};