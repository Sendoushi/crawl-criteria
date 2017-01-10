'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDom = exports.getUrl = exports.run = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _resourceLoader = require('jsdom/lib/jsdom/browser/resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _toughCookie = require('tough-cookie');

var _toughCookie2 = _interopRequireDefault(_toughCookie);

var _uniq = require('lodash/uniq.js');

var _uniq2 = _interopRequireDefault(_uniq);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

var _cloneDeep = require('lodash/cloneDeep.js');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _flattenDeep = require('lodash/flattenDeep.js');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

var _mailbox = require('./mailbox.js');

var _utils = require('./utils.js');

var _config = require('./config.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MIN_UPDATE_DIFF = 518400000; // 7 days
var cache = {};

//-------------------------------------
// Functions

/**
 * Get a random user agent
 * Used to avoid some crawling issues
 *
 * @returns {string}
 */
var getUserAgent = function getUserAgent() {
    var list = [
    // Chrome
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.149 Safari/537.36',
    // Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
    // Firefox
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1', 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0', 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0', 'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
    // IE
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko', 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko', 'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 7.0; InfoPath.3; .NET CLR 3.1.40767; Trident/6.0; en-IN)', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)', 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/4.0; InfoPath.2; SV1; .NET CLR 2.0.50727; WOW64)', 'Mozilla/5.0 (compatible; MSIE 10.0; Macintosh; Intel Mac OS X 10_7_3; Trident/6.0)', 'Mozilla/4.0 (Compatible; MSIE 8.0; Windows NT 5.2; Trident/6.0)', 'Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)', 'Mozilla/1.22 (compatible; MSIE 10.0; Windows 3.1)',
    // Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A', 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'];

    return list[Math.floor(Math.random() * list.length)];
};

/**
 * Get url config
 *
 * @returns {object}
 */
var getUrlConfig = function getUrlConfig() {
    return {
        // defaultEncoding: 'windows-1252',
        defaultEncoding: 'utf-8',
        detectMetaCharset: true,
        // headers: config.headers,
        pool: {
            maxSockets: 6
        },
        strictSSL: true,
        // TODO: What about rotating ips?
        // proxy: config.proxy,
        cookieJar: new _toughCookie2.default.CookieJar(null, { looseMode: true }),
        userAgent: getUserAgent(),
        // userAgent: `Node.js (${process.platform}; U; rv:${process.version}) AppleWebKit/537.36 (KHTML, like Gecko)`,
        // agent: config.agent,
        // agentClass: config.agentClass,
        agentOptions: {
            keepAlive: true,
            keepAliveMsecs: 115 * 1000
        }
    };
};

/**
 * Gets queried urls
 *
 * @param {object} data
 * @returns {array}
 */
var getQueriedUrls = function getQueriedUrls(data) {
    if (!data || !data.src) {
        throw new Error('A source is needed to query url');
    }

    if (typeof data.src !== 'string') {
        throw new Error('A source string is needed to query url');
    }

    var keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    // Lets cache the first one
    var srcs = void 0;

    // Now lets go per modifier
    keyModifiers.forEach(function (key) {
        var modifiersSet = data.modifiers[key];
        var srcsToSet = srcs || [data.src];

        // Per each url, set each modifier
        var newSrcs = srcsToSet.map(function (src) {
            return modifiersSet.map(function (modifier) {
                var actualSrcs = [];

                if ((typeof modifier === 'undefined' ? 'undefined' : _typeof(modifier)) === 'object') {
                    var min = modifier.min || 0;
                    var max = modifier.max || 10;

                    for (var i = min; i < max + 1; i += 1) {
                        actualSrcs.push(src.replace(new RegExp('{{' + key + '}}', 'g'), i));
                    }
                } else {
                    // Now for the general rule string
                    actualSrcs.push(src.replace(new RegExp('{{' + key + '}}', 'g'), modifier));
                }

                return actualSrcs;
            });
        });

        // Lets cache it now
        srcs = (0, _flattenDeep2.default)(newSrcs).filter(function (val) {
            return !!val;
        });
    });

    return (0, _uniq2.default)(srcs);
};

/**
 * Gets url markup
 *
 * @param {string} url
 * @returns {promise}
 */
var getUrl = function getUrl(url) {
    return new Promise(function (resolve, reject) {
        if (typeof url !== 'string') {
            throw new Error('Url needs to be a string');
        }

        // Finally download it!
        _resourceLoader2.default.download(url, getUrlConfig(), function (err, responseText) {
            if (err) {
                return reject(err);
            }

            resolve(responseText);
        });
    });
};

/**
 * Gets DOM from url
 *
 * @param {string} src
 * @param {string} type
 * @param {int} throttle
 * @param {boolean} enableJs
 * @param {string} waitFor
 * @returns {promise}
 */
var getDom = function getDom(src) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'url';
    var throttle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;
    var enableJs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var waitFor = arguments[4];
    return new Promise(function (resolve, reject) {
        if (typeof src !== 'string') {
            throw new Error('A source needs to be provided');
        }

        // Need to check if url is ok
        if (type === 'url' && !(0, _utils.isUrl)(src)) {
            throw new Error('Source not valid');
        }

        // First the throttle so it doesn't make the request before
        setTimeout(function () {
            // Prepare for possible errors
            var virtualConsole = enableJs ? _jsdom2.default.createVirtualConsole() : undefined;
            var errors = [];
            var logs = [];
            var warns = [];

            // Set the timer to wait for and evaluate evaluation
            var waitForTimer = function waitForTimer(window, selector, time) {
                var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

                time = waitFor || enableJs ? 2000 : 1;

                setTimeout(function () {
                    if (selector && window.$.find(selector).length === 0 && i < 10) {
                        return waitForTimer(window, selector, time, i + 1);
                    }

                    var docHtml = window.document.documentElement.innerHTML;
                    var toCache = { window: window, docHtml: docHtml, errors: errors, logs: logs, warns: warns };

                    // Save it
                    cache[src] = toCache;

                    // And resolve it
                    resolve(toCache);
                }, time);
            };

            if (enableJs) {
                virtualConsole.on('jsdomError', function (error) {
                    errors.push(error);
                });
                virtualConsole.on('error', function (error) {
                    errors.push(error);
                });
                virtualConsole.on('log', function (log) {
                    logs.push(log);
                });
                virtualConsole.on('warn', function (warn) {
                    warns.push(warn);
                });
            }

            // Lets check if it exists in cache...
            if (cache[src]) {
                return waitForTimer(cache[src].window, waitFor);
            }

            // If not... lets just get it
            var config = (0, _merge2.default)(getUrlConfig(), {
                virtualConsole: virtualConsole,
                scripts: ['http://code.jquery.com/jquery.min.js'],
                features: {
                    FetchExternalResources: enableJs ? ['script'] : [],
                    ProcessExternalResources: enableJs ? ['script'] : [],
                    SkipExternalResources: !enableJs
                },
                done: function done(err, window) {
                    if (err) {
                        return reject(err);
                    }

                    // Wait for selector to be available
                    waitForTimer(window, waitFor);
                }
            });

            // Now for the actual getting
            _jsdom2.default.env(src, config);
        }, type === 'url' ? Math.round(throttle + Math.random() * throttle * 2) : 1);
        // Random throttle exists to avoid time patterns which may lead to some crawler issues
    });
};

