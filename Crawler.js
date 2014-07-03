/*jslint nomen: true, node: true*/
/* global document */

// TODO: Price filter is not working
// TODO: Price filter should only happen if it has "price-el"
// TODO: List of filters?
// TODO: Check if keywords are working
// TODO: Whenever it doesn't have an element, do random string

'use strict';

var phridge = require("phridge"),
    async = require('async'),
    jsdom  = require('jsdom'),
    window = jsdom.jsdom().parentWindow,
    $;

function sysLog(env, msg) {
    console.log('[' + env + '] ' + msg);
}

function Crawler() {}

Crawler.prototype.search = function (obj, callback) {
    sysLog('info', 'Started searching...');

    var databases = obj.databases,
        searchCriteria = obj.searchCriteria,
        notInside = obj.notInside,
        that = this;

    if (!databases) {
        return callback(new Error('You need to set the databases'));
    }

    if (!searchCriteria) {
        return callback(new Error('You need to set the search params'));
    }

    this._searchCriteria = searchCriteria;
    this._notInside = notInside;
    this._databases = databases;

    async.series([
        function (callback) {
            // Initialize js dom
            jsdom.jQueryify(window, 'http://code.jquery.com/jquery.js', function () {
                $ = window.jQuery;

                callback();
            });
        },
        function (callback) {
            sysLog('info', 'Started requesting the databases');

            // Request the databases
            that._dataList = {};
            that._i = 0;
            that._iterate(callback);
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }

        sysLog('info', 'Ended search. Returning list');

        callback(null, that._dataList);
    });
};

/*
 * Iterate through the databases
*/
Crawler.prototype._iterate = function (callback) {
    var database = this._databases[this._i],
        name = database.name || this._i;

    this._database = database;
    this._currentArr = [];

    sysLog('info', 'Starting database ' + name);

    this._pageController(function (err) {
        if (err) {
            return callback(err);
        }

        // Checks if it doesn't want to iterate in the inside pages
        if (this._notInside) {
            // Populate datalist
            this._dataList[name] = this._currentArr;
            delete this._currentArr;
            delete this._currentPage;
            delete this._maxPages;
            delete this._i;

            return callback();
        }

        // Redo with the inside pages
        this._iterateInside(0, function (err, finalList) {
            if (err) {
                return callback(err);
            }

            sysLog('info', 'Ended iteration inside');

            // Populate datalist
            this._dataList[name] = finalList;
            delete this._currentArr;
            delete this._currentPage;
            delete this._maxPages;

            this._i += 1;

            // In case there are more databases
            if (this._i < this._databases.length) {
                return this._iterate(callback);
            }

            // There are no more databases callback!
            delete this._i;
            callback();
        }.bind(this));

    }.bind(this));
};

/*
 * Controles each page of the database returning the list
*/
Crawler.prototype._pageController = function (callback) {
    var searchCriteria = this._searchCriteria,
        timeoutTime = searchCriteria.timer || 1000,
        url = this._modifyUrl(),
        pageReady = Number(this._database['page-ready-time']) || 1;

    setTimeout(function () {
        // If already has done all the pages
        if (this._currentPage > this._maxPages) {
            return callback();
        }

        sysLog('warn', 'Requesting url: ' + url);
        this._request(url, pageReady, function (err) {
            sysLog('info', 'Set max pages available');
            this._checkNumberPages();

            // Build list
            sysLog('info', 'Building object');
            this._currentArr = this._currentArr.concat(this._buildObjects(this._database['list-elements']));

            // Request one more page since the maxPages hasn't been met yet
            this._pageController(callback);
        }.bind(this));
    }.bind(this), timeoutTime);
};

/*
 * Modify Url with search criteria
*/
Crawler.prototype._modifyUrl = function () {
    var database = this._database,
        searchCriteria = this._searchCriteria,
        url = database.url.toLowerCase(),
        pageGap = Number(database['page-gap']) || 1,
        pageStart = Number(database['page-start']) || 1,
        searchModifiers = searchCriteria['search-modifiers'],
        dbModifiers = database['page-modifiers'],

        value,
        key;

    this._currentPage = this._currentPage && Number(this._currentPage) + pageGap || pageStart;
    this._maxPages = this._maxPages || this._currentPage;

    url = url.replace('{{page}}', this._currentPage);

    // If the search criteria doesn't have any modifiers there is no need to continue
    if (!searchModifiers) {
        return url;
    }

    // Go through each key in the search criteria
    for (key in searchModifiers) {
        if (searchModifiers.hasOwnProperty(key) && searchModifiers[key] && searchModifiers[key] !== '') {
            value = searchModifiers[key];

            // Check if there are database specifics for the key
            if (dbModifiers.hasOwnProperty(key) && dbModifiers[key] && dbModifiers[key] !== '') {
                if (dbModifiers[key].hasOwnProperty(value) && dbModifiers[key][value] && dbModifiers[key][value] !== '') {
                    value = dbModifiers[key][value];
                }
            }

            // Finally replace the url key
            url = url.replace('{{' + key + '}}', value.toString().toLowerCase());
            // In case there is more than just one
            url = url.replace('{{' + key + '}}', value.toString().toLowerCase());
        }
    }

    return url;
};

