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
      collection.findOne({username:login, tag:tags[i]}, function(err, foundTag) {
        if (!foundTag) {
          var newTag = { username: login, name:tags[i] };
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

module.exports.removeTag = function(login, transName, db, callback) {
  db.collection('tags', function(err, collection) {
    collection.findOne({username:login, name:transName}, function(err, foundTag) {
      if (foundTag) {
        collection.remove({username:login, name:transName}, function(err) {
          err ? callback(null) : callback(true);
        });
      }
      else {
        callback(null);
      }
    });
  });
};
