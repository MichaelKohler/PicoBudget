exports.transactions = function(req, res) {
  transactions.getAllTransactions(req.session.user.user, db, function(transactionList) {
    if (transactionList) {
      tags.getAllTags(req.session.user.user, db, function(tagList) {
        if (tagList) {
          accounts.getAllAccounts(req.session.user.user,db, function(accList) {
            if (accList) {
              res.render('transactions', { locals: {
                user: req.session.user || '',
                transactions: transactionList,
                tags: tagList,
                accounts: accList	
              }});
            }
          });
        }
      }); 
    }
    else {
      res.redirect('/transactions?error=true');
    }
  });
};

exports.transactionAdded = function(req, res) {
  var transID = req.body['transIDInput'];
  var transAcc = req.body['transAccDropdown'];
  var transArt = req.body['transArtDropdown'];
  var transName = req.body['transNameInput'];
  var transTags = req.body['transTagsInput'].split(',');
  var transAmount = req.body['transAmountInput'];
  transactions.addTransaction(req.session.user.user, transID, transAcc, transArt, transName,
                              transTags, transAmount, db, function(success) {
    success ? res.redirect('/transactions?added=true') : res.redirect('/transactions?added=false');
  });
};

exports.transactionEdited = function(req, res) {
  var transID = req.body['transID'];
  var transArt = req.body['transArtEditInput'];
  var transOldName = req.body['transOldName'];
  var transName = req.body['transNameEditInput'];
  var transTags = req.body['transTagsEdit'];
  var transAmount = req.body['transEditAmount'];
  transactions.editTransaction(req.session.user.user, transID, transArt, transName,
                               transTags, transAmount, db, function(successTrans) {
    successTrans ? res.redirect('/transactions?edited=true') : res.redirect('/transactions?edited=false');
  });
};	

exports.transactionDeleted = function(req, res) {
  var transID = req.body['transID'];
  transactions.removeTransaction(req.session.user.user, transID, db, function(success) {
    success ? res.redirect('/transactions?deleted=true') : res.redirect('/transactions?deleted=false');
  });
};
