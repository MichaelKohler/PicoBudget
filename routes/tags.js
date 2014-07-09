'use strict';

var globals = require('../globals');

exports.tagOverview = function (req, res) {
    var tagname = globals.helpers.sanitize(req.params.tagname);
    var tagtype = globals.helpers.sanitize(req.params.tagtype);
    var transpage = parseInt(globals.helpers.sanitize(req.params.transpage), 10);
    var limit = 10;
    globals.transactions.getAllTransactionsByTag(req.session.user.user, tagname, function (allTransactionsList) {
        if (allTransactionsList) {
            var locals = { user: req.session.user || '' };
            locals.pagetitle = 'Tag overview - ' + globals.titleAddition;
            locals.tag = tagname;
            locals.tagtype = tagtype;
            locals.transactions = allTransactionsList.slice(transpage * limit - limit, transpage * limit);
            locals.page = transpage;
            locals.needsMorePages = (allTransactionsList.length - transpage * 10 > 0);
            res.render('tag', locals);
        }
        else {
            res.flash('error', 'Unfortunately there was an error of which we can not recover! Please try again later.');
            res.redirect('/transactions/1');
        }
    });
};

exports.tagAdded = function (req, res) {
    var tagName = globals.helpers.sanitize(req.body.tagNameInput);
    var tagType = globals.helpers.sanitize(req.body.tagTypeDropdown);
    globals.tags.saveTag(req.session.user.user, tagName, tagType, 0.00, function (success) {
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
    var tagName = req.params.tagname;
    var tagType = req.params.tagtype;
    globals.tags.deleteTag(req.session.user.user, tagName, tagType, function (success) {
        if (success) {
            res.flash('success', 'The tag has been deleted.');
        }
        else {
            res.flash('error', 'The tag could not be deleted. Please try again later.');
        }
        res.redirect('/transactions/1');
    });
};

exports.getTagSums = function (req, res) {
    var data = {};
    globals.tags.getAllTags(req.session.user.user, function (allTags) {
        if (!allTags) {
            return callback(null);
        }
        data.tags = allTags;
        res.send(data);
    });
};