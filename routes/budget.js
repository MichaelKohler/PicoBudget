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
  res.render('budget', locals);
};
