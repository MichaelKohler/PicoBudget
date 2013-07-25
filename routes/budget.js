'use strict';

exports.budget = function (req, res) {
  res.render('budget', { locals: { user: req.session.user || ''} });
};
