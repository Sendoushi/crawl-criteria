/*jslint nomen: true, node: true*/

'use strict';

var async = require('../node_modules/async'),
    $ = require('../node_modules/jquerygo'),
    url = 'http://bpiexpressoimobiliario.pt/Apartamento/T2/Porto/Ramalde/a7193831',
    i = 0,
    obj = [];

function request() {
    console.log('Inside request');
    async.series([
        $.visit.bind($, url),
        $.waitForPage.bind($),
        function (callback) {
            $.getPage(callback.bind(this, null));
        },
        function (callback) {
            $('body').html(callback.bind(this, null));
        }
    ], function (err, results) {
        console.log('Reached the end');
        i += 1;
        console.log('This is the number ' + i + ' request');

        obj.push({
            'url': url,
            'html': results[3]
        });

        if (i > 1) {
            console.log(obj);
            $.close();
        } else {
            setTimeout(request, 1000);
        }
    });
}

request();