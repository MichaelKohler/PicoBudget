exports.index = function(req, res) {
  transactions.getLimitedTransactions(req.session.user.user, db, 5, function (transactionList) {
    accounts.getAllAccounts(req.session.user.user, db, function(accountList) {
      res.render('dashboard', { locals: {
        user: req.session.user || '',
        accounts: accountList,
        accNumber: accountList.length,
        transactions: transactionList
      }});
    });
  });
};
