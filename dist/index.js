'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDom = exports.getUrl = exports.run = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _resourceLoader = require('jsdom/lib/jsdom/browser/resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _toughCookie = require('tough-cookie');

var _toughCookie2 = _interopRequireDefault(_toughCookie);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

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

    // TODO: What about modifiers combinations?

    var keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    // Lets cache the first one
    var srcs = void 0;

    // Lets get the first keyModifier
    // Lets get each value modifier
    // Use the original src and query it
    // Cache it
    // Lets get the second keyModifier
    // Lets get through all already set values

    // Modifiers are the keys to check
    // Its array are the value

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

        // data.modifiers[key].map(modifier => {
        // // Lets go per source and set the modifier
        // urls = urls.concat([data.src]).map(src => {
        //     const actualSrcs = [];

        //     if (typeof modifier === 'object') {
        //         const min = modifier.min || 0;
        //         const max = modifier.max || 10;

        //         for (let i = min; i < max + 1; i += 1) {
        //             actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i));
        //         }
        //     } else {
        //         // Now for the general rule string
        //         actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), modifier));
        //     }

        //     return actualSrcs;
        // });

        // // Lets flatten for the next iteration
        // urls = flattenDeep(urls).filter(val => !!val);
    });

    return srcs;
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

        // Lets make the name right
        item.name = item.name || _path2.default.basename(item.src);

        // Create the expected object
        var urls = getQueriedUrls(item).map(function (url) {
            return {
                src: url, retrieve: item.retrieve
            };
        });

        // Cache the urls
        item.results = urls;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJjYWNoZSIsImdldFVzZXJBZ2VudCIsImxpc3QiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJnZXRVcmxDb25maWciLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwiYWdlbnRPcHRpb25zIiwia2VlcEFsaXZlIiwia2VlcEFsaXZlTXNlY3MiLCJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJzcmNzIiwiZm9yRWFjaCIsIm1vZGlmaWVyc1NldCIsImtleSIsInNyY3NUb1NldCIsIm5ld1NyY3MiLCJtYXAiLCJhY3R1YWxTcmNzIiwibW9kaWZpZXIiLCJtaW4iLCJtYXgiLCJpIiwicHVzaCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwiZW5hYmxlSnMiLCJ3YWl0Rm9yIiwic2V0VGltZW91dCIsInZpcnR1YWxDb25zb2xlIiwiY3JlYXRlVmlydHVhbENvbnNvbGUiLCJ1bmRlZmluZWQiLCJlcnJvcnMiLCJsb2dzIiwid2FybnMiLCJ3YWl0Rm9yVGltZXIiLCJ3aW5kb3ciLCJzZWxlY3RvciIsInRpbWUiLCIkIiwiZmluZCIsImRvY0h0bWwiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImlubmVySFRNTCIsInRvQ2FjaGUiLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwiZW52Iiwicm91bmQiLCJnZXRTY3JhcCIsInBhcmVudEVsIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsIm5lc3RlZCIsImF0dHIiLCJhdHRyaWJ1dGUiLCJpZ25vcmUiLCJyZXN1bHQiLCJkIiwiZWwiLCJzaW5nbGUiLCJnZXRBdHRyaWJ1dGUiLCJ0ZXh0Q29udGVudCIsImdldFNpbmdsZSIsInByb21pc2VzIiwiaXRlbSIsInVwZGF0ZWRBdCIsIkRhdGUiLCJub3ciLCJwcm9taXNlIiwidGhlbiIsInNpbmdsZURvbSIsImdldFRpbWUiLCJhbGwiLCJnYXRoZXJEYXRhIiwibmFtZSIsImJhc2VuYW1lIiwidXJscyIsInNpbmdsZURhdGEiLCJydW4iLCJiYXNlQ29uZmlnIiwiZmlsZURhdGEiLCJnYXRoZXJQcm9taXNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUEsa0JBQWtCLFNBQXhCLEMsQ0FBbUM7QUFDbkMsSUFBTUMsUUFBUSxFQUFkOztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1DLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3ZCLFFBQU1DLE9BQU87QUFDVDtBQUNBLDBHQUZTLEVBR1QseUhBSFMsRUFJVCx5R0FKUyxFQUtULDZHQUxTLEVBTVQsNkdBTlMsRUFPVCw2R0FQUyxFQVFULDZHQVJTLEVBU1Qsc0dBVFMsRUFVVCx3R0FWUyxFQVdULDJHQVhTO0FBWVQ7QUFDQSxxSUFiUztBQWNUO0FBQ0EsOEVBZlMsRUFnQlQsbUVBaEJTLEVBaUJULG9GQWpCUyxFQWtCVCxvRUFsQlMs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LCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBqc2RvbSBmcm9tICdqc2RvbSc7XG5pbXBvcnQgcmVzb3VyY2VMb2FkZXIgZnJvbSAnanNkb20vbGliL2pzZG9tL2Jyb3dzZXIvcmVzb3VyY2UtbG9hZGVyJztcbmltcG9ydCB0b3VnaENvb2tpZSBmcm9tICd0b3VnaC1jb29raWUnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZS5qcyc7XG5pbXBvcnQgZmxhdHRlbkRlZXAgZnJvbSAnbG9kYXNoL2ZsYXR0ZW5EZWVwLmpzJztcbmltcG9ydCB7IHNlbmQgfSBmcm9tICcuL21haWxib3guanMnO1xuaW1wb3J0IHsgaXNVcmwsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgY29uZmlnR2V0IH0gZnJvbSAnLi9jb25maWcuanMnO1xuXG5jb25zdCBNSU5fVVBEQVRFX0RJRkYgPSA1MTg0MDAwMDA7IC8vIDcgZGF5c1xuY29uc3QgY2FjaGUgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgYSByYW5kb20gdXNlciBhZ2VudFxuICogVXNlZCB0byBhdm9pZCBzb21lIGNyYXdsaW5nIGlzc3Vlc1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFVzZXJBZ2VudCA9ICgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gW1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyOC4wIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTBfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNy4xIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI2LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjQ7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjQuMyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjApIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MC4wLjIyMTQuOTMgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zMy4wLjE3NTAuMTQ5IFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAvLyBFZGdlXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDIuMC4yMzExLjEzNSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMjQ2JyxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6NDAuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC80MC4xJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgcnY6MzYuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zNi4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEwOyBydjozMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMzLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggaTU4NjsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IHJ2OjMxLjApIEdlY2tvLzIwMTMwNDAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjE7IHJ2OjMxLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgIC8vIElFXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzcuMDsgQVM7IHJ2OjExLjApIGxpa2UgR2Vja28nLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGUsIE1TSUUgMTEsIFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC42OyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjA7IEluZm9QYXRoLjI7IFNMQ0MxOyAuTkVUIENMUiAzLjAuNDUwNi4yMTUyOyAuTkVUIENMUiAzLjUuMzA3Mjk7IC5ORVQgQ0xSIDIuMC41MDcyNykgM2dwcC1nYmEgVU5UUlVTVEVELzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDcuMDsgSW5mb1BhdGguMzsgLk5FVCBDTFIgMy4xLjQwNzY3OyBUcmlkZW50LzYuMDsgZW4tSU4pJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC80LjA7IEluZm9QYXRoLjI7IFNWMTsgLk5FVCBDTFIgMi4wLjUwNzI3OyBXT1c2NCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF83XzM7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoQ29tcGF0aWJsZTsgTVNJRSA4LjA7IFdpbmRvd3MgTlQgNS4yOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS80LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzEuMjIgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyAzLjEpJyxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF85XzMpIEFwcGxlV2ViS2l0LzUzNy43NS4xNCAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNy4wLjMgU2FmYXJpLzcwNDZBMTk0QScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnXG4gICAgXTtcblxuICAgIHJldHVybiBsaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKV07XG59O1xuXG4vKipcbiAqIEdldCB1cmwgY29uZmlnXG4gKlxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0VXJsQ29uZmlnID0gKCkgPT4gKHtcbiAgICAvLyBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgIGRlZmF1bHRFbmNvZGluZzogJ3V0Zi04JyxcbiAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICBwb29sOiB7XG4gICAgICAgIG1heFNvY2tldHM6IDZcbiAgICB9LFxuICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IHJvdGF0aW5nIGlwcz9cbiAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICB1c2VyQWdlbnQ6IGdldFVzZXJBZ2VudCgpLFxuICAgIC8vIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICB9XG59KTtcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IG1vZGlmaWVycyBjb21iaW5hdGlvbnM/XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjYWNoZSB0aGUgZmlyc3Qgb25lXG4gICAgbGV0IHNyY3M7XG5cbiAgICAvLyBMZXRzIGdldCB0aGUgZmlyc3Qga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgZWFjaCB2YWx1ZSBtb2RpZmllclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbCBzcmMgYW5kIHF1ZXJ5IGl0XG4gICAgICAgICAgICAvLyBDYWNoZSBpdFxuICAgIC8vIExldHMgZ2V0IHRoZSBzZWNvbmQga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgdGhyb3VnaCBhbGwgYWxyZWFkeSBzZXQgdmFsdWVzXG5cbiAgICAvLyBNb2RpZmllcnMgYXJlIHRoZSBrZXlzIHRvIGNoZWNrXG4gICAgLy8gSXRzIGFycmF5IGFyZSB0aGUgdmFsdWVcblxuICAgIC8vIE5vdyBsZXRzIGdvIHBlciBtb2RpZmllclxuICAgIGtleU1vZGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVyc1NldCA9IGRhdGEubW9kaWZpZXJzW2tleV07XG4gICAgICAgIGNvbnN0IHNyY3NUb1NldCA9IHNyY3MgfHwgW2RhdGEuc3JjXTtcblxuICAgICAgICAvLyBQZXIgZWFjaCB1cmwsIHNldCBlYWNoIG1vZGlmaWVyXG4gICAgICAgIGNvbnN0IG5ld1NyY3MgPSBzcmNzVG9TZXQubWFwKHNyYyA9PiBtb2RpZmllcnNTZXQubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gTGV0cyBjYWNoZSBpdCBub3dcbiAgICAgICAgc3JjcyA9IGZsYXR0ZW5EZWVwKG5ld1NyY3MpLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgICAgIC8vIGRhdGEubW9kaWZpZXJzW2tleV0ubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgLy8gLy8gTGV0cyBnbyBwZXIgc291cmNlIGFuZCBzZXQgdGhlIG1vZGlmaWVyXG4gICAgICAgIC8vIHVybHMgPSB1cmxzLmNvbmNhdChbZGF0YS5zcmNdKS5tYXAoc3JjID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAvLyAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgLy8gICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgIC8vICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgLy8gICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyAvLyBMZXRzIGZsYXR0ZW4gZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAvLyB1cmxzID0gZmxhdHRlbkRlZXAodXJscykuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3Jjcztcbn07XG5cbi8qKlxuICogR2V0cyB1cmwgbWFya3VwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFVybCA9ICh1cmwpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVcmwgbmVlZHMgdG8gYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgZ2V0VXJsQ29uZmlnKCksIChlcnIsIHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge2ludH0gdGhyb3R0bGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlSnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB3YWl0Rm9yXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0RG9tID0gKHNyYywgdHlwZSA9ICd1cmwnLCB0aHJvdHRsZSA9IDIwMDAsIGVuYWJsZUpzID0gZmFsc2UsIHdhaXRGb3IpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBuZWVkcyB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IHRoZSB0aHJvdHRsZSBzbyBpdCBkb2Vzbid0IG1ha2UgdGhlIHJlcXVlc3QgYmVmb3JlXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIFByZXBhcmUgZm9yIHBvc3NpYmxlIGVycm9yc1xuICAgICAgICBjb25zdCB2aXJ0dWFsQ29uc29sZSA9IGVuYWJsZUpzID8ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICAvLyBTZXQgdGhlIHRpbWVyIHRvIHdhaXQgZm9yIGFuZCBldmFsdWF0ZSBldmFsdWF0aW9uXG4gICAgICAgIGNvbnN0IHdhaXRGb3JUaW1lciA9ICh3aW5kb3csIHNlbGVjdG9yLCB0aW1lLCBpID0gMCkgPT4ge1xuICAgICAgICAgICAgdGltZSA9ICh3YWl0Rm9yIHx8IGVuYWJsZUpzKSA/IDIwMDAgOiAxO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IgJiYgd2luZG93LiQuZmluZChzZWxlY3RvcikubGVuZ3RoID09PSAwICYmIGkgPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2FpdEZvclRpbWVyKHdpbmRvdywgc2VsZWN0b3IsIHRpbWUsIGkgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkb2NIdG1sID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUw7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9DYWNoZSA9IHsgd2luZG93LCBkb2NIdG1sLCBlcnJvcnMsIGxvZ3MsIHdhcm5zIH07XG5cbiAgICAgICAgICAgICAgICAvLyBTYXZlIGl0XG4gICAgICAgICAgICAgICAgY2FjaGVbc3JjXSA9IHRvQ2FjaGU7XG5cbiAgICAgICAgICAgICAgICAvLyBBbmQgcmVzb2x2ZSBpdFxuICAgICAgICAgICAgICAgIHJlc29sdmUodG9DYWNoZSk7XG4gICAgICAgICAgICB9LCB0aW1lKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoZW5hYmxlSnMpIHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2xvZycsIGxvZyA9PiB7IGxvZ3MucHVzaChsb2cpOyB9KTtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCd3YXJuJywgd2FybiA9PiB7IHdhcm5zLnB1c2god2Fybik7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBjaGVjayBpZiBpdCBleGlzdHMgaW4gY2FjaGUuLi5cbiAgICAgICAgaWYgKGNhY2hlW3NyY10pIHtcbiAgICAgICAgICAgIHJldHVybiB3YWl0Rm9yVGltZXIoY2FjaGVbc3JjXS53aW5kb3csIHdhaXRGb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgbm90Li4uIGxldHMganVzdCBnZXQgaXRcbiAgICAgICAgY29uc3QgY29uZmlnID0gbWVyZ2UoZ2V0VXJsQ29uZmlnKCksIHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLFxuICAgICAgICAgICAgc2NyaXB0czogWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5taW4uanMnXSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogZW5hYmxlSnMgPyBbJ3NjcmlwdCddIDogW10sXG4gICAgICAgICAgICAgICAgUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzOiBlbmFibGVKcyA/IFsnc2NyaXB0J10gOiBbXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6ICFlbmFibGVKc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbmU6IChlcnIsIHdpbmRvdykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIHJlamVjdChlcnIpOyB9XG5cbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBzZWxlY3RvciB0byBiZSBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICB3YWl0Rm9yVGltZXIod2luZG93LCB3YWl0Rm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm93IGZvciB0aGUgYWN0dWFsIGdldHRpbmdcbiAgICAgICAganNkb20uZW52KHNyYywgY29uZmlnKTtcbiAgICB9LCB0eXBlID09PSAndXJsJyA/IE1hdGgucm91bmQodGhyb3R0bGUgKyBNYXRoLnJhbmRvbSgpICogdGhyb3R0bGUgKiAyKSA6IDEpO1xuICAgIC8vIFJhbmRvbSB0aHJvdHRsZSBleGlzdHMgdG8gYXZvaWQgdGltZSBwYXR0ZXJucyB3aGljaCBtYXkgbGVhZCB0byBzb21lIGNyYXdsZXIgaXNzdWVzXG59KTtcblxuLyoqXG4gKiBHZXRzIHNjcmFwIGZyb20gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZWxlbWVudH0gcGFyZW50RWxcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXRTY3JhcCA9ICgkLCBwYXJlbnRFbCwgZGF0YSA9IHt9KSA9PiB7XG4gICAgaWYgKCFwYXJlbnRFbCB8fCAhcGFyZW50RWwuZmluZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50IHBhcmVudCBlbGVtZW50IGlzIG5lZWRlZCB0byBnZXQgdGhlIHNjcmFwJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0cmlldmUgPSBkYXRhLnJldHJpZXZlIHx8IHt9O1xuICAgIGNvbnN0IHJldHJpZXZlS2V5cyA9IE9iamVjdC5rZXlzKHJldHJpZXZlKTtcbiAgICBjb25zdCByZXN1bHRzID0ge307XG5cbiAgICAvLyBMZXRzIGl0ZXJhdGUgdGhlIHJldHJpZXZlIHJlcXVlc3RzXG4gICAgZm9yIChsZXQgYyA9IDA7IGMgPCByZXRyaWV2ZUtleXMubGVuZ3RoOyBjICs9IDEpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcmV0cmlldmVLZXlzW2NdO1xuICAgICAgICBjb25zdCByZXEgPSByZXRyaWV2ZVtrZXldO1xuICAgICAgICAvLyBTbyB0aGF0IHdlIGF2b2lkIHBvc3NpYmxlIGNyYXdsaW5nIGlzc3Vlc1xuICAgICAgICBjb25zdCBlbHMgPSBwYXJlbnRFbC5maW5kKGAke3JlcS5zZWxlY3Rvcn1gKTtcbiAgICAgICAgY29uc3QgbmVzdGVkID0gcmVxLnJldHJpZXZlO1xuICAgICAgICBjb25zdCBhdHRyID0gcmVxLmF0dHJpYnV0ZTtcbiAgICAgICAgY29uc3QgaWdub3JlID0gcmVxLmlnbm9yZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgICAgLy8gTGV0cyBnbyBwZXIgZWxlbWVudC4uLlxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGVscy5sZW5ndGg7IGQgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBlbHNbZF07XG4gICAgICAgICAgICBsZXQgc2luZ2xlO1xuXG4gICAgICAgICAgICBpZiAobmVzdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkIHx8ICEkLmZpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCAkIGlzIG5lZWRlZCB0byBnZXQgdGhlIHNjcmFwIG9mIG5lc3RlZCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBpZiB0aGUgZWxlbWVudCBoYXMgc29tZSBcIm5vZm9sbG93XCJcbiAgICAgICAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ25vZm9sbG93Jykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZvciB0aGUgY29udGVudCBpZiBpdCBnb3RzIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXN0ZWQgdGhlblxuICAgICAgICAgICAgICAgIHNpbmdsZSA9IGdldFNjcmFwKCQsICQoZWwpLCByZXEpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbmdsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBpZiB0aGUgZWxlbWVudCBoYXMgc29tZSBcIm5vZm9sbG93XCJcbiAgICAgICAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ25vZm9sbG93Jykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBuZXN0ZWQsIGdldCBjb250ZW50IVxuICAgICAgICAgICAgICAgIHNpbmdsZSA9ICEhYXR0ciA/IGVsLmdldEF0dHJpYnV0ZShhdHRyKSA6IGVsLnRleHRDb250ZW50O1xuICAgICAgICAgICAgICAgICFjb250YWlucyhpZ25vcmUsIHNpbmdsZSkgJiYgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgdGFrZSBjYXJlIG9mIGlnbm9yZSBhbmQgZmluYWxseWNhY2hlIGl0Li4uXG4gICAgICAgIHJlc3VsdHNba2V5XSA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRTaW5nbGUgPSAoZGF0YSA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShkYXRhKSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBnbyBwZXIgZWFjaCBkYXRhIG1lbWJlclxuICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIC8vIExldHMgY2hlY2sgaWYgd2UgYXJlIHN0aWxsIGluIHRoZSBkaWZmIHRpbWVcbiAgICAgICAgaWYgKCFpdGVtLnNyYyB8fCBpdGVtLnVwZGF0ZWRBdCAmJiAoRGF0ZS5ub3coKSAtIGl0ZW0udXBkYXRlZEF0IDwgTUlOX1VQREFURV9ESUZGKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFrZSB0aGUgcmVxdWVzdCBhbmQgZ2V0IGJhY2tcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGdldERvbShpdGVtLnNyYywgJ3VybCcsIGl0ZW0udGhyb3R0bGUsIGl0ZW0uZW5hYmxlSnMsIGl0ZW0ud2FpdEZvcikudGhlbihzaW5nbGVEb20gPT4ge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBzaW5nbGVEb20ud2luZG93LiQ7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIGRhdGFcbiAgICAgICAgICAgIGl0ZW0ucmVzdWx0ID0gZ2V0U2NyYXAoZWwsIGVsLCBpdGVtKTtcbiAgICAgICAgICAgIGl0ZW0udXBkYXRlZEF0ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIHJldHJpZXZlIHdlIG5vIGxvbmdlciBuZWVkIGl0XG4gICAgICAgICAgICBkZWxldGUgaXRlbS5yZXRyaWV2ZTtcblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSkgPT4ge1xuICAgIGlmICghaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5lZWRzIHRvIGV4aXN0IGFuZCBiZSBhbiBhcnJheScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoKSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBnbyBwZXIgZWFjaCBkYXRhIG1lbWJlclxuICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGxldCBwcm9taXNlO1xuXG4gICAgICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGRhdGEgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXRlbS5zcmMgfHwgdHlwZW9mIGl0ZW0uc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc3JjIGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgbWFrZSB0aGUgbmFtZSByaWdodFxuICAgICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShpdGVtLnNyYyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBleHBlY3RlZCBvYmplY3RcbiAgICAgICAgY29uc3QgdXJscyA9IGdldFF1ZXJpZWRVcmxzKGl0ZW0pLm1hcCh1cmwgPT4gKHtcbiAgICAgICAgICAgIHNyYzogdXJsLCByZXRyaWV2ZTogaXRlbS5yZXRyaWV2ZVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gQ2FjaGUgdGhlIHVybHNcbiAgICAgICAgaXRlbS5yZXN1bHRzID0gdXJscztcblxuICAgICAgICBwcm9taXNlID0gZ2V0U2luZ2xlKGl0ZW0ucmVzdWx0cylcbiAgICAgICAgLnRoZW4oc2luZ2xlRGF0YSA9PiB7XG4gICAgICAgICAgICAvLyBMZXRzIHNhdmUgdGhlIGRhdGEgY29taW5nIGluXG4gICAgICAgICAgICBzZW5kKCdvdXRwdXQuc2F2ZUl0ZW0nLCBpdGVtKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNpbmdsZURhdGE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENhY2hlIHByb21pc2VcbiAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoKSA9PiBkYXRhKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBzY3JhcGVyXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBiYXNlQ29uZmlnXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGJhc2VDb25maWcpID0+IHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgLy8gU2F2ZSB0aGUgY29uZmlnIGRhdGEgaW4gY2FzZSBpdCBpc24ndCBhbHJlYWR5Li4uXG4gICAgICAgIHNlbmQoJ291dHB1dC5zYXZlJywgY29uZmlnR2V0KGJhc2VDb25maWcpKTtcblxuICAgICAgICAvLyBOb3cgZ2V0IHRoZSBmdWxsIGZpbGVcbiAgICAgICAgc2VuZCgnb3V0cHV0LmdldEZpbGUnLCAoZmlsZURhdGEpID0+IHJlc29sdmUoZmlsZURhdGEpKTtcbiAgICB9KVxuICAgIC50aGVuKGNvbmZpZyA9PiB7XG4gICAgICAgIGNvbnN0IGdhdGhlclByb21pc2UgPSBnYXRoZXJEYXRhKGNvbmZpZy5kYXRhKVxuICAgICAgICAudGhlbigoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzdWx0cyBhcmUgYWxyZWFkeSBjYWNoZWQgc2luY2UgdGhlIHByb2plY3RcbiAgICAgICAgICAgIC8vIGlzIHVzaW5nIG9iamVjdC9hcnJheSByZWZlcmVuY2VzXG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIG91dHB1dFxuICAgICAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWcpO1xuXG4gICAgICAgICAgICByZXNvbHZlKGNvbmZpZyk7XG4gICAgICAgIH0pKTtcblxuICAgICAgICByZXR1cm4gZ2F0aGVyUHJvbWlzZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IHJ1biwgZ2V0VXJsLCBnZXREb20gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2F0aGVyRGF0YSwgZ2V0U2luZ2xlLCBnZXREb20sIGdldFNjcmFwLCBnZXRVcmwsIGdldFF1ZXJpZWRVcmxzLCBnZXRVcmxDb25maWcsIGdldFVzZXJBZ2VudCB9O1xuIl19