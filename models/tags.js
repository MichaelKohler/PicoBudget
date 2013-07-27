'use strict';

var globals = require('../globals');

module.exports.getAllTags = function (aLogin, aCallback) {
  globals.db.collection('tags', function (err, collection) {
    collection.find({user: aLogin}, {sort: [
      ['name', 1]
    ]}).toArray(function (err, items) {
      aCallback(items);
    });
  });
};

module.exports.saveTag = function (aLogin, aTagName, aTagType, aCallback) {
  globals.db.collection('tags', function (err, collection) {
    collection.findOne({user: aLogin, name: aTagName, type: aTagType}, function (err, foundTag) {
      if (!foundTag) {
        collection.insert({user: aLogin, name: aTagName, type: aTagType}, function (err, result) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(true);
      }
    });
  });
};

module.exports.deleteTag = function (aLogin, aTagName, aTagType, aCallback) {
  globals.db.collection('tags', function (err, collection) {
    collection.findOne({user: aLogin, name: aTagName, type: aTagType}, function (err, foundTag) {
      if (foundTag) {
        collection.remove({user: aLogin, name: aTagName, type: aTagType}, function (err) {
          err ? aCallback(null) : aCallback(true);
        });
      }
      else {
        aCallback(null);
      }
    });
  });
};
