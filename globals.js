(function () {
    "use strict";

    exports.init = function() {
        exports.users = require('./models/users');
        exports.accounts = require('./models/accounts.js');
        exports.helpers = require('./models/helpers.js');
        exports.transactions = require('./models/transactions.js');
        exports.tags = require('./models/tags.js');

        return exports;
    };
}());