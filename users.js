var users = {
  'test1': {login: 'test1', password: 'test1', role: 'admin'},
  'test2': {login: 'test2', password: 'test2', role: 'user'}
};

module.exports.authenticate = function(login, password, callback) {
  var user = users[login];
  if (!user) {
     callback(null);
     return;
  }
  if (user.password == password) {
     callback(user);
     return;
  }
  callback(null);
};