/*
 * Iterate through the separate items
*/
Crawler.prototype._iterateInside = function (i, callback) {
    if (!this._currentArr[i]) {
        return callback(null, this._currentArr);
    }

    var searchCriteria = this._searchCriteria,
        url = this._currentArr[i].url,
        pageReady = Number(this._database['page-ready-time']) || 1,
        insideData;

    setTimeout(function () {
        sysLog('warn', 'Requesting url: ' + url);

        this._request(url, pageReady, function (err) {
            insideData = this._buildObjects(this._database['inside-elements'], true);

            if (!insideData || insideData.length === 0) {
                this._currentArr.splice(i, 1);
                i -= 1;
            } else {
                insideData = insideData[0];

                // Populate array object
                for (var key in insideData) {
                    if (insideData.hasOwnProperty(key)) {
                        this._currentArr[i][key] = insideData[key];
                    }
                }
            }

            // Advance to the next item
            i += 1;

            // In case there are more databases
            if (i < this._currentArr.length) {
                return this._iterateInside(i, callback);
            }

            // There are no more arrays callback!
            callback(null, this._currentArr);
        }.bind(this));
    }.bind(this), searchCriteria.timer);
};

/*
 * Iterate through each element in page list
*/
Crawler.prototype._buildObjects = function (listElements, checkKeywords) {
    if (!listElements) {
        return [];
    }

    var database = this._database,
        searchCriteria = this._searchCriteria,

        notKeywords = searchCriteria['not-keywords'] || [],
        keywords = searchCriteria.keywords || [],
        baseUrl = database['base-url'],
        $el = $(listElements.el || ''),

        removeElements = this._removeElements,
        keywordsFnc = this._keywords,

        items = [];

    // Go through each element
    $el.each(function () {
        var key,
            el,
            obj = {},
            $this = $(this);


        for (key in listElements) {
            if (listElements.hasOwnProperty(key) && listElements[key] && listElements[key] !== '' && key !== 'el') {
                el = listElements[key];

                if (key.replace('url-', '') !== key) {
                    obj[key.replace('-el', '')] = $this.find(el).attr('href');
                } else if (key.replace('img-', '') !== key) {
                    obj[key.replace('-el', '')] = $this.find(el).attr('src');
                } else {
                    obj[key.replace('-el', '')] = removeElements($this.find(el).text());
                }
            }
        }

        // In case the database needs a http:// base url
        if (obj.url && baseUrl) {
            obj.url = baseUrl + obj.url;
        }

        // Price related
        // obj.price = obj.price && obj.price.match(/\d+/g) || 1;
        // obj.price = typeof obj.price === 'object' && obj.price[0] || obj.price;
        // obj.price = Number(obj.price);

        // Check if there are not-keywords
        if (!keywordsFnc(notKeywords, obj)) {
            if (checkKeywords && keywordsFnc(keywords, obj) || !checkKeywords) {
                items.push(obj);
            }
        }
    });

    return items;
};

/*
 * Checks for the max number of pages
*/
Crawler.prototype._checkNumberPages = function () {
    var pagesList = this._database['pages-list'],
        pagesMax = Number(this._database['page-max']) || 20,
        maxNumber = this._maxPages || 1,
        num;

    $(pagesList).each(function () {
        num = Number($(this).text());
        maxNumber = !isNaN(num) && num > maxNumber && num || maxNumber;
    });

    this._maxPages = maxNumber > pagesMax && pagesMax || maxNumber;
};

// -------------------------------------------------

/*
 * Request page method
*/
Crawler.prototype._request = function (url, pageReady, callback) {
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

        // Populate the html
        $('body').html(htmlPage);
        callback();
    }, function (err) {
        throw err;
    });
};

/*
 * Remove elements that are not needed
*/
Crawler.prototype._removeElements = function (str) {
    // Trim leading & trailing new lines and spaces
    str = str.replace(/^\s*/, '').replace(/\s*$/, '');

    // Replace double new lines with end + start paragraph
    // Note that duplicate new lines are swalled intentionally to avoid users
    // from tricking us with \n\n\n\n\n
    // Also spaces between new lines are intentionally removed
    str = str.replace(/\n *\n+/g, '</p><p>');

    // Replace single lines with new lines
    str = str.replace(/\n+/g, '<br/>');

    return str.trim();
};

/*
 * Check if object has not keywords
*/
Crawler.prototype._keywords = function (keywords, obj) {
    var item,
        key,
        i;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) {
            item = obj[key].toString().toLowerCase();

            // Iterate all not keywords
            for (i in keywords) {
                if (item.replace(keywords[i].toString().toLowerCase()) !== item) {
                    return true;
                }
            }
        }
    }

    return false;
};

/*
 * Check if object has the right prices
*/
Crawler.prototype._priceParams = function (searchCriteria, price) {
    var minPrice = searchCriteria['min-price'],
        maxPrice = searchCriteria['max-price'];

    if (minPrice) {
        minPrice = Number(minPrice);

        if (price < minPrice) {
            return false;
        }
    }

    if (maxPrice) {
        maxPrice = Number(maxPrice);

        if (price > maxPrice) {
            return false;
        }
    }

    return true;
};

module.exports = Crawler;