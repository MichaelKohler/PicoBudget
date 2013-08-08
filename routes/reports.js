'use strict';

var globals = require('../globals');

exports.reports = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Reports - ' + globals.titleAddition;
  res.render('reports', locals);
};