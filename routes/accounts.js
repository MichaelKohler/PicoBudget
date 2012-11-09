exports.accounts = function(req, res) {
  accounts.getAllAccounts(req.session.user.user, db, function(accountList) {
    if (accountList) {
      accounts.sumBalance(accountList, function(sum) {
        globals.getAllAvailableCurrencies(db, function(currencyList) {
          if (currencyList) {
            res.render('accounts', { locals: {
              user: req.session.user || '',
              currencies: currencyList,
              accounts: accountList,
              balanceSum: globals.formatBalance(sum),
              accNumber: accountList.length
            }});
          }
        });
      });
    }
  });
};

exports.accountsAdded = function(req, res) {
  var accName = req.body['nameInput'];
  var accCurrency = req.body['currDropdown'];
  var accBalance = req.body['initBalanceInput'];
  accounts.addAccount(req.session.user.user, accName, accCurrency, accBalance, db, function(success) {
    if (success == "EXISTS")
      res.redirect('/accounts?accountAlreadyExists=true');
    else if (success)
      res.redirect('/accounts?accountAdded=true');
  });
};

exports.accountEdited = function(req, res) {
  var oldName = req.body['hiddenOldName'];
  var accName = req.body['editNameInput'];
  var accBalance = req.body['editInitBalanceInput'];
  accounts.editAccount(req.session.user.user, oldName, accName, accBalance, db, function(success) {
    if (success)
      res.redirect('/accounts?accountEdited=true');
    else
      res.redirect('/accounts?notEdited=true');
  });
};

exports.accountDeleted = function(req, res) {
  var accName = req.body['deleteNameInput'];
  accounts.deleteAccount(req.session.user.user, accName, db, function(success) {
    if (success)
      res.redirect('/accounts?accountDeleted=true');
    else
      res.redirect('/accounts?notDeleted=true');
  });
};
