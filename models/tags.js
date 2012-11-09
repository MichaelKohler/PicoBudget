module.exports.getAllTags = function(login, db, callback) {
  db.collection('tags', function(err, collection) {
    collection.find({user:login}, function(err, cursor) {
      cursor.toArray(function (err, items) {
        callback(items);
      });
    });
  });
};

module.exports.addTags = function(login, tags, db, callback) {
  db.collection('tags', function(err, collection) {
    // save all tags since a user can add multiple tags to a transaction
    for(var i = 0; i < tags.length; i++) {
      collection.findOne({user:login, tag:tags[i]}, function(err, foundTag) {
        if (!foundTag) {
          var newTag = { user: login, tag:tags[i] };
          collection.insert(newTag, function(err, result) {
            if (result)
              callback(newTag);
            else
              callback(null);
          });
        }
        else {
          callback("ALREADYEXISTS"); // we can ignore that the tag already exists!
        }
      });
    }
    callback("NOTAGSUBMITTED");
  });
};

module.exports.removeTag = function(login, tagName, db, callback) {
  db.collection('tags', function(err, collection) {
    collection.findOne({user:login, tag:tagName}, function(err, foundTag) {
      if (foundTag) {
        collection.remove({user:login, tag:tagName}, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });
  });
};
