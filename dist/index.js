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
            var waitForTimer = function waitForTimer(window, selector) {
                var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : waitFor ? 2000 : 1;
                var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

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
        });

        promises.push(promise);
    });

    return Promise.all(promises).then(function () {
        return data;
    });
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

        // Make the single request
        promise = getSingle(item.results).then(function () {
            /* eslint-disable prefer-arrow-callback */
            (0, _mailbox.send)('output.type', function (type) {
                // No promises doesn't need cache, it will improve performance
                if (type !== 'promise') {
                    return;
                }

                // Results are already cached since the project
                // is using object/array references

                // Save data to output
                // TODO: ...
            });
            /* eslint-enable prefer-arrow-callback */

            return data;
        });

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
        (0, _mailbox.send)('output.getFile', function (fileData) {
            var config = (0, _config.get)(baseConfig);

            // Lets merge the data
            fileData && fileData.data && fileData.data.forEach(function (nItem) {
                return config.data.forEach(function (oItem) {
                    if (oItem.src === nItem.src) {
                        oItem.results = nItem.results;
                    }
                });
            });

            // Save the first data...
            (0, _mailbox.send)('output.save', config);

            resolve(config);
        });
    }).then(function (config) {
        var gatherPromise = gatherData(config.data).then(function () {
            return new Promise(function (resolve) {
                (0, _mailbox.send)('output.type', function (type) {
                    // No promises doesn't need cache, it will improve performance
                    if (type === 'promise') {
                        return resolve(config);
                    }

                    // Results are already cached since the project
                    // is using object/array references

                    // Save the output
                    (0, _mailbox.send)('output.save', config);
                    resolve();
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJjYWNoZSIsImdldFVzZXJBZ2VudCIsImxpc3QiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJnZXRVcmxDb25maWciLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwiYWdlbnRPcHRpb25zIiwia2VlcEFsaXZlIiwia2VlcEFsaXZlTXNlY3MiLCJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJzcmNzIiwiZm9yRWFjaCIsIm1vZGlmaWVyc1NldCIsImtleSIsInNyY3NUb1NldCIsIm5ld1NyY3MiLCJtYXAiLCJhY3R1YWxTcmNzIiwibW9kaWZpZXIiLCJtaW4iLCJtYXgiLCJpIiwicHVzaCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwiZW5hYmxlSnMiLCJ3YWl0Rm9yIiwic2V0VGltZW91dCIsInZpcnR1YWxDb25zb2xlIiwiY3JlYXRlVmlydHVhbENvbnNvbGUiLCJ1bmRlZmluZWQiLCJlcnJvcnMiLCJsb2dzIiwid2FybnMiLCJ3YWl0Rm9yVGltZXIiLCJ3aW5kb3ciLCJzZWxlY3RvciIsInRpbWUiLCIkIiwiZmluZCIsImRvY0h0bWwiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsImlubmVySFRNTCIsInRvQ2FjaGUiLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwiZW52Iiwicm91bmQiLCJnZXRTY3JhcCIsInBhcmVudEVsIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsIm5lc3RlZCIsImF0dHIiLCJhdHRyaWJ1dGUiLCJpZ25vcmUiLCJyZXN1bHQiLCJkIiwiZWwiLCJzaW5nbGUiLCJnZXRBdHRyaWJ1dGUiLCJ0ZXh0Q29udGVudCIsImdldFNpbmdsZSIsInByb21pc2VzIiwiaXRlbSIsInVwZGF0ZWRBdCIsIkRhdGUiLCJub3ciLCJwcm9taXNlIiwidGhlbiIsInNpbmdsZURvbSIsImdldFRpbWUiLCJhbGwiLCJnYXRoZXJEYXRhIiwibmFtZSIsImJhc2VuYW1lIiwidXJscyIsInJ1biIsImJhc2VDb25maWciLCJmaWxlRGF0YSIsIm9JdGVtIiwibkl0ZW0iLCJnYXRoZXJQcm9taXNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUEsa0JBQWtCLFNBQXhCLEMsQ0FBbUM7QUFDbkMsSUFBTUMsUUFBUSxFQUFkOztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1DLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3ZCLFFBQU1DLE9BQU87QUFDVDtBQUNBLDBHQUZTLEVBR1QseUhBSFMsRUFJVCx5R0FKUyxFQUtULDZHQUxTLEVBTVQsNkdBTlMsRUFPVCw2R0FQUyxFQVFULDZHQVJTLEVBU1Qsc0dBVFMsRUFVVCx3R0FWUyxFQVdULDJHQVhTO0FBWVQ7QUFDQSxxSUFiUztBQWNUO0FBQ0EsOEVBZlMsRUFnQlQsbUVBaEJTLEVBaUJULG9GQWpCUyxFQWtCVCxvRUFs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U0FaRDtBQWFILEtBZGUsRUFlZmtDLElBZmUsQ0FlVixrQkFBVTtBQUNaLFlBQU1hLGdCQUFnQlQsV0FBV3RDLE9BQU8zRCxJQUFsQixFQUNyQjZGLElBRHFCLENBQ2hCO0FBQUEsbUJBQU0sSUFBSW5FLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQWE7QUFDakMsbUNBQUssYUFBTCxFQUFvQixVQUFDTSxJQUFELEVBQVU7QUFDMUI7QUFDQSx3QkFBSUEsU0FBUyxTQUFiLEVBQXdCO0FBQUUsK0JBQU9OLFFBQVFnQyxNQUFSLENBQVA7QUFBeUI7O0FBRW5EO0FBQ0E7O0FBRUE7QUFDQSx1Q0FBSyxhQUFMLEVBQW9CQSxNQUFwQjtBQUNBaEM7QUFDSCxpQkFWRDtBQVdILGFBWlcsQ0FBTjtBQUFBLFNBRGdCLENBQXRCOztBQWVBLGVBQU8rRSxhQUFQO0FBQ0gsS0FoQ2UsQ0FBaEI7O0FBa0NBLFdBQU9kLE9BQVA7QUFDSCxDQXBDRDs7QUFzQ0E7QUFDQTs7UUFFU1MsRyxHQUFBQSxHO1FBQUs3RSxNLEdBQUFBLE07UUFBUVEsTSxHQUFBQSxNOztBQUV0QiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCByZXNvdXJjZUxvYWRlciBmcm9tICdqc2RvbS9saWIvanNkb20vYnJvd3Nlci9yZXNvdXJjZS1sb2FkZXInO1xuaW1wb3J0IHRvdWdoQ29va2llIGZyb20gJ3RvdWdoLWNvb2tpZSc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2gvZmxhdHRlbkRlZXAuanMnO1xuaW1wb3J0IHsgc2VuZCB9IGZyb20gJy4vbWFpbGJveC5qcyc7XG5pbXBvcnQgeyBpc1VybCwgY29udGFpbnMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbmNvbnN0IE1JTl9VUERBVEVfRElGRiA9IDUxODQwMDAwMDsgLy8gNyBkYXlzXG5jb25zdCBjYWNoZSA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldCBhIHJhbmRvbSB1c2VyIGFnZW50XG4gKiBVc2VkIHRvIGF2b2lkIHNvbWUgY3Jhd2xpbmcgaXNzdWVzXG4gKlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0VXNlckFnZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IGxpc3QgPSBbXG4gICAgICAgIC8vIENocm9tZVxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI4LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xMF8xKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjEgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjcuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjcuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjYuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuNDsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjUuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjUuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDUuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNC4zIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQwLjAuMjIxNC45MyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChYMTE7IExpbnV4IHg4Nl82NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzMzLjAuMTc1MC4xNDkgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgIC8vIEVkZ2VcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80Mi4wLjIzMTEuMTM1IFNhZmFyaS81MzcuMzYgRWRnZS8xMi4yNDYnLFxuICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBydjo0MC4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzQwLjEnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4zOyBydjozNi4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzM2LjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTA7IHJ2OjMzLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzMuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCBpNTg2OyBydjozMS4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMxLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6MzEuMCkgR2Vja28vMjAxMzA0MDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDUuMTsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgLy8gSUVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IFRyaWRlbnQvNy4wOyBBUzsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZSwgTVNJRSAxMSwgV2luZG93cyBOVCA2LjM7IFRyaWRlbnQvNy4wOyBydjoxMS4wKSBsaWtlIEdlY2tvJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjY7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzUuMDsgSW5mb1BhdGguMjsgU0xDQzE7IC5ORVQgQ0xSIDMuMC40NTA2LjIxNTI7IC5ORVQgQ0xSIDMuNS4zMDcyOTsgLk5FVCBDTFIgMi4wLjUwNzI3KSAzZ3BwLWdiYSBVTlRSVVNURUQvMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNy4wOyBJbmZvUGF0aC4zOyAuTkVUIENMUiAzLjEuNDA3Njc7IFRyaWRlbnQvNi4wOyBlbi1JTiknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzQuMDsgSW5mb1BhdGguMjsgU1YxOyAuTkVUIENMUiAyLjAuNTA3Mjc7IFdPVzY0KScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzdfMzsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNC4wIChDb21wYXRpYmxlOyBNU0lFIDguMDsgV2luZG93cyBOVCA1LjI7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjApJyxcbiAgICAgICAgJ01vemlsbGEvMS4yMiAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIDMuMSknLFxuICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzlfMykgQXBwbGVXZWJLaXQvNTM3Ljc1LjE0IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi83LjAuMyBTYWZhcmkvNzA0NkExOTRBJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChpUGFkOyBDUFUgT1MgNl8wIGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzUzNi4yNiAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNi4wIE1vYmlsZS8xMEE1MzU1ZCBTYWZhcmkvODUzNi4yNSdcbiAgICBdO1xuXG4gICAgcmV0dXJuIGxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGgpXTtcbn07XG5cbi8qKlxuICogR2V0IHVybCBjb25maWdcbiAqXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXRVcmxDb25maWcgPSAoKSA9PiAoe1xuICAgIC8vIGRlZmF1bHRFbmNvZGluZzogJ3dpbmRvd3MtMTI1MicsXG4gICAgZGVmYXVsdEVuY29kaW5nOiAndXRmLTgnLFxuICAgIGRldGVjdE1ldGFDaGFyc2V0OiB0cnVlLFxuICAgIC8vIGhlYWRlcnM6IGNvbmZpZy5oZWFkZXJzLFxuICAgIHBvb2w6IHtcbiAgICAgICAgbWF4U29ja2V0czogNlxuICAgIH0sXG4gICAgc3RyaWN0U1NMOiB0cnVlLFxuICAgIC8vIFRPRE86IFdoYXQgYWJvdXQgcm90YXRpbmcgaXBzP1xuICAgIC8vIHByb3h5OiBjb25maWcucHJveHksXG4gICAgY29va2llSmFyOiBuZXcgdG91Z2hDb29raWUuQ29va2llSmFyKG51bGwsIHsgbG9vc2VNb2RlOiB0cnVlIH0pLFxuICAgIHVzZXJBZ2VudDogZ2V0VXNlckFnZW50KCksXG4gICAgLy8gdXNlckFnZW50OiBgTm9kZS5qcyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgVTsgcnY6JHtwcm9jZXNzLnZlcnNpb259KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKWAsXG4gICAgLy8gYWdlbnQ6IGNvbmZpZy5hZ2VudCxcbiAgICAvLyBhZ2VudENsYXNzOiBjb25maWcuYWdlbnRDbGFzcyxcbiAgICBhZ2VudE9wdGlvbnM6IHtcbiAgICAgICAga2VlcEFsaXZlOiB0cnVlLFxuICAgICAgICBrZWVwQWxpdmVNc2VjczogMTE1ICogMTAwMFxuICAgIH1cbn0pO1xuXG4vKipcbiAqIEdldHMgcXVlcmllZCB1cmxzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UXVlcmllZFVybHMgPSAoZGF0YSkgPT4ge1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5zcmMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBpcyBuZWVkZWQgdG8gcXVlcnkgdXJsJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBzdHJpbmcgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFdoYXQgYWJvdXQgbW9kaWZpZXJzIGNvbWJpbmF0aW9ucz9cblxuICAgIGNvbnN0IGtleU1vZGlmaWVycyA9IE9iamVjdC5rZXlzKGRhdGEubW9kaWZpZXJzIHx8IFtdKTtcbiAgICBpZiAoIWtleU1vZGlmaWVycyB8fCAha2V5TW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW2RhdGEuc3JjXTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGNhY2hlIHRoZSBmaXJzdCBvbmVcbiAgICBsZXQgc3JjcztcblxuICAgIC8vIExldHMgZ2V0IHRoZSBmaXJzdCBrZXlNb2RpZmllclxuICAgICAgICAvLyBMZXRzIGdldCBlYWNoIHZhbHVlIG1vZGlmaWVyXG4gICAgICAgICAgICAvLyBVc2UgdGhlIG9yaWdpbmFsIHNyYyBhbmQgcXVlcnkgaXRcbiAgICAgICAgICAgIC8vIENhY2hlIGl0XG4gICAgLy8gTGV0cyBnZXQgdGhlIHNlY29uZCBrZXlNb2RpZmllclxuICAgICAgICAvLyBMZXRzIGdldCB0aHJvdWdoIGFsbCBhbHJlYWR5IHNldCB2YWx1ZXNcblxuICAgIC8vIE1vZGlmaWVycyBhcmUgdGhlIGtleXMgdG8gY2hlY2tcbiAgICAvLyBJdHMgYXJyYXkgYXJlIHRoZSB2YWx1ZVxuXG4gICAgLy8gTm93IGxldHMgZ28gcGVyIG1vZGlmaWVyXG4gICAga2V5TW9kaWZpZXJzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgbW9kaWZpZXJzU2V0ID0gZGF0YS5tb2RpZmllcnNba2V5XTtcbiAgICAgICAgY29uc3Qgc3Jjc1RvU2V0ID0gc3JjcyB8fCBbZGF0YS5zcmNdO1xuXG4gICAgICAgIC8vIFBlciBlYWNoIHVybCwgc2V0IGVhY2ggbW9kaWZpZXJcbiAgICAgICAgY29uc3QgbmV3U3JjcyA9IHNyY3NUb1NldC5tYXAoc3JjID0+IG1vZGlmaWVyc1NldC5tYXAobW9kaWZpZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0dWFsU3JjcyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1vZGlmaWVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbiA9IG1vZGlmaWVyLm1pbiB8fCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1heCA9IG1vZGlmaWVyLm1heCB8fCAxMDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBtaW47IGkgPCBtYXggKyAxOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIGkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5vdyBmb3IgdGhlIGdlbmVyYWwgcnVsZSBzdHJpbmdcbiAgICAgICAgICAgICAgICBhY3R1YWxTcmNzLnB1c2goc3JjLnJlcGxhY2UobmV3IFJlZ0V4cChgXFx7XFx7JHtrZXl9XFx9XFx9YCwgJ2cnKSwgbW9kaWZpZXIpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFjdHVhbFNyY3M7XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBMZXRzIGNhY2hlIGl0IG5vd1xuICAgICAgICBzcmNzID0gZmxhdHRlbkRlZXAobmV3U3JjcykuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG5cbiAgICAgICAgLy8gZGF0YS5tb2RpZmllcnNba2V5XS5tYXAobW9kaWZpZXIgPT4ge1xuICAgICAgICAvLyAvLyBMZXRzIGdvIHBlciBzb3VyY2UgYW5kIHNldCB0aGUgbW9kaWZpZXJcbiAgICAgICAgLy8gdXJscyA9IHVybHMuY29uY2F0KFtkYXRhLnNyY10pLm1hcChzcmMgPT4ge1xuICAgICAgICAvLyAgICAgY29uc3QgYWN0dWFsU3JjcyA9IFtdO1xuXG4gICAgICAgIC8vICAgICBpZiAodHlwZW9mIG1vZGlmaWVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyAgICAgICAgIGNvbnN0IG1pbiA9IG1vZGlmaWVyLm1pbiB8fCAwO1xuICAgICAgICAvLyAgICAgICAgIGNvbnN0IG1heCA9IG1vZGlmaWVyLm1heCB8fCAxMDtcblxuICAgICAgICAvLyAgICAgICAgIGZvciAobGV0IGkgPSBtaW47IGkgPCBtYXggKyAxOyBpICs9IDEpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIGkpKTtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIC8vIE5vdyBmb3IgdGhlIGdlbmVyYWwgcnVsZSBzdHJpbmdcbiAgICAgICAgLy8gICAgICAgICBhY3R1YWxTcmNzLnB1c2goc3JjLnJlcGxhY2UobmV3IFJlZ0V4cChgXFx7XFx7JHtrZXl9XFx9XFx9YCwgJ2cnKSwgbW9kaWZpZXIpKTtcbiAgICAgICAgLy8gICAgIH1cblxuICAgICAgICAvLyAgICAgcmV0dXJuIGFjdHVhbFNyY3M7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIC8vIExldHMgZmxhdHRlbiBmb3IgdGhlIG5leHQgaXRlcmF0aW9uXG4gICAgICAgIC8vIHVybHMgPSBmbGF0dGVuRGVlcCh1cmxzKS5maWx0ZXIodmFsID0+ICEhdmFsKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzcmNzO1xufTtcblxuLyoqXG4gKiBHZXRzIHVybCBtYXJrdXBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0VXJsID0gKHVybCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VybCBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgZG93bmxvYWQgaXQhXG4gICAgcmVzb3VyY2VMb2FkZXIuZG93bmxvYWQodXJsLCBnZXRVcmxDb25maWcoKSwgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVKc1xuICogQHBhcmFtIHtzdHJpbmd9IHdhaXRGb3JcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlID0gJ3VybCcsIHRocm90dGxlID0gMjAwMCwgZW5hYmxlSnMgPSBmYWxzZSwgd2FpdEZvcikgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIG5lZWRzIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gTmVlZCB0byBjaGVjayBpZiB1cmwgaXMgb2tcbiAgICBpZiAodHlwZSA9PT0gJ3VybCcgJiYgIWlzVXJsKHNyYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3VyY2Ugbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgdGhlIHRocm90dGxlIHNvIGl0IGRvZXNuJ3QgbWFrZSB0aGUgcmVxdWVzdCBiZWZvcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gUHJlcGFyZSBmb3IgcG9zc2libGUgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlID0gZW5hYmxlSnMgPyBqc2RvbS5jcmVhdGVWaXJ0dWFsQ29uc29sZSgpIDogdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBjb25zdCB3YXJucyA9IFtdO1xuXG4gICAgICAgIC8vIFNldCB0aGUgdGltZXIgdG8gd2FpdCBmb3IgYW5kIGV2YWx1YXRlIGV2YWx1YXRpb25cbiAgICAgICAgY29uc3Qgd2FpdEZvclRpbWVyID0gKHdpbmRvdywgc2VsZWN0b3IsIHRpbWUgPSAod2FpdEZvciA/IDIwMDAgOiAxKSwgaSA9IDApID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RvciAmJiB3aW5kb3cuJC5maW5kKHNlbGVjdG9yKS5sZW5ndGggPT09IDAgJiYgaSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3YWl0Rm9yVGltZXIod2luZG93LCBzZWxlY3RvciwgdGltZSwgaSArIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRvY0h0bWwgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b0NhY2hlID0geyB3aW5kb3csIGRvY0h0bWwsIGVycm9ycywgbG9ncywgd2FybnMgfTtcblxuICAgICAgICAgICAgICAgIC8vIFNhdmUgaXRcbiAgICAgICAgICAgICAgICBjYWNoZVtzcmNdID0gdG9DYWNoZTtcblxuICAgICAgICAgICAgICAgIC8vIEFuZCByZXNvbHZlIGl0XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0b0NhY2hlKTtcbiAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChlbmFibGVKcykge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ3dhcm4nLCB3YXJuID0+IHsgd2FybnMucHVzaCh3YXJuKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIGl0IGV4aXN0cyBpbiBjYWNoZS4uLlxuICAgICAgICBpZiAoY2FjaGVbc3JjXSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhaXRGb3JUaW1lcihjYWNoZVtzcmNdLndpbmRvdywgd2FpdEZvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBub3QuLi4gbGV0cyBqdXN0IGdldCBpdFxuICAgICAgICBjb25zdCBjb25maWcgPSBtZXJnZShnZXRVcmxDb25maWcoKSwge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBzY3JpcHRzOiBbJ2h0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5Lm1pbi5qcyddLFxuICAgICAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgICAgICBGZXRjaEV4dGVybmFsUmVzb3VyY2VzOiBlbmFibGVKcyA/IFsnc2NyaXB0J10gOiBbXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IGVuYWJsZUpzID8gWydzY3JpcHQnXSA6IFtdLFxuICAgICAgICAgICAgICAgIFNraXBFeHRlcm5hbFJlc291cmNlczogIWVuYWJsZUpzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgZm9yIHNlbGVjdG9yIHRvIGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIHdhaXRGb3JUaW1lcih3aW5kb3csIHdhaXRGb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgZ2V0dGluZ1xuICAgICAgICBqc2RvbS5lbnYoc3JjLCBjb25maWcpO1xuICAgIH0sIHR5cGUgPT09ICd1cmwnID8gTWF0aC5yb3VuZCh0aHJvdHRsZSArIE1hdGgucmFuZG9tKCkgKiB0aHJvdHRsZSAqIDIpIDogMSk7XG4gICAgLy8gUmFuZG9tIHRocm90dGxlIGV4aXN0cyB0byBhdm9pZCB0aW1lIHBhdHRlcm5zIHdoaWNoIG1heSBsZWFkIHRvIHNvbWUgY3Jhd2xlciBpc3N1ZXNcbn0pO1xuXG4vKipcbiAqIEdldHMgc2NyYXAgZnJvbSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtlbGVtZW50fSBwYXJlbnRFbFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldFNjcmFwID0gKCQsIHBhcmVudEVsLCBkYXRhID0ge30pID0+IHtcbiAgICBpZiAoIXBhcmVudEVsIHx8ICFwYXJlbnRFbC5maW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgcGFyZW50IGVsZW1lbnQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXRyaWV2ZSA9IGRhdGEucmV0cmlldmUgfHwge307XG4gICAgY29uc3QgcmV0cmlldmVLZXlzID0gT2JqZWN0LmtleXMocmV0cmlldmUpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcblxuICAgIC8vIExldHMgaXRlcmF0ZSB0aGUgcmV0cmlldmUgcmVxdWVzdHNcbiAgICBmb3IgKGxldCBjID0gMDsgYyA8IHJldHJpZXZlS2V5cy5sZW5ndGg7IGMgKz0gMSkge1xuICAgICAgICBjb25zdCBrZXkgPSByZXRyaWV2ZUtleXNbY107XG4gICAgICAgIGNvbnN0IHJlcSA9IHJldHJpZXZlW2tleV07XG4gICAgICAgIC8vIFNvIHRoYXQgd2UgYXZvaWQgcG9zc2libGUgY3Jhd2xpbmcgaXNzdWVzXG4gICAgICAgIGNvbnN0IGVscyA9IHBhcmVudEVsLmZpbmQoYCR7cmVxLnNlbGVjdG9yfWApO1xuICAgICAgICBjb25zdCBuZXN0ZWQgPSByZXEucmV0cmlldmU7XG4gICAgICAgIGNvbnN0IGF0dHIgPSByZXEuYXR0cmlidXRlO1xuICAgICAgICBjb25zdCBpZ25vcmUgPSByZXEuaWdub3JlO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgICAgICAvLyBMZXRzIGdvIHBlciBlbGVtZW50Li4uXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZWxzLmxlbmd0aDsgZCArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGVsc1tkXTtcbiAgICAgICAgICAgIGxldCBzaW5nbGU7XG5cbiAgICAgICAgICAgIGlmIChuZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQgfHwgISQuZmluZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50ICQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAgb2YgbmVzdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZm9yIHRoZSBjb250ZW50IGlmIGl0IGdvdHMgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5lc3RlZCB0aGVuXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gZ2V0U2NyYXAoJCwgJChlbCksIHJlcSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lc3RlZCwgZ2V0IGNvbnRlbnQhXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gISFhdHRyID8gZWwuZ2V0QXR0cmlidXRlKGF0dHIpIDogZWwudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIWNvbnRhaW5zKGlnbm9yZSwgc2luZ2xlKSAmJiByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyB0YWtlIGNhcmUgb2YgaWdub3JlIGFuZCBmaW5hbGx5Y2FjaGUgaXQuLi5cbiAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBkYXRhXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFNpbmdsZSA9IChkYXRhID0gW10pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBlYWNoIGRhdGEgbWVtYmVyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgLy8gTGV0cyBjaGVjayBpZiB3ZSBhcmUgc3RpbGwgaW4gdGhlIGRpZmYgdGltZVxuICAgICAgICBpZiAoIWl0ZW0uc3JjIHx8IGl0ZW0udXBkYXRlZEF0ICYmIChEYXRlLm5vdygpIC0gaXRlbS51cGRhdGVkQXQgPCBNSU5fVVBEQVRFX0RJRkYpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IGFuZCBnZXQgYmFja1xuICAgICAgICBjb25zdCBwcm9taXNlID0gZ2V0RG9tKGl0ZW0uc3JjLCAndXJsJywgaXRlbS50aHJvdHRsZSwgaXRlbS5lbmFibGVKcywgaXRlbS53YWl0Rm9yKS50aGVuKHNpbmdsZURvbSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHNpbmdsZURvbS53aW5kb3cuJDtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgZGF0YVxuICAgICAgICAgICAgaXRlbS5yZXN1bHQgPSBnZXRTY3JhcChlbCwgZWwsIGl0ZW0pO1xuICAgICAgICAgICAgaXRlbS51cGRhdGVkQXQgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgcmV0cmlldmUgd2Ugbm8gbG9uZ2VyIG5lZWQgaXRcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtLnJldHJpZXZlO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCgpID0+IGRhdGEpO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSkgPT4ge1xuICAgIGlmICghaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5lZWRzIHRvIGV4aXN0IGFuZCBiZSBhbiBhcnJheScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoKSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBnbyBwZXIgZWFjaCBkYXRhIG1lbWJlclxuICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgZGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGxldCBwcm9taXNlO1xuXG4gICAgICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGRhdGEgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXRlbS5zcmMgfHwgdHlwZW9mIGl0ZW0uc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc3JjIGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgbWFrZSB0aGUgbmFtZSByaWdodFxuICAgICAgICBpdGVtLm5hbWUgPSBpdGVtLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShpdGVtLnNyYyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBleHBlY3RlZCBvYmplY3RcbiAgICAgICAgY29uc3QgdXJscyA9IGdldFF1ZXJpZWRVcmxzKGl0ZW0pLm1hcCh1cmwgPT4gKHtcbiAgICAgICAgICAgIHNyYzogdXJsLCByZXRyaWV2ZTogaXRlbS5yZXRyaWV2ZVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gQ2FjaGUgdGhlIHVybHNcbiAgICAgICAgaXRlbS5yZXN1bHRzID0gdXJscztcblxuICAgICAgICAvLyBNYWtlIHRoZSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBwcm9taXNlID0gZ2V0U2luZ2xlKGl0ZW0ucmVzdWx0cykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBwcmVmZXItYXJyb3ctY2FsbGJhY2sgKi9cbiAgICAgICAgICAgIHNlbmQoJ291dHB1dC50eXBlJywgKHR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBObyBwcm9taXNlcyBkb2Vzbid0IG5lZWQgY2FjaGUsIGl0IHdpbGwgaW1wcm92ZSBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgICAgIGlmICh0eXBlICE9PSAncHJvbWlzZScpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZXN1bHRzIGFyZSBhbHJlYWR5IGNhY2hlZCBzaW5jZSB0aGUgcHJvamVjdFxuICAgICAgICAgICAgICAgIC8vIGlzIHVzaW5nIG9iamVjdC9hcnJheSByZWZlcmVuY2VzXG5cbiAgICAgICAgICAgICAgICAvLyBTYXZlIGRhdGEgdG8gb3V0cHV0XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogLi4uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgcHJlZmVyLWFycm93LWNhbGxiYWNrICovXG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCgpID0+IGRhdGEpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHNjcmFwZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGJhc2VDb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoYmFzZUNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZW5kKCdvdXRwdXQuZ2V0RmlsZScsIChmaWxlRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnR2V0KGJhc2VDb25maWcpO1xuXG4gICAgICAgICAgICAvLyBMZXRzIG1lcmdlIHRoZSBkYXRhXG4gICAgICAgICAgICBmaWxlRGF0YSAmJiBmaWxlRGF0YS5kYXRhICYmIGZpbGVEYXRhLmRhdGEuZm9yRWFjaChuSXRlbSA9PiBjb25maWcuZGF0YS5mb3JFYWNoKG9JdGVtID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob0l0ZW0uc3JjID09PSBuSXRlbS5zcmMpIHsgb0l0ZW0ucmVzdWx0cyA9IG5JdGVtLnJlc3VsdHM7IH1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgZmlyc3QgZGF0YS4uLlxuICAgICAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWcpO1xuXG4gICAgICAgICAgICByZXNvbHZlKGNvbmZpZyk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgY29uc3QgZ2F0aGVyUHJvbWlzZSA9IGdhdGhlckRhdGEoY29uZmlnLmRhdGEpXG4gICAgICAgIC50aGVuKCgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBzZW5kKCdvdXRwdXQudHlwZScsICh0eXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTm8gcHJvbWlzZXMgZG9lc24ndCBuZWVkIGNhY2hlLCBpdCB3aWxsIGltcHJvdmUgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3Byb21pc2UnKSB7IHJldHVybiByZXNvbHZlKGNvbmZpZyk7IH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc3VsdHMgYXJlIGFscmVhZHkgY2FjaGVkIHNpbmNlIHRoZSBwcm9qZWN0XG4gICAgICAgICAgICAgICAgLy8gaXMgdXNpbmcgb2JqZWN0L2FycmF5IHJlZmVyZW5jZXNcblxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIG91dHB1dFxuICAgICAgICAgICAgICAgIHNlbmQoJ291dHB1dC5zYXZlJywgY29uZmlnKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHJldHVybiBnYXRoZXJQcm9taXNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgcnVuLCBnZXRVcmwsIGdldERvbSB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnYXRoZXJEYXRhLCBnZXRTaW5nbGUsIGdldERvbSwgZ2V0U2NyYXAsIGdldFVybCwgZ2V0UXVlcmllZFVybHMsIGdldFVybENvbmZpZywgZ2V0VXNlckFnZW50IH07XG4iXX0=