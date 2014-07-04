'use strict';
module.exports = (function () {
    var search = require('./search'),

        databases,
        searchCriteria,
        dataObj,
        i;

    function sysLog(env, msg) {
        console.log('[' + env + '] ' + msg);
    }

    function iterate(obj, callback) {
        databases = obj.databases;
        searchCriteria = obj.searchCriteria;
        i = 0;
        dataObj = {};

        if (!databases) {
            return callback(new Error('You need to set the databases.'));
        }

        if (!searchCriteria) {
            return callback(new Error('You need to set the search params'));
        }

        // Start iterating
        sysLog('info', 'Started iterating...');
        searchIterate(callback);
    }

    function searchIterate(callback) {
        var db = databases[i];

        // Returns the data
        search({
            searchCriteria: searchCriteria,
            database: db
        }, function (err, list) {
            // In case there was an error requesting the data
            if (err) {
                return callback(err);
            }

            dataObj[db.name] = list;

            i += 1;

            if (i === databases.length) {
                callback(null, dataObj);
            } else {
                searchIterate(callback);
            }
        });
    }

    return iterate;
}());
