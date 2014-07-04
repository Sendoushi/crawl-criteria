'use strict';
module.exports = (function () {
    var request = require('./request'),
        filter = require('./filter'),
        jsdom  = require('jsdom'),
        window = jsdom.jsdom().parentWindow,
        $,

        database,
        searchCriteria,

        dataList = {},
        currentArr,

        currentPage,
        maxPages;

    function sysLog(env, msg) {
        console.log('[' + env + '] ' + msg);
    }

    function search(obj, callback) {
        database = obj.database;
        searchCriteria = obj.searchCriteria;

        if (!database) {
            return callback(new Error('You need to set the database.'));
        }

        if (!searchCriteria) {
            return callback(new Error('You need to set the search params'));
        }

        sysLog('info', 'Started searching...');

        // Initialize js dom
        jsdom.jQueryify(window, 'http://code.jquery.com/jquery.js', function () {
            $ = window.jQuery;

            sysLog('info', 'Started requesting the databases');

            // Request the databases
            dataList = {};

            // Start iteration
            iterate(function (err, results) {
                if (err) {
                    return callback(err);
                }

                sysLog('info', 'Ended search. Returning list');

                callback(null, dataList);
            });
        });
    }

    /*
     * Iterate through the databases
    */
    function iterate(callback) {
        var name = database.name || 'db';

        currentArr = [];

        sysLog('info', 'Starting database ' + name);

        pageController(function (err) {
            if (err) {
                return callback(err);
            }

            // Checks if it doesn't want to iterate in the inside pages
            if (!database.elements.insideElements || !database.elements.insideElements.el) {
                // Populate datalist
                dataList[name] = currentArr;
                return callback();
            }

            // Redo with the inside pages
            iterateInside(0, function (err, finalList) {
                if (err) {
                    return callback(err);
                }

                sysLog('info', 'Ended iteration inside');

                // Populate datalist
                dataList[name] = finalList;

                callback();
            });

        });
    }

    /*
     * Controles each page of the database returning the list
    */
    function pageController(callback) {
        var timeoutTime = searchCriteria.timer || 1000,
            url = modifyUrl(),
            pageReady = Number(database.page.readyTime) || 1;

        setTimeout(function () {
            // If already has done all the pages
            if (currentPage > maxPages) {
                return callback();
            }

            sysLog('warn', 'Requesting url: ' + url);
            request(url, pageReady, function (err, htmlPage) {
                if (err) {
                    return callback(new Error('Error requesting the page.'));
                }

                // Set the html
                $('body').html(htmlPage);

                sysLog('info', 'Set max pages available');
                checkNumberPages();

                // Build list
                sysLog('info', 'Building object');
                currentArr = currentArr.concat(buildObjects(database.elements.listElements));

                // Go through the filters
                currentArr = filter(currentArr, searchCriteria.filters);

                // Request one more page since the maxPages hasn't been met yet
                pageController(callback);
            });
        }, timeoutTime);
    }

    /*
     * Modify Url with search criteria
    */
    function modifyUrl() {
        var url = database.page.db.toLowerCase(),
            pageGap = Number(database.page.navIterate.gap) || 1,
            pageStart = Number(database.page.navIterate.start) || 1,
            searchModifiers = searchCriteria.searchModifiers,
            dbModifiers = database.page.pageModifiers,

            value,
            key;

        currentPage = currentPage && Number(currentPage) + pageGap || pageStart;
        maxPages = maxPages || currentPage;

        url = url.replace('{{page}}', currentPage);

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

                // TODO: do a match here instead of replace...
                // Finally replace the url key
                url = url.replace('{{' + key + '}}', value.toString().toLowerCase());

                // In case there is more than just one
                url = url.replace('{{' + key + '}}', value.toString().toLowerCase());
            }
        }

        return url;
    }

    /*
     * Checks for the max number of pages
    */
    function checkNumberPages() {
        var pagesList = database.elements.navLinks,
            pagesMax = Number(database.page.navIterate.max) || 20,
            maxNumber = maxPages || 1,
            num;

        $(pagesList).each(function () {
            num = Number($(this).text());
            maxNumber = !isNaN(num) && num > maxNumber && num || maxNumber;
        });

        maxPages = maxNumber > pagesMax && pagesMax || maxNumber;
    }

    /*
     * Iterate through each element in page list
    */
    function buildObjects(listElements) {
        if (!listElements) {
            return [];
        }

        var baseUrl = database.page.baseHref,
            $el = $(listElements.el || ''),

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

            items.push(obj);
        });

        return items;
    }

    /*
     * Iterate through the separate items
    */
    function iterateInside(i, callback) {
        if (!currentArr[i]) {
            return callback(null, currentArr);
        }

        var url = currentArr[i].url,
            pageReady = Number(database.page.readyTime) || 1,
            insideData;

        setTimeout(function () {
            sysLog('warn', 'Requesting url: ' + url);

            request(url, pageReady, function (err, htmlPage) {
                if (err) {
                    throw err;
                }

                // Set the html
                $('body').html(htmlPage);

                insideData = buildObjects(database.elements.insideElements);

                // Go through the filters
                insideData = filter(insideData, searchCriteria.filters);

                if (!insideData || insideData.length === 0) {
                    currentArr.splice(i, 1);
                    i -= 1;
                } else {
                    insideData = insideData[0];

                    // Populate array object
                    for (var key in insideData) {
                        if (insideData.hasOwnProperty(key)) {
                            currentArr[i][key] = insideData[key];
                        }
                    }
                }

                // Advance to the next item
                i += 1;

                // In case there are more databases
                if (i < currentArr.length) {
                    return iterateInside(i, callback);
                }

                // There are no more arrays callback!
                callback(null, currentArr);
            });
        }, searchCriteria.timer);
    }

    // -------------------------------------------------

    /*
     * Remove elements that are not needed
    */
    function removeElements(str) {
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
    }

    // Return the main function
    return search;
}());
