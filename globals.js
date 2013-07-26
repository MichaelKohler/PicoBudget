(function () {
  'use strict';

  exports.async = require('async');
  exports.bcrypt = require('bcrypt');

  /** MongoDB  */
  var mongo = require('mongodb');
  var dbServer = new mongo.Server('localhost', 27017, { auto_reconnect: true, poolSize: 1 });
  exports.db = new mongo.Db('pb', dbServer, { safe: true });

  /** Models **/
  exports.users = require('./models/users');
  exports.accounts = require('./models/accounts.js');
  exports.helpers = require('./models/helpers.js');
  exports.transactions = require('./models/transactions.js');
  exports.tags = require('./models/tags.js');

  /** Configuration **/
  exports.currencies = require('./currencies.json').currencies;

  return exports;
}());