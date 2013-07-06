"use strict";

module.exports.getAllTags = function (aLogin, db, aCallback) {
  db.collection('tags', function (err, collection) {
    collection.find({user: aLogin}, function (err, cursor) {
      cursor.toArray(function (err, items) {
        aCallback(items);
      });
    });
  });
};
