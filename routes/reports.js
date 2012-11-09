exports.reports = function(req, res) {
  res.render('reports', { locals: { user: req.session.user || ''} });
};
