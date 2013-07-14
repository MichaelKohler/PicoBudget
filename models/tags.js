"use strict";

module.exports.getAllTags = function (aLogin, db, aCallback) {
  db.collection('tags', function (err, collection) {
    collection.find({user: aLogin}, {sort: [
      ['name', 1]
    ]}).toArray(function (err, items) {
      aCallback(items);
    });
  });
};

module.exports.addTag = function (aLogin, db, aTagName, aTagType, aCallback) {
  db.collection('tags', function (err, collection) {
    collection.findOne({user: aLogin, name: aTagName}, function (err, foundTag) {
      if (!foundTag) {
        var newTag = { user: aLogin, name: aTagName, type: aTagType };
        collection.insert(newTag, function (err, result) {
          if (result) {
            aCallback(true);
          }
          else {
            aCallback(false);
          }
        });
      }
      else {
        aCallback(false);
      }
    });
  });
};

module.exports.deleteTag = function (aLogin, db, aTagName, callback) {
  db.collection('tags', function (err, collection) {
    collection.findOne({user: aLogin, name: aTagName}, function (err, foundTag) {
      if (foundTag) {
        collection.remove({user: aLogin, name: aTagName}, function (err) {
          if (err) {
            callback(false);
          }
          else {
            callback(true);
          }
        });
      }
      else {
        callback(false);
      }
    });
  });
};
