'use strict';

var globals = require('../globals');

exports.tagOverview = function (req, res) {
  var tagname = req.params.tagname;
  var transpage = parseInt(req.params.transpage, 10);
  var limit = 10;
  globals.transactions.getAllTransactionsByTag(req.session.user.user, tagname, function(allTransactionsList) {
    if (allTransactionsList) {
      res.render('tag', { locals: {
        user: req.session.user || '',
        tag: tagname,
        transactions: allTransactionsList.slice(transpage*limit-limit, transpage*limit),
        page: transpage,
        needsMorePages: (allTransactionsList.length - transpage * 10 > 0)
      }});
    }
    else {
      res.flash('error', 'Unfortunately there was an error of which we can not recover! Please try again later.');
      res.redirect('/transactions/1');
    }
  });
};

exports.tagAdded = function (req, res) {
  var tagName = globals.helpers.sanitizeForJSON(req.body.tagNameInput);
  var tagType = globals.helpers.sanitizeForJSON(req.body.tagTypeDropdown);
  globals.tags.saveTag(req.session.user.user, tagName, tagType, function (success) {
    if (success) {
      res.flash('success', 'The tag has been added.');
    }
    else {
      res.flash('error', 'The tag could not be added.');
    }
    res.redirect('/transactions/1');
  });
};

exports.tagDeleted = function (req, res) {
  var tagName = globals.helpers.sanitizeForJSON(req.body.tagNameInput);
  globals.tags.deleteTag(req.session.user.user, tagName, function (success) {
    if (success) {
      res.flash('success', 'The tag has been deleted.');
    }
    else {
      res.flash('error', 'The tag could not be deleted. Please try again later.');
    }
    res.redirect('/transactions/1');
  });
};