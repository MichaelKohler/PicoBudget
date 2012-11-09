exports.login = function(req, res) {
  if (req.session.user)
    res.render('dashboard');
  else
    res.render('login', { locals: { user: req.session.user || '' } });
};

exports.authenticated = function(req, res) {
  users.authenticate(req.body['emailInput'], req.body['passwordInput'], db, function(user) {
     if (user) {
       req.session.user = user;
       res.redirect('/dashboard');
     }
     else {
       res.redirect('/login?wrongCredentials=true');
     }
  });
};

exports.registered = function(req, res) {
  users.create(req.body['emailInputReg'], req.body['passwordInputReg'], db, function(user) {
    if (user == "EXISTS") {
      res.redirect('/login?userExists=true');
    }
    else if (user) {
      req.session.user = user;
      res.redirect('/dashboard?registered=true');
      // TODO: send email to the user
    }
    else {
      res.redirect('/login?userNotCreated=true');
    }
  });
};

exports.logout = function(req, res) {
  delete req.session.user;
  res.redirect('/login?loggedOut=true');
};