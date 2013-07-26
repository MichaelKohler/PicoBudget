'use strict';

exports.budget = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('budget', locals);
};
