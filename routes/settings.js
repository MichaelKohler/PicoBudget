exports.settings = function(req, res) {
  globals.getAllAvailableCurrencies(db, function(currencyList) {
    if (currencyList) {
      res.render('settings', { locals: {
        user: req.session.user || '',
        currencies: currencyList,
        changed: false
      }});
    }
  });
};

exports.settingsChanged = function(req, res) {
  var oldPW = req.body['oldPasswordInput'];
  var newPW = req.body['newPasswordInput'];
  var prefCurr = req.body['prefCurrDropdown'];

  users.changeSettings(req.session.user.user, oldPW, newPW, prefCurr, db, function(changed) {
    if (changed == "NOPWMATCH") {
      res.redirect('/settings?passwordsDidntMatch=true');
    }
    else if (changed) {
      req.session.user = changed; // we need to reinit the session because of the new password
      globals.getAllAvailableCurrencies(db, function(currencyList) {
        if (currencyList) {
          res.render('settings', { locals: {
            user: req.session.user || '',
            currencies: currencyList,
            changed: true
          }});
        }
      });
    }
    else {
      res.redirect('/settings?unknownError=true');
    }    
  });
};

exports.userDeleted = function(req, res) {
  users.removeUser(req.session.user.user, req.body["passwordInput"], db, function(removed) {
    if (removed) {
      delete req.session.user;
      res.redirect('/login?removed=true');
    }
    else {
      res.redirect('/settings?removed=false');
    } 
  });
  // TODO: remove other data too!
};