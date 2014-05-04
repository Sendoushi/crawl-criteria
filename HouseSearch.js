/*jslint nomen: true, node: true*/

'use strict';

var request = require('request'),
    jsdom  = require('jsdom/lib/jsdom'),
    window = jsdom.jsdom().parentWindow,
    $;

function sysLog(env, msg) {
    console.log('[' + env + '] ' + msg);
}

function HouseSearch() {}

HouseSearch.prototype.search = function (obj, callback) {
    sysLog('info', 'Started searching...');

    this._searchCriteria = obj['search-criteria'];
    this._databases = obj.databases;

    if (!this._databases) {
        return callback(new Error('You need to set the databases'));
    }

    // Initialize js dom
    jsdom.jQueryify(window, 'http://code.jquery.com/jquery.js', function () {
        $ = window.jQuery;

        sysLog('info', 'Started iterating through the databases');

        this._dataList = {};
        this._i = 0;
        this._iterate(function (err) {
            if (err) {
                return callback(err);
            }

            sysLog('info', 'Ended search. Returning list');

            callback(null, this._dataList);
        }.bind(this));
    }.bind(this));
};

/*
 * Iterate through the databases
*/
HouseSearch.prototype._iterate = function (callback) {
    var database = this._databases[this._i],
        name = database.name || this._i;

    this._database = database;
    this._currentArr = [];

    sysLog('info', 'Starting database ' + name);

    this._pageController(function (err) {
        if (err) {
            return callback(err);
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
            this._i += 1;

            // In case there are more databases
            if (this._i < this._databases.length) {
                return this._iterate(callback);
            }

            // There are no more databases callback!
            delete this._i;
            callback(null);
        }.bind(this));

    }.bind(this));
};

/*
 * Controles each page of the database returning the list
*/
HouseSearch.prototype._pageController = function (callback) {
    var database = this._database,
        searchCriteria = this._searchCriteria,
        url = database.url.toLowerCase(),
        searchKey,
        key;

    for (key in searchCriteria) {
        searchKey = searchCriteria[key];
        if (searchCriteria.hasOwnProperty(key) && searchCriteria[key] && searchCriteria[key] !== '') {
            if (key !== 'keywords' && key !== 'not-keywords' && key !== 'aim' && key !== 'type') {
                url = url.replace('{{' + key + '}}', searchKey.toString().toLowerCase());
            } else if (key === 'aim' || key === 'type') {
                url = url.replace('{{' + key + '}}', database[key][searchKey]);
            }
        }
    }

    this._currentPage = this._currentPage && Number(this._currentPage) + database['page-gap'] || Number(database['page-start']) || 1;
    this._maxPages = this._maxPages || this._currentPage;

    url = url.replace('{{page}}', this._currentPage);

    setTimeout(function () {
        // If already has done all the pages
        if (this._currentPage > this._maxPages) {
            return callback();
        }

        sysLog('warn', 'Requesting url: ' + url);
        this._request(url, function (err) {
            // Build list
            this._currentArr = this._currentArr.concat(this._itemList());

            this._pageController(callback);
        }.bind(this));
    }.bind(this), searchCriteria.timer);
};

/*
 * Iterate through each element in page list
*/
HouseSearch.prototype._itemList = function () {
    var database = this._database,
        list = database.list,
        searchCriteria = this._searchCriteria,
        removeElements = this._removeElements,
        keywords = this._keywords,
        priceParams = this._priceParams,
        items = [],
        url,
        price,
        $this,
        obj;

    sysLog('info', 'Set max pages available');
    this._checkNumberPages();

    sysLog('info', 'Building object');

    // Go through each element
    $(list.element).each(function () {
        $this = $(this);
        url = list['base-url'] && list['base-url'] !== '' && list['base-url'] || '';
        price = list['price-el'] && list['price-el'] !== '' && removeElements($this.find(list['price-el']).text());

        obj = {
            'title': list['title-el'] && list['title-el'] !== '' && removeElements($this.find(list['title-el']).text()),
            'url': list['url-el'] && list['url-el'] !== '' && url + $this.find(list['url-el']).attr('href'),
            'description': list['description-el'] && list['description-el'] !== '' && removeElements($this.find(list['description-el']).text()),
            'price': price && price.match(/\d+/g) || 1
        };

        obj.price = typeof obj.price === 'object' && obj.price[0] || obj.price;
        obj.price = Number(obj.price);

        if (!keywords(searchCriteria['not-keywords'], obj) && priceParams(searchCriteria, obj.price)) {
            items.push(obj);
        }

    });

    return items;
};

/*
 * Checks for the max number of pages
*/
HouseSearch.prototype._checkNumberPages = function () {
    var pagesList = this._database.list['pages-list'],
        pagesMax = Number(this._database['page-max']),
        that = this,
        maxNumber;

    $(pagesList).each(function () {
        maxNumber = Number($(this).text());

        that._maxPages = !isNaN(maxNumber) && maxNumber > that._maxPages && maxNumber || that._maxPages;
    });

    that._maxPages = that._maxPages > pagesMax && pagesMax || that._maxPages;
};

/*
 * Iterate through the separate items
*/
HouseSearch.prototype._iterateInside = function (i, callback) {
    if (!this._currentArr[i]) {
        return callback(null, this._currentArr);
    }

    var searchCriteria = this._searchCriteria,
        url = this._currentArr[i].url,
        insideData;

    setTimeout(function () {
        sysLog('warn', 'Requesting url: ' + url);

        this._request(url, function (err) {
            insideData = this._insideData();

            if (!insideData) {
                this._currentArr.splice(i, 1);
                i -= 1;
            } else {
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
 * Get inside data
*/
HouseSearch.prototype._insideData = function () {
    var list = this._database.list['inside-item'],
        $this = $(list.element),
        searchCriteria = this._searchCriteria,
        removeElements = this._removeElements,
        keywords = this._keywords,
        obj;

    obj = {
        'description': list['description-el'] && list['description-el'] !== '' && removeElements($this.find(list['description-el']).text())
    };

    if (!keywords(searchCriteria['not-keywords'], obj) && keywords(searchCriteria.keywords, obj)) {
        return obj;
    }
};

// -------------------------------------------------

/*
 * Request page method
*/
HouseSearch.prototype._request = function (url, callback) {
    request(url, function (err, response, page) {
        if (!err && response.statusCode === 200) {
            var regex;

            // Only the content inside body is needed
            page = page.substring(page.indexOf('<body'), page.indexOf('</body'));

            // Remove all the scripts
            regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
            while (regex.test(page)) {
                page = page.replace(regex, '');
            }

            // Remove all the iframes
            regex = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
            while (regex.test(page)) {
                page = page.replace(regex, '');
            }

            // Populate the html
            $('html').html(page);
        } else {
            err = err || new Error('There was an error requesting the page: ' + url);
        }

        callback(err);
    }.bind(this));
};

/*
 * Remove elements that are not needed
*/
HouseSearch.prototype._removeElements = function (str) {
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
HouseSearch.prototype._keywords = function (keywords, obj) {
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
HouseSearch.prototype._priceParams = function (searchCriteria, price) {
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

module.exports = HouseSearch;