'use strict';

var globals = require('../globals');

exports.budget = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Budget - ' + globals.titleAddition;
  res.render('budget', locals);
};
