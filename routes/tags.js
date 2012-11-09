exports.tagDeleted = function(req, res) {
  var tagName = req.body['tagNameInput'];
  tags.removeTag(req.session.user.user, tagName, db, function(success) {
    success ? res.redirect('/transactions?tagDeleted=true') : res.redirect('/transactions?tagDeleted=false');
  });
};