/**
 * Gets scrap from element
 *
 * @param {element} parentEl
 * @param {object} data
 * @returns {object}
 */
var getScrap = function getScrap($, parentEl) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!parentEl || !parentEl.find) {
        throw new Error('A compliant parent element is needed to get the scrap');
    }

    var retrieve = data.retrieve || {};
    var retrieveKeys = Object.keys(retrieve);
    var results = {};

    // Lets iterate the retrieve requests
    for (var c = 0; c < retrieveKeys.length; c += 1) {
        var key = retrieveKeys[c];
        var req = retrieve[key];
        // So that we avoid possible crawling issues
        var els = parentEl.find('' + req.selector);
        var nested = req.retrieve;
        var attr = req.attribute;
        var ignore = req.ignore;
        var result = [];

        // Lets go per element...
        for (var d = 0; d < els.length; d += 1) {
            var el = els[d];
            var single = void 0;

            if (nested) {
                if (!$ || !$.find) {
                    throw new Error('A compliant $ is needed to get the scrap of nested');
                }

                // Ignore if the element has some "nofollow"
                if (el.getAttribute('rel') === 'nofollow') {
                    continue;
                }

                // No need to go for the content if it gots nested
                // Lets get the nested then
                single = getScrap($, $(el), req);
                result.push(single);
            } else {
                // Ignore if the element has some "nofollow"
                if (el.getAttribute('rel') === 'nofollow') {
                    continue;
                }

                // No nested, get content!
                single = !!attr ? el.getAttribute(attr) : el.textContent;
                !(0, _utils.contains)(ignore, single) && result.push(single);
            }
        }

        // Lets take care of ignore and finallycache it...
        results[key] = result;
    }

    return results;
};

/**
 * Gets single data
 *
 * @param {object} data
 * @return {promise}
 */
