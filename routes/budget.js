'use strict';

var globals = require('../globals');

exports.budget = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Budget - ' + globals.titleAddition;

  var dateNow = new Date();
  // TODO: better fix for the names..
  var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December' ];
  locals.currentMonth = monthNames[dateNow.getMonth()];
  locals.currentYear = dateNow.getFullYear();

  locals.earningPositions = locals.spendingPositions = [];
  globals.budget.getAllPositions(req.session.user.user,  function(allPositionsList) {
    globals.async.each(allPositionsList, function (position, callback) {
      if (position.type == 1) {
        locals.earningPositions.push(position);
      }
      else if (position.type == -1) {
        locals.spendingPositions.push(position);
      }
      callback();
    }, function (err) {
      res.render('budget', locals);
    });
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