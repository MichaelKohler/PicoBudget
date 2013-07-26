'use strict';

exports.index = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('index', locals);
};

exports.faq = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('faq', locals);
};

exports.introduction = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('introduction', locals);
};

exports.premium = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('premium', locals);
};

exports.about = function (req, res) {
  var locals = {user: req.session.user || ''};
  res.render('about', locals);
};