var getSingle = function getSingle() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!(0, _isArray2.default)(data)) {
        return new Promise(function () {
            throw new Error('Data needs to exist and be an array');
        });
    }

    if (!data.length) {
        return new Promise(function (resolve) {
            return resolve(data);
        });
    }

    // Lets go per each data member
    var promises = [];
    data.forEach(function (item) {
        // Lets check if we are still in the diff time
        if (!item.src || item.updatedAt && Date.now() - item.updatedAt < MIN_UPDATE_DIFF) {
            return;
        }

        // Make the request and get back
        var promise = getDom(item.src, 'url', item.throttle, item.enableJs, item.waitFor).then(function (singleDom) {
            var el = singleDom.window.$;

            // Cache data
            item.result = getScrap(el, el, item);
            item.updatedAt = new Date().getTime();

            // Remove retrieve we no longer need it
            delete item.retrieve;

            return item;
        });

        promises.push(promise);
    });

    return Promise.all(promises);
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
var gatherData = function gatherData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!(0, _isArray2.default)(data)) {
        return new Promise(function () {
            throw new Error('Data needs to exist and be an array');
        });
    }

    if (!data.length) {
        return new Promise(function (resolve) {
            return resolve();
        });
    }

    // Lets go per each data member
    var promises = [];
    data.forEach(function (item) {
        var promise = void 0;

        if (!item || (typeof item === 'undefined' ? 'undefined' : _typeof(item)) !== 'object') {
            promise = new Promise(function () {
                throw new Error('A data object is required to get the url');
            });
            promises.push(promise);

            return;
        }

        if (!item.src || typeof item.src !== 'string') {
            promise = new Promise(function () {
                throw new Error('A src is required to get the url');
            });
            promises.push(promise);

            return;
        }

        // Lets set the basics
        item.results = getQueriedUrls(item).map(function (url) {
            var resultItem = (0, _cloneDeep2.default)(item);
            resultItem.src = url;

            return resultItem;
        });

        // Inform that all started
        (0, _mailbox.send)('output.onUpdate', item.results.length);

        promise = getSingle(item.results).then(function (singleData) {
            // Lets save the data coming in
            (0, _mailbox.send)('output.saveItem', item);

            return singleData;
        });

        // Cache promise
        promises.push(promise);
    });

    return Promise.all(promises).then(function () {
        return data;
    });
};

/**
 * Initialize scraper
 *
 * @param {object|string} baseConfig
 * @returns {promise}
 */
var run = function run(baseConfig) {
    // Inform that all started
    (0, _mailbox.send)('output.onStart');

    var promise = new Promise(function (resolve) {
        // Save the config data in case it isn't already...
        (0, _mailbox.send)('output.save', (0, _config.get)(baseConfig));

        // Now get the full file
        (0, _mailbox.send)('output.getFile', function (fileData) {
            return resolve(fileData);
        });
    }).then(function (config) {
        var gatherPromise = gatherData(config.data).then(function () {
            return new Promise(function (resolve) {
                // Results are already cached since the project
                // is using object/array references

                // Save the output
                (0, _mailbox.send)('output.save', config);

                // Inform that all ended
                (0, _mailbox.send)('output.onEnd');

                resolve(config);
            });
        });

        return gatherPromise;
    });

    return promise;
};

//-------------------------------------
// Runtime

