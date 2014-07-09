'use strict';

var globals = require('../globals');

exports.reports = function (req, res) {
    var locals = {user: req.session.user || ''};
    locals.pagetitle = 'Reports - ' + globals.titleAddition;

    locals.spendingPerDay = {};
    locals.spendingPerDay.categories = ["Jan", "Feb", "March"];

    res.render('reports', locals);
};