'use strict';

var globals = require('../globals');

exports.index = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = globals.titleAddition;
  res.render('index', locals);
};

exports.introduction = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'Introduction - ' + globals.titleAddition;
  res.render('introduction', locals);
};

exports.about = function (req, res) {
  var locals = {user: req.session.user || ''};
  locals.pagetitle = 'About - ' + globals.titleAddition;
  res.render('about', locals);
};