exports.run = run;
exports.getUrl = getUrl;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJjYWNoZSIsImdldFVzZXJBZ2VudCIsImxpc3QiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJnZXRVcmxDb25maWciLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwiYWdlbnRPcHRpb25zIiwia2VlcEFsaXZlIiwia2VlcEFsaXZlTXNlY3MiLCJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJzcmNzIiwiZm9yRWFjaCIsIm1vZGlmaWVyc1NldCIsImtleSIsInNyY3NUb1NldCIsIm5ld1NyY3MiLCJtYXAiLCJhY3R1YWxTcmNzIiwibW9kaWZpZXIiLCJtaW4iLCJtYXgiLCJpIiwicHVzaCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwiZW5hYmxlSnMiLCJ3YWl0Rm9yIiwic2V0VGltZW91dCIsInZpcnR1YWxDb25zb2xlIiwiY3JlYXRlVmlydHVhbENvbnNvbGUiLCJ1bmRlZmluZWQiLCJlcnJvcnMiLCJsb2dzIiwid2FybnMiLCJ3YWl0Rm9yVGltZXIiLCJ3aW5kb3ciLCJzZWxlY3RvciIsInRpbWUiLCIkIiwiZmluZCIsImRvY0h0bWwiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImlubmVySFRNTCIsInRvQ2FjaGUiLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwiZW52Iiwicm91bmQiLCJnZXRTY3JhcCIsInBhcmVudEVsIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsIm5lc3RlZCIsImF0dHIiLCJhdHRyaWJ1dGUiLCJpZ25vcmUiLCJyZXN1bHQiLCJkIiwiZWwiLCJzaW5nbGUiLCJnZXRBdHRyaWJ1dGUiLCJ0ZXh0Q29udGVudCIsImdldFNpbmdsZSIsInByb21pc2VzIiwiaXRlbSIsInVwZGF0ZWRBdCIsIkRhdGUiLCJub3ciLCJwcm9taXNlIiwidGhlbiIsInNpbmdsZURvbSIsImdldFRpbWUiLCJhbGwiLCJnYXRoZXJEYXRhIiwicmVzdWx0SXRlbSIsInNpbmdsZURhdGEiLCJydW4iLCJiYXNlQ29uZmlnIiwiZmlsZURhdGEiLCJnYXRoZXJQcm9taXNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxrQkFBa0IsU0FBeEIsQyxDQUFtQztBQUNuQyxJQUFNQyxRQUFRLEVBQWQ7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUMsZUFBZSxTQUFmQSxZQUFlLEdBQU07QUFDdkIsUUFBTUMsT0FBTztBQUNUO0FBQ0EsMEdBRlMsRUFHVCx5SEFIUyxFQUlULHlHQUpTLEVBS1QsNkdBTFMsRUFNVCw2R0FOUyxFQU9ULDZHQVBTLEVBUVQsNkdBUlMsRUFTVCxzR0FUUyxFQVVULHdHQVZTLEVBV1QsMkdBWFM7QUFZVDtBQUNBLHFJQWJTO0FBY1Q7QUFDQSw4RUFmUyxFQWdCVCxtRUFoQlMsRUFpQlQsb0ZBakJTLEVBa0JULG9FQWxCUyxFQW1C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QVNwRSxJQUFULENBQWN5RSxPQUFkO0FBQ0gsS0ExQ0Q7O0FBNENBLFdBQU9sRSxRQUFRc0UsR0FBUixDQUFZVCxRQUFaLEVBQXNCTSxJQUF0QixDQUEyQjtBQUFBLGVBQU03RixJQUFOO0FBQUEsS0FBM0IsQ0FBUDtBQUNILENBMUREOztBQTREQTs7Ozs7O0FBTUEsSUFBTW9HLE1BQU0sU0FBTkEsR0FBTSxDQUFDQyxVQUFELEVBQWdCO0FBQ3hCO0FBQ0EsdUJBQUssZ0JBQUw7O0FBRUEsUUFBTVQsVUFBVSxJQUFJbEUsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUNyQztBQUNBLDJCQUFLLGFBQUwsRUFBb0IsaUJBQVUwRSxVQUFWLENBQXBCOztBQUVBO0FBQ0EsMkJBQUssZ0JBQUwsRUFBdUIsVUFBQ0MsUUFBRDtBQUFBLG1CQUFjM0UsUUFBUTJFLFFBQVIsQ0FBZDtBQUFBLFNBQXZCO0FBQ0gsS0FOZSxFQU9mVCxJQVBlLENBT1Ysa0JBQVU7QUFDWixZQUFNVSxnQkFBZ0JOLFdBQVd0QyxPQUFPM0QsSUFBbEIsRUFDckI2RixJQURxQixDQUNoQjtBQUFBLG1CQUFNLElBQUluRSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFhO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQSxtQ0FBSyxhQUFMLEVBQW9CZ0MsTUFBcEI7O0FBRUE7QUFDQSxtQ0FBSyxjQUFMOztBQUVBaEMsd0JBQVFnQyxNQUFSO0FBQ0gsYUFYVyxDQUFOO0FBQUEsU0FEZ0IsQ0FBdEI7O0FBY0EsZUFBTzRDLGFBQVA7QUFDSCxLQXZCZSxDQUFoQjs7QUF5QkEsV0FBT1gsT0FBUDtBQUNILENBOUJEOztBQWdDQTtBQUNBOztRQUVTUSxHLEdBQUFBLEc7UUFBSzVFLE0sR0FBQUEsTTtRQUFRUSxNLEdBQUFBLE07O0FBRXRCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCByZXNvdXJjZUxvYWRlciBmcm9tICdqc2RvbS9saWIvanNkb20vYnJvd3Nlci9yZXNvdXJjZS1sb2FkZXInO1xuaW1wb3J0IHRvdWdoQ29va2llIGZyb20gJ3RvdWdoLWNvb2tpZSc7XG5pbXBvcnQgdW5pcSBmcm9tICdsb2Rhc2gvdW5pcS5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcC5qcyc7XG5pbXBvcnQgZmxhdHRlbkRlZXAgZnJvbSAnbG9kYXNoL2ZsYXR0ZW5EZWVwLmpzJztcbmltcG9ydCB7IHNlbmQgfSBmcm9tICcuL21haWxib3guanMnO1xuaW1wb3J0IHsgaXNVcmwsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgY29uZmlnR2V0IH0gZnJvbSAnLi9jb25maWcuanMnO1xuXG5jb25zdCBNSU5fVVBEQVRFX0RJRkYgPSA1MTg0MDAwMDA7IC8vIDcgZGF5c1xuY29uc3QgY2FjaGUgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgYSByYW5kb20gdXNlciBhZ2VudFxuICogVXNlZCB0byBhdm9pZCBzb21lIGNyYXdsaW5nIGlzc3Vlc1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFVzZXJBZ2VudCA9ICgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gW1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyOC4wIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTBfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNy4xIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI2LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjQ7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjQuMyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjApIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MC4wLjIyMTQuOTMgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zMy4wLjE3NTAuMTQ5IFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAvLyBFZGdlXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDIuMC4yMzExLjEzNSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMjQ2JyxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6NDAuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC80MC4xJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgcnY6MzYuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zNi4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEwOyBydjozMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMzLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggaTU4NjsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IHJ2OjMxLjApIEdlY2tvLzIwMTMwNDAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjE7IHJ2OjMxLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgIC8vIElFXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzcuMDsgQVM7IHJ2OjExLjApIGxpa2UgR2Vja28nLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGUsIE1TSUUgMTEsIFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC42OyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjA7IEluZm9QYXRoLjI7IFNMQ0MxOyAuTkVUIENMUiAzLjAuNDUwNi4yMTUyOyAuTkVUIENMUiAzLjUuMzA3Mjk7IC5ORVQgQ0xSIDIuMC41MDcyNykgM2dwcC1nYmEgVU5UUlVTVEVELzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDcuMDsgSW5mb1BhdGguMzsgLk5FVCBDTFIgMy4xLjQwNzY3OyBUcmlkZW50LzYuMDsgZW4tSU4pJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC80LjA7IEluZm9QYXRoLjI7IFNWMTsgLk5FVCBDTFIgMi4wLjUwNzI3OyBXT1c2NCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF83XzM7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoQ29tcGF0aWJsZTsgTVNJRSA4LjA7IFdpbmRvd3MgTlQgNS4yOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS80LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzEuMjIgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyAzLjEpJyxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF85XzMpIEFwcGxlV2ViS2l0LzUzNy43NS4xNCAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNy4wLjMgU2FmYXJpLzcwNDZBMTk0QScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnXG4gICAgXTtcblxuICAgIHJldHVybiBsaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKV07XG59O1xuXG4vKipcbiAqIEdldCB1cmwgY29uZmlnXG4gKlxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0VXJsQ29uZmlnID0gKCkgPT4gKHtcbiAgICAvLyBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgIGRlZmF1bHRFbmNvZGluZzogJ3V0Zi04JyxcbiAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICBwb29sOiB7XG4gICAgICAgIG1heFNvY2tldHM6IDZcbiAgICB9LFxuICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IHJvdGF0aW5nIGlwcz9cbiAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICB1c2VyQWdlbnQ6IGdldFVzZXJBZ2VudCgpLFxuICAgIC8vIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICB9XG59KTtcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjYWNoZSB0aGUgZmlyc3Qgb25lXG4gICAgbGV0IHNyY3M7XG5cbiAgICAvLyBOb3cgbGV0cyBnbyBwZXIgbW9kaWZpZXJcbiAgICBrZXlNb2RpZmllcnMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCBtb2RpZmllcnNTZXQgPSBkYXRhLm1vZGlmaWVyc1trZXldO1xuICAgICAgICBjb25zdCBzcmNzVG9TZXQgPSBzcmNzIHx8IFtkYXRhLnNyY107XG5cbiAgICAgICAgLy8gUGVyIGVhY2ggdXJsLCBzZXQgZWFjaCBtb2RpZmllclxuICAgICAgICBjb25zdCBuZXdTcmNzID0gc3Jjc1RvU2V0Lm1hcChzcmMgPT4gbW9kaWZpZXJzU2V0Lm1hcChtb2RpZmllciA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3R1YWxTcmNzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbW9kaWZpZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWluID0gbW9kaWZpZXIubWluIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF4ID0gbW9kaWZpZXIubWF4IHx8IDEwO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1pbjsgaSA8IG1heCArIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhY3R1YWxTcmNzLnB1c2goc3JjLnJlcGxhY2UobmV3IFJlZ0V4cChgXFx7XFx7JHtrZXl9XFx9XFx9YCwgJ2cnKSwgaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm93IGZvciB0aGUgZ2VuZXJhbCBydWxlIHN0cmluZ1xuICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBtb2RpZmllcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYWN0dWFsU3JjcztcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIExldHMgY2FjaGUgaXQgbm93XG4gICAgICAgIHNyY3MgPSBmbGF0dGVuRGVlcChuZXdTcmNzKS5maWx0ZXIodmFsID0+ICEhdmFsKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bmlxKHNyY3MpO1xufTtcblxuLyoqXG4gKiBHZXRzIHVybCBtYXJrdXBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0VXJsID0gKHVybCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VybCBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgZG93bmxvYWQgaXQhXG4gICAgcmVzb3VyY2VMb2FkZXIuZG93bmxvYWQodXJsLCBnZXRVcmxDb25maWcoKSwgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVKc1xuICogQHBhcmFtIHtzdHJpbmd9IHdhaXRGb3JcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlID0gJ3VybCcsIHRocm90dGxlID0gMjAwMCwgZW5hYmxlSnMgPSBmYWxzZSwgd2FpdEZvcikgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIG5lZWRzIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gTmVlZCB0byBjaGVjayBpZiB1cmwgaXMgb2tcbiAgICBpZiAodHlwZSA9PT0gJ3VybCcgJiYgIWlzVXJsKHNyYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3VyY2Ugbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgdGhlIHRocm90dGxlIHNvIGl0IGRvZXNuJ3QgbWFrZSB0aGUgcmVxdWVzdCBiZWZvcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gUHJlcGFyZSBmb3IgcG9zc2libGUgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlID0gZW5hYmxlSnMgPyBqc2RvbS5jcmVhdGVWaXJ0dWFsQ29uc29sZSgpIDogdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBjb25zdCB3YXJucyA9IFtdO1xuXG4gICAgICAgIC8vIFNldCB0aGUgdGltZXIgdG8gd2FpdCBmb3IgYW5kIGV2YWx1YXRlIGV2YWx1YXRpb25cbiAgICAgICAgY29uc3Qgd2FpdEZvclRpbWVyID0gKHdpbmRvdywgc2VsZWN0b3IsIHRpbWUsIGkgPSAwKSA9PiB7XG4gICAgICAgICAgICB0aW1lID0gKHdhaXRGb3IgfHwgZW5hYmxlSnMpID8gMjAwMCA6IDE7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RvciAmJiB3aW5kb3cuJC5maW5kKHNlbGVjdG9yKS5sZW5ndGggPT09IDAgJiYgaSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3YWl0Rm9yVGltZXIod2luZG93LCBzZWxlY3RvciwgdGltZSwgaSArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRvY0h0bWwgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b0NhY2hlID0geyB3aW5kb3csIGRvY0h0bWwsIGVycm9ycywgbG9ncywgd2FybnMgfTtcblxuICAgICAgICAgICAgICAgIC8vIFNhdmUgaXRcbiAgICAgICAgICAgICAgICBjYWNoZVtzcmNdID0gdG9DYWNoZTtcblxuICAgICAgICAgICAgICAgIC8vIEFuZCByZXNvbHZlIGl0XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0b0NhY2hlKTtcbiAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChlbmFibGVKcykge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ3dhcm4nLCB3YXJuID0+IHsgd2FybnMucHVzaCh3YXJuKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIGl0IGV4aXN0cyBpbiBjYWNoZS4uLlxuICAgICAgICBpZiAoY2FjaGVbc3JjXSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhaXRGb3JUaW1lcihjYWNoZVtzcmNdLndpbmRvdywgd2FpdEZvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBub3QuLi4gbGV0cyBqdXN0IGdldCBpdFxuICAgICAgICBjb25zdCBjb25maWcgPSBtZXJnZShnZXRVcmxDb25maWcoKSwge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBzY3JpcHRzOiBbJ2h0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5Lm1pbi5qcyddLFxuICAgICAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgICAgICBGZXRjaEV4dGVybmFsUmVzb3VyY2VzOiBlbmFibGVKcyA/IFsnc2NyaXB0J10gOiBbXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IGVuYWJsZUpzID8gWydzY3JpcHQnXSA6IFtdLFxuICAgICAgICAgICAgICAgIFNraXBFeHRlcm5hbFJlc291cmNlczogIWVuYWJsZUpzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgZm9yIHNlbGVjdG9yIHRvIGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIHdhaXRGb3JUaW1lcih3aW5kb3csIHdhaXRGb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgZ2V0dGluZ1xuICAgICAgICBqc2RvbS5lbnYoc3JjLCBjb25maWcpO1xuICAgIH0sIHR5cGUgPT09ICd1cmwnID8gTWF0aC5yb3VuZCh0aHJvdHRsZSArIE1hdGgucmFuZG9tKCkgKiB0aHJvdHRsZSAqIDIpIDogMSk7XG4gICAgLy8gUmFuZG9tIHRocm90dGxlIGV4aXN0cyB0byBhdm9pZCB0aW1lIHBhdHRlcm5zIHdoaWNoIG1heSBsZWFkIHRvIHNvbWUgY3Jhd2xlciBpc3N1ZXNcbn0pO1xuXG4vKipcbiAqIEdldHMgc2NyYXAgZnJvbSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtlbGVtZW50fSBwYXJlbnRFbFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldFNjcmFwID0gKCQsIHBhcmVudEVsLCBkYXRhID0ge30pID0+IHtcbiAgICBpZiAoIXBhcmVudEVsIHx8ICFwYXJlbnRFbC5maW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgcGFyZW50IGVsZW1lbnQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXRyaWV2ZSA9IGRhdGEucmV0cmlldmUgfHwge307XG4gICAgY29uc3QgcmV0cmlldmVLZXlzID0gT2JqZWN0LmtleXMocmV0cmlldmUpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcblxuICAgIC8vIExldHMgaXRlcmF0ZSB0aGUgcmV0cmlldmUgcmVxdWVzdHNcbiAgICBmb3IgKGxldCBjID0gMDsgYyA8IHJldHJpZXZlS2V5cy5sZW5ndGg7IGMgKz0gMSkge1xuICAgICAgICBjb25zdCBrZXkgPSByZXRyaWV2ZUtleXNbY107XG4gICAgICAgIGNvbnN0IHJlcSA9IHJldHJpZXZlW2tleV07XG4gICAgICAgIC8vIFNvIHRoYXQgd2UgYXZvaWQgcG9zc2libGUgY3Jhd2xpbmcgaXNzdWVzXG4gICAgICAgIGNvbnN0IGVscyA9IHBhcmVudEVsLmZpbmQoYCR7cmVxLnNlbGVjdG9yfWApO1xuICAgICAgICBjb25zdCBuZXN0ZWQgPSByZXEucmV0cmlldmU7XG4gICAgICAgIGNvbnN0IGF0dHIgPSByZXEuYXR0cmlidXRlO1xuICAgICAgICBjb25zdCBpZ25vcmUgPSByZXEuaWdub3JlO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgICAgICAvLyBMZXRzIGdvIHBlciBlbGVtZW50Li4uXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZWxzLmxlbmd0aDsgZCArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGVsc1tkXTtcbiAgICAgICAgICAgIGxldCBzaW5nbGU7XG5cbiAgICAgICAgICAgIGlmIChuZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQgfHwgISQuZmluZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50ICQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAgb2YgbmVzdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZm9yIHRoZSBjb250ZW50IGlmIGl0IGdvdHMgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5lc3RlZCB0aGVuXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gZ2V0U2NyYXAoJCwgJChlbCksIHJlcSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lc3RlZCwgZ2V0IGNvbnRlbnQhXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gISFhdHRyID8gZWwuZ2V0QXR0cmlidXRlKGF0dHIpIDogZWwudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIWNvbnRhaW5zKGlnbm9yZSwgc2luZ2xlKSAmJiByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyB0YWtlIGNhcmUgb2YgaWdub3JlIGFuZCBmaW5hbGx5Y2FjaGUgaXQuLi5cbiAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBkYXRhXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFNpbmdsZSA9IChkYXRhID0gW10pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBlYWNoIGRhdGEgbWVtYmVyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgLy8gTGV0cyBjaGVjayBpZiB3ZSBhcmUgc3RpbGwgaW4gdGhlIGRpZmYgdGltZVxuICAgICAgICBpZiAoIWl0ZW0uc3JjIHx8IGl0ZW0udXBkYXRlZEF0ICYmIChEYXRlLm5vdygpIC0gaXRlbS51cGRhdGVkQXQgPCBNSU5fVVBEQVRFX0RJRkYpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IGFuZCBnZXQgYmFja1xuICAgICAgICBjb25zdCBwcm9taXNlID0gZ2V0RG9tKGl0ZW0uc3JjLCAndXJsJywgaXRlbS50aHJvdHRsZSwgaXRlbS5lbmFibGVKcywgaXRlbS53YWl0Rm9yKS50aGVuKHNpbmdsZURvbSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHNpbmdsZURvbS53aW5kb3cuJDtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgZGF0YVxuICAgICAgICAgICAgaXRlbS5yZXN1bHQgPSBnZXRTY3JhcChlbCwgZWwsIGl0ZW0pO1xuICAgICAgICAgICAgaXRlbS51cGRhdGVkQXQgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgcmV0cmlldmUgd2Ugbm8gbG9uZ2VyIG5lZWQgaXRcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtLnJldHJpZXZlO1xuXG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZSgpKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBlYWNoIGRhdGEgbWVtYmVyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHByb21pc2U7XG5cbiAgICAgICAgaWYgKCFpdGVtIHx8IHR5cGVvZiBpdGVtICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgZGF0YSBvYmplY3QgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpdGVtLnNyYyB8fCB0eXBlb2YgaXRlbS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzcmMgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2ljc1xuICAgICAgICBpdGVtLnJlc3VsdHMgPSBnZXRRdWVyaWVkVXJscyhpdGVtKS5tYXAodXJsID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdEl0ZW0gPSBjbG9uZURlZXAoaXRlbSk7XG4gICAgICAgICAgICByZXN1bHRJdGVtLnNyYyA9IHVybDtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEl0ZW07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluZm9ybSB0aGF0IGFsbCBzdGFydGVkXG4gICAgICAgIHNlbmQoJ291dHB1dC5vblVwZGF0ZScsIGl0ZW0ucmVzdWx0cy5sZW5ndGgpO1xuXG4gICAgICAgIHByb21pc2UgPSBnZXRTaW5nbGUoaXRlbS5yZXN1bHRzKVxuICAgICAgICAudGhlbihzaW5nbGVEYXRhID0+IHtcbiAgICAgICAgICAgIC8vIExldHMgc2F2ZSB0aGUgZGF0YSBjb21pbmcgaW5cbiAgICAgICAgICAgIHNlbmQoJ291dHB1dC5zYXZlSXRlbScsIGl0ZW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc2luZ2xlRGF0YTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FjaGUgcHJvbWlzZVxuICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IGRhdGEpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHNjcmFwZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGJhc2VDb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoYmFzZUNvbmZpZykgPT4ge1xuICAgIC8vIEluZm9ybSB0aGF0IGFsbCBzdGFydGVkXG4gICAgc2VuZCgnb3V0cHV0Lm9uU3RhcnQnKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBTYXZlIHRoZSBjb25maWcgZGF0YSBpbiBjYXNlIGl0IGlzbid0IGFscmVhZHkuLi5cbiAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWdHZXQoYmFzZUNvbmZpZykpO1xuXG4gICAgICAgIC8vIE5vdyBnZXQgdGhlIGZ1bGwgZmlsZVxuICAgICAgICBzZW5kKCdvdXRwdXQuZ2V0RmlsZScsIChmaWxlRGF0YSkgPT4gcmVzb2x2ZShmaWxlRGF0YSkpO1xuICAgIH0pXG4gICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgY29uc3QgZ2F0aGVyUHJvbWlzZSA9IGdhdGhlckRhdGEoY29uZmlnLmRhdGEpXG4gICAgICAgIC50aGVuKCgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZXN1bHRzIGFyZSBhbHJlYWR5IGNhY2hlZCBzaW5jZSB0aGUgcHJvamVjdFxuICAgICAgICAgICAgLy8gaXMgdXNpbmcgb2JqZWN0L2FycmF5IHJlZmVyZW5jZXNcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgb3V0cHV0XG4gICAgICAgICAgICBzZW5kKCdvdXRwdXQuc2F2ZScsIGNvbmZpZyk7XG5cbiAgICAgICAgICAgIC8vIEluZm9ybSB0aGF0IGFsbCBlbmRlZFxuICAgICAgICAgICAgc2VuZCgnb3V0cHV0Lm9uRW5kJyk7XG5cbiAgICAgICAgICAgIHJlc29sdmUoY29uZmlnKTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHJldHVybiBnYXRoZXJQcm9taXNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgcnVuLCBnZXRVcmwsIGdldERvbSB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnYXRoZXJEYXRhLCBnZXRTaW5nbGUsIGdldERvbSwgZ2V0U2NyYXAsIGdldFVybCwgZ2V0UXVlcmllZFVybHMsIGdldFVybENvbmZpZywgZ2V0VXNlckFnZW50IH07XG4iXX0=