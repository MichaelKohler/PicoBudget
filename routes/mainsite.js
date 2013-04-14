"use strict";

exports.index = function (req, res) {
  res.render('index', { locals: { user: req.session.user || ''} });
};

exports.faq = function (req, res) {
  res.render('faq', { locals: { user: req.session.user || ''} });
};

exports.introduction = function (req, res) {
  res.render('introduction', { locals: { user: req.session.user || ''} });
};

exports.premium = function (req, res) {
  res.render('premium', { locals: {user: req.session.user || ''} });
};

exports.about = function (req, res) {
  res.render('about', { locals: { user: req.session.user || ''} });
};
