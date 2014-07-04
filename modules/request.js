/* global document */

'use strict';
module.exports = (function () {
    var phridge = require('phridge');

    /*
     * Request page method
    */
    function request(url, pageReady, callback) {
        phridge.spawn()
        .then(function (phantom) {
            return phantom.openPage(url);
        })
        .then(function (page) {
            return page.run(function () {
                return this.evaluate(function () {
                    return document.body.innerHTML;
                });
            });
        })
        .finally(phridge.disposeAll)
        .done(function (htmlPage) {
            var regex;

            // Remove all the scripts
            regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            while (regex.test(htmlPage)) {
                htmlPage = htmlPage.replace(regex, '');
            }

            // Remove all the iframes
            regex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
            while (regex.test(htmlPage)) {
                htmlPage = htmlPage.replace(regex, '');
            }

            // Return the html
            callback(null, htmlPage);
        }, function (err) {
            callback(err);
        });
    }

    return request;
}());
