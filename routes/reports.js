'use strict';

exports.reports = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('reports', locals);
};
