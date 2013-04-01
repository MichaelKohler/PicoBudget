var globals = require('../globals').init();

exports.tagDeleted = function(req, res) {
  var tagName = req.body['tagNameInput'];
  globals.tags.removeTag(req.session.user.user, tagName, globals.db, function(success) {
    success ? res.redirect('/transactions?tagDeleted=true') : res.redirect('/transactions?tagDeleted=false');
  });
};
