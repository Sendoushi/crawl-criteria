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
 * @param {object} wait
 * @returns {promise}
 */
var getDom = function getDom(src) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'url';
    var throttle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;
    var enableJs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var wait = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    return new Promise(function (resolve, reject) {
        if (typeof src !== 'string') {
            throw new Error('A source needs to be provided');
        }

        // Need to check if url is ok
        if (type === 'url' && !(0, _utils.isUrl)(src)) {
            throw new Error('Source not valid');
        }

        // Random throttle exists to avoid time patterns which may lead to some crawler issues
        throttle = type === 'url' ? Math.round(throttle + Math.random() * throttle * 2) : 1;

        // First the throttle so it doesn't make the request before
        setTimeout(function () {
            var time = wait.selector || enableJs ? wait.for || 60000 : 1;
            // Prepare for possible errors
            var virtualConsole = enableJs ? _jsdom2.default.createVirtualConsole() : undefined;
            var errors = [];
            var logs = [];
            var warns = [];

            // Set the timer to wait for and evaluate evaluation
            var waitForTimer = function waitForTimer(window) {
                var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                return setTimeout(function () {
                    if (wait.selector && window.$.find(wait.selector).length === 0 && i < 10) {
                        return waitForTimer(window, i + 1);
                    }

                    var docHtml = window.document.documentElement.innerHTML;
                    var toCache = { window: window, docHtml: docHtml, errors: errors, logs: logs, warns: warns };

                    // Save it
                    cache[src] = toCache;

                    // And resolve it
                    resolve(toCache);
                }, time / 10);
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
                return waitForTimer(cache[src].window);
            }

            // If not... lets just get it
            var config = (0, _merge2.default)(getUrlConfig(), {
                virtualConsole: virtualConsole,
                scripts: ['http://code.jquery.com/jquery.min.js'],
                features: {
                    FetchExternalResources: enableJs ? ['script'] : [],
                    ProcessExternalResources: enableJs ? ['script'] : [],
                    SkipExternalResources: !enableJs
                }
            });

            // Now for the actual getting
            _jsdom2.default.env(src, config, function (err, window) {
                if (err) {
                    return reject(err);
                }

                // Wait for selector to be available
                waitForTimer(window);
            });
        }, throttle);
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

                // Don't add if there is no data
                if (Object.keys(single).length) {
                    result.push(single);
                }
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

        // Lets take care of ignore and finally cache it...
        if (result.length) {
            results[key] = result;
        }
    }

    return results;
};

/**
 * Gets single data
 *
 * @param {object} srcItem
 * @param {object} originalItem
 * @return {promise}
 */
var getSingle = function getSingle(srcItem) {
    var originalItem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!srcItem || (typeof srcItem === 'undefined' ? 'undefined' : _typeof(srcItem)) !== 'object') {
        return new Promise(function () {
            throw new Error('Src item needs to exist and be a compliant object');
        });
    }

    // Lets check if we are still in the diff time
    if (!srcItem.src || srcItem.updatedAt && Date.now() - srcItem.updatedAt < MIN_UPDATE_DIFF && Object.keys(srcItem.result || {}).length || srcItem.skip || originalItem.skip) {
        return new Promise(function (resolve) {
            return resolve();
        });
    }

    // Make the request and get back
    return getDom(srcItem.src, 'url', originalItem.throttle, originalItem.enableJs, originalItem.wait).then(function (singleDom) {
        var el = singleDom.window.$;

        // Cache data
        srcItem.result = getScrap(el, el, originalItem);
        srcItem.updatedAt = new Date().getTime();

        return srcItem;
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

    // There is no data
    if (!data.length) {
        return new Promise(function (resolve) {
            return resolve();
        });
    }

    // Inform that all started
    (0, _mailbox.send)('output.onUpdate', data.length);

    // Lets first check if we have all data or something failed
    var failed = data.map(function (item) {
        if (!item || (typeof item === 'undefined' ? 'undefined' : _typeof(item)) !== 'object') {
            return new Promise(function () {
                throw new Error('A data object is required to get the url');
            });
        }

        if (!item.src || typeof item.src !== 'string') {
            return new Promise(function () {
                throw new Error('A src is required to get the url');
            });
        }
    }).filter(function (val) {
        return val;
    })[0];
    if (failed) {
        return failed;
    }

    // Lets go per each data member
    var promises = [];
    data.forEach(function (item) {
        // Lets set the basics
        var oldResults = item.results || [];
        item.results = getQueriedUrls(item).map(function (url) {
            var newItem = { src: url };

            // Lets check if this exists in the old results already
            oldResults.forEach(function (val) {
                newItem = val.src === url ? (0, _merge2.default)(oldResults, newItem) : newItem;
            });

            return newItem;
        });

        // Now for the actual promises
        promises = promises.concat(item.results.map(function (queryItem) {
            return function () {
                return getSingle(queryItem, item).then(function (singleData) {
                    if (!singleData) {
                        return;
                    }

                    // Lets save the data coming in
                    (0, _mailbox.send)('output.saveItem', item);

                    return singleData;
                });
            };
        }));
    });

    // Lets run promises in sync
    return new Promise(function (resolve) {
        return resolve(promises || []);
    }).then(function (promisesArr) {
        // Loop the promises
        var next = function next(i) {
            var promise = promisesArr[i];
            if (!promise) {
                return;
            }

            return promise().then(function () {
                return next(i + 1);
            });
        };

        // Lets get the first
        return next(0);
    }).then(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJjYWNoZSIsImdldFVzZXJBZ2VudCIsImxpc3QiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJnZXRVcmxDb25maWciLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwiYWdlbnRPcHRpb25zIiwia2VlcEFsaXZlIiwia2VlcEFsaXZlTXNlY3MiLCJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJzcmNzIiwiZm9yRWFjaCIsIm1vZGlmaWVyc1NldCIsImtleSIsInNyY3NUb1NldCIsIm5ld1NyY3MiLCJtYXAiLCJhY3R1YWxTcmNzIiwibW9kaWZpZXIiLCJtaW4iLCJtYXgiLCJpIiwicHVzaCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwiZW5hYmxlSnMiLCJ3YWl0Iiwicm91bmQiLCJzZXRUaW1lb3V0IiwidGltZSIsInNlbGVjdG9yIiwiZm9yIiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsInVuZGVmaW5lZCIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIndhaXRGb3JUaW1lciIsIndpbmRvdyIsIiQiLCJmaW5kIiwiZG9jSHRtbCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwidG9DYWNoZSIsIm9uIiwiZXJyb3IiLCJsb2ciLCJ3YXJuIiwiY29uZmlnIiwic2NyaXB0cyIsImZlYXR1cmVzIiwiRmV0Y2hFeHRlcm5hbFJlc291cmNlcyIsIlByb2Nlc3NFeHRlcm5hbFJlc291cmNlcyIsIlNraXBFeHRlcm5hbFJlc291cmNlcyIsImVudiIsImdldFNjcmFwIiwicGFyZW50RWwiLCJyZXRyaWV2ZSIsInJldHJpZXZlS2V5cyIsInJlc3VsdHMiLCJjIiwicmVxIiwiZWxzIiwibmVzdGVkIiwiYXR0ciIsImF0dHJpYnV0ZSIsImlnbm9yZSIsInJlc3VsdCIsImQiLCJlbCIsInNpbmdsZSIsImdldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiZ2V0U2luZ2xlIiwic3JjSXRlbSIsIm9yaWdpbmFsSXRlbSIsInVwZGF0ZWRBdCIsIkRhdGUiLCJub3ciLCJza2lwIiwidGhlbiIsInNpbmdsZURvbSIsImdldFRpbWUiLCJnYXRoZXJEYXRhIiwiZmFpbGVkIiwiaXRlbSIsInByb21pc2VzIiwib2xkUmVzdWx0cyIsIm5ld0l0ZW0iLCJjb25jYXQiLCJxdWVyeUl0ZW0iLCJzaW5nbGVEYXRhIiwibmV4dCIsInByb21pc2UiLCJwcm9taXNlc0FyciIsInJ1biIsImJhc2VDb25maWciLCJmaWxlRGF0YSIsImdhdGhlclByb21pc2UiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1BLGtCQUFrQixTQUF4QixDLENBQW1DO0FBQ25DLElBQU1DLFFBQVEsRUFBZDs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxlQUFlLFNBQWZBLFlBQWUsR0FBTTtBQUN2QixRQUFNQyxPQUFPO0FBQ1Q7QUFDQSwwR0FGUyxFQUdULHlIQUhTLEVBSVQseUdBSlMsRUFLVCw2R0FMUyxFQU1ULDZHQU5TLEVBT1QsNkdBUFMsRUFRVCw2R0FSUyxFQVNULHNHQVRTLEVBVVQsd0dBVlMsRUFXVCwyR0FYUztBQVlUO0FBQ0EscUlBYlM7QUFjVDtBQUNBLDhFQWZTLEVBZ0JULG1FQWhCUyxFQWlCVCxvRkFqQlMsRUFrQlQsb0VBbEJTLEVBbUJULDBFQW5CUyxFQW9CVCxtRUFwQlM7QUFxQlQ7QUFDQSw4RUF0QlMsRUF1QlQsb0ZBdkJTLEVBd0JULDRLQXhCUyxFQXlCVCx5R0F6QlMsRUEwQlQseUVBMUJTLEVBMkJULGtFQTNCUyxFQTRCVCxrRUE1QlMsRUE2QlQsOEdBN0JTLEVBOEJULG9GQTlCUyxFQStCVCxpRUEvQlMsRUFnQ1Qsa0VBaENTLEVBaUNULG1EQWpDUztBQWtDVDtBQUNBLDZIQW5DUyxFQW9DVCxnSUFwQ1MsQ0FBYjs7QUF1Q0EsV0FBT0EsS0FBS0MsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCSCxLQUFLSSxNQUFoQyxDQUFMLENBQVA7QUFDSCxDQXpDRDs7QUEyQ0E7Ozs7O0FBS0EsSUFBTUMsZUFBZSxTQUFmQSxZQUFlO0FBQUEsV0FBTztBQUN4QjtBQUNBQyx5QkFBaUIsT0FGTztBQUd4QkMsMkJBQW1CLElBSEs7QUFJeEI7QUFDQUMsY0FBTTtBQUNGQyx3QkFBWTtBQURWLFNBTGtCO0FBUXhCQyxtQkFBVyxJQVJhO0FBU3hCO0FBQ0E7QUFDQUMsbUJBQVcsSUFBSSxzQkFBWUMsU0FBaEIsQ0FBMEIsSUFBMUIsRUFBZ0MsRUFBRUMsV0FBVyxJQUFiLEVBQWhDLENBWGE7QUFZeEJDLG1CQUFXZixjQVphO0FBYXhCO0FBQ0E7QUFDQTtBQUNBZ0Isc0JBQWM7QUFDVkMsdUJBQVcsSUFERDtBQUVWQyw0QkFBZ0IsTUFBTTtBQUZaO0FBaEJVLEtBQVA7QUFBQSxDQUFyQjs7QUFzQkE7Ozs7OztBQU1BLElBQU1DLGlCQUFpQixTQUFqQkEsY0FBaUIsQ0FBQ0MsSUFBRCxFQUFVO0FBQzdCLFFBQUksQ0FBQ0EsSUFBRCxJQUFTLENBQUNBLEtBQUtDLEdBQW5CLEVBQXdCO0FBQ3BCLGNBQU0sSUFBSUMsS0FBSixDQUFVLGlDQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLE9BQU9GLEtBQUtDLEdBQVosS0FBb0IsUUFBeEIsRUFBa0M7QUFDOUIsY0FBTSxJQUFJQyxLQUFKLENBQVUsd0NBQVYsQ0FBTjtBQUNIOztBQUVELFFBQU1DLGVBQWVDLE9BQU9DLElBQVAsQ0FBWUwsS0FBS00sU0FBTCxJQUFrQixFQUE5QixDQUFyQjtBQUNBLFFBQUksQ0FBQ0gsWUFBRCxJQUFpQixDQUFDQSxhQUFhbEIsTUFBbkMsRUFBMkM7QUFDdkMsZUFBTyxDQUFDZSxLQUFLQyxHQUFOLENBQVA7QUFDSDs7QUFFRDtBQUNBLFFBQUlNLGFBQUo7O0FBRUE7QUFDQUosaUJBQWFLLE9BQWIsQ0FBcUIsZUFBTztBQUN4QixZQUFNQyxlQUFlVCxLQUFLTSxTQUFMLENBQWVJLEdBQWYsQ0FBckI7QUFDQSxZQUFNQyxZQUFZSixRQUFRLENBQUNQLEtBQUtDLEdBQU4sQ0FBMUI7O0FBRUE7QUFDQSxZQUFNVyxVQUFVRCxVQUFVRSxHQUFWLENBQWM7QUFBQSxtQkFBT0osYUFBYUksR0FBYixDQUFpQixvQkFBWTtBQUM5RCxvQkFBTUMsYUFBYSxFQUFuQjs7QUFFQSxvQkFBSSxRQUFPQyxRQUFQLHlDQUFPQSxRQUFQLE9BQW9CLFFBQXhCLEVBQWtDO0FBQzlCLHdCQUFNQyxNQUFNRCxTQUFTQyxHQUFULElBQWdCLENBQTVCO0FBQ0Esd0JBQU1DLE1BQU1GLFNBQVNFLEdBQVQsSUFBZ0IsRUFBNUI7O0FBRUEseUJBQUssSUFBSUMsSUFBSUYsR0FBYixFQUFrQkUsSUFBSUQsTUFBTSxDQUE1QixFQUErQkMsS0FBSyxDQUFwQyxFQUF1QztBQUNuQ0osbUNBQVdLLElBQVgsQ0FBZ0JsQixJQUFJbUIsT0FBSixDQUFZLElBQUlDLE1BQUosUUFBa0JYLEdBQWxCLFNBQTZCLEdBQTdCLENBQVosRUFBK0NRLENBQS9DLENBQWhCO0FBQ0g7QUFDSixpQkFQRCxNQU9PO0FBQ0g7QUFDQUosK0JBQVdLLElBQVgsQ0FBZ0JsQixJQUFJbUIsT0FBSixDQUFZLElBQUlDLE1BQUosUUFBa0JYLEdBQWxCLFNBQTZCLEdBQTdCLENBQVosRUFBK0NLLFFBQS9DLENBQWhCO0FBQ0g7O0FBRUQsdUJBQU9ELFVBQVA7QUFDSCxhQWhCb0MsQ0FBUDtBQUFBLFNBQWQsQ0FBaEI7O0FBa0JBO0FBQ0FQLGVBQU8sMkJBQVlLLE9BQVosRUFBcUJVLE1BQXJCLENBQTRCO0FBQUEsbUJBQU8sQ0FBQyxDQUFDQyxHQUFUO0FBQUEsU0FBNUIsQ0FBUDtBQUNILEtBekJEOztBQTJCQSxXQUFPLG9CQUFLaEIsSUFBTCxDQUFQO0FBQ0gsQ0E5Q0Q7O0FBZ0RBOzs7Ozs7QUFNQSxJQUFNaUIsU0FBUyxTQUFUQSxNQUFTLENBQUNDLEdBQUQ7QUFBQSxXQUFTLElBQUlDLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDckQsWUFBSSxPQUFPSCxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7QUFDekIsa0JBQU0sSUFBSXZCLEtBQUosQ0FBVSwwQkFBVixDQUFOO0FBQ0g7O0FBRUQ7QUFDQSxpQ0FBZTJCLFFBQWYsQ0FBd0JKLEdBQXhCLEVBQTZCdkMsY0FBN0IsRUFBNkMsVUFBQzRDLEdBQUQsRUFBTUMsWUFBTixFQUF1QjtBQUNoRSxnQkFBSUQsR0FBSixFQUFTO0FBQ0wsdUJBQU9GLE9BQU9FLEdBQVAsQ0FBUDtBQUNIOztBQUVESCxvQkFBUUksWUFBUjtBQUNILFNBTkQ7QUFPSCxLQWJ1QixDQUFUO0FBQUEsQ0FBZjs7QUFlQTs7Ozs7Ozs7OztBQVVBLElBQU1DLFNBQVMsU0FBVEEsTUFBUyxDQUFDL0IsR0FBRDtBQUFBLFFBQU1nQyxJQUFOLHVFQUFhLEtBQWI7QUFBQSxRQUFvQkMsUUFBcEIsdUVBQStCLElBQS9CO0FBQUEsUUFBcUNDLFFBQXJDLHVFQUFnRCxLQUFoRDtBQUFBLFFBQXVEQyxJQUF2RCx1RUFBOEQsRUFBOUQ7QUFBQSxXQUFxRSxJQUFJVixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ2pILFlBQUksT0FBTzNCLEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUN6QixrQkFBTSxJQUFJQyxLQUFKLENBQVUsK0JBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0EsWUFBSStCLFNBQVMsS0FBVCxJQUFrQixDQUFDLGtCQUFNaEMsR0FBTixDQUF2QixFQUFtQztBQUMvQixrQkFBTSxJQUFJQyxLQUFKLENBQVUsa0JBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0FnQyxtQkFBV0QsU0FBUyxLQUFULEdBQWlCbkQsS0FBS3VELEtBQUwsQ0FBV0gsV0FBV3BELEtBQUtFLE1BQUwsS0FBZ0JrRCxRQUFoQixHQUEyQixDQUFqRCxDQUFqQixHQUF1RSxDQUFsRjs7QUFFQTtBQUNBSSxtQkFBVyxZQUFNO0FBQ2IsZ0JBQU1DLE9BQVFILEtBQUtJLFFBQUwsSUFBaUJMLFFBQWxCLEdBQStCQyxLQUFLSyxHQUFMLElBQVksS0FBM0MsR0FBb0QsQ0FBakU7QUFDQTtBQUNBLGdCQUFNQyxpQkFBaUJQLFdBQVcsZ0JBQU1RLG9CQUFOLEVBQVgsR0FBMENDLFNBQWpFO0FBQ0EsZ0JBQU1DLFNBQVMsRUFBZjtBQUNBLGdCQUFNQyxPQUFPLEVBQWI7QUFDQSxnQkFBTUMsUUFBUSxFQUFkOztBQUVBO0FBQ0EsZ0JBQU1DLGVBQWUsU0FBZkEsWUFBZSxDQUFDQyxNQUFEO0FBQUEsb0JBQVMvQixDQUFULHVFQUFhLENBQWI7QUFBQSx1QkFBbUJvQixXQUFXLFlBQU07QUFDckQsd0JBQUlGLEtBQUtJLFFBQUwsSUFBaUJTLE9BQU9DLENBQVAsQ0FBU0MsSUFBVCxDQUFjZixLQUFLSSxRQUFuQixFQUE2QnZELE1BQTdCLEtBQXdDLENBQXpELElBQThEaUMsSUFBSSxFQUF0RSxFQUEwRTtBQUN0RSwrQkFBTzhCLGFBQWFDLE1BQWIsRUFBcUIvQixJQUFJLENBQXpCLENBQVA7QUFDSDs7QUFFRCx3QkFBTWtDLFVBQVVILE9BQU9JLFFBQVAsQ0FBZ0JDLGVBQWhCLENBQWdDQyxTQUFoRDtBQUNBLHdCQUFNQyxVQUFVLEVBQUVQLGNBQUYsRUFBVUcsZ0JBQVYsRUFBbUJQLGNBQW5CLEVBQTJCQyxVQUEzQixFQUFpQ0MsWUFBakMsRUFBaEI7O0FBRUE7QUFDQXBFLDBCQUFNc0IsR0FBTixJQUFhdUQsT0FBYjs7QUFFQTtBQUNBN0IsNEJBQVE2QixPQUFSO0FBQ0gsaUJBYnVDLEVBYXJDakIsT0FBTyxFQWI4QixDQUFuQjtBQUFBLGFBQXJCOztBQWVBLGdCQUFJSixRQUFKLEVBQWM7QUFDVk8sK0JBQWVlLEVBQWYsQ0FBa0IsWUFBbEIsRUFBZ0MsaUJBQVM7QUFBRVosMkJBQU8xQixJQUFQLENBQVl1QyxLQUFaO0FBQXFCLGlCQUFoRTtBQUNBaEIsK0JBQWVlLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsaUJBQVM7QUFBRVosMkJBQU8xQixJQUFQLENBQVl1QyxLQUFaO0FBQXFCLGlCQUEzRDtBQUNBaEIsK0JBQWVlLEVBQWYsQ0FBa0IsS0FBbEIsRUFBeUIsZUFBTztBQUFFWCx5QkFBSzNCLElBQUwsQ0FBVXdDLEdBQVY7QUFBaUIsaUJBQW5EO0FBQ0FqQiwrQkFBZWUsRUFBZixDQUFrQixNQUFsQixFQUEwQixnQkFBUTtBQUFFViwwQkFBTTVCLElBQU4sQ0FBV3lDLElBQVg7QUFBbUIsaUJBQXZEO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBSWpGLE1BQU1zQixHQUFOLENBQUosRUFBZ0I7QUFDWix1QkFBTytDLGFBQWFyRSxNQUFNc0IsR0FBTixFQUFXZ0QsTUFBeEIsQ0FBUDtBQUNIOztBQUVEO0FBQ0EsZ0JBQU1ZLFNBQVMscUJBQU0zRSxjQUFOLEVBQXNCO0FBQ2pDd0QsOENBRGlDO0FBRWpDb0IseUJBQVMsQ0FBQyxzQ0FBRCxDQUZ3QjtBQUdqQ0MsMEJBQVU7QUFDTkMsNENBQXdCN0IsV0FBVyxDQUFDLFFBQUQsQ0FBWCxHQUF3QixFQUQxQztBQUVOOEIsOENBQTBCOUIsV0FBVyxDQUFDLFFBQUQsQ0FBWCxHQUF3QixFQUY1QztBQUdOK0IsMkNBQXVCLENBQUMvQjtBQUhsQjtBQUh1QixhQUF0QixDQUFmOztBQVVBO0FBQ0EsNEJBQU1nQyxHQUFOLENBQVVsRSxHQUFWLEVBQWU0RCxNQUFmLEVBQXVCLFVBQUMvQixHQUFELEVBQU1tQixNQUFOLEVBQWlCO0FBQ3BDLG9CQUFJbkIsR0FBSixFQUFTO0FBQUUsMkJBQU9GLE9BQU9FLEdBQVAsQ0FBUDtBQUFxQjs7QUFFaEM7QUFDQWtCLDZCQUFhQyxNQUFiO0FBQ0gsYUFMRDtBQU1ILFNBdERELEVBc0RHZixRQXRESDtBQXVESCxLQXJFbUYsQ0FBckU7QUFBQSxDQUFmOztBQXVFQTs7Ozs7OztBQU9BLElBQU1rQyxXQUFXLFNBQVhBLFFBQVcsQ0FBQ2xCLENBQUQsRUFBSW1CLFFBQUosRUFBNEI7QUFBQSxRQUFkckUsSUFBYyx1RUFBUCxFQUFPOztBQUN6QyxRQUFJLENBQUNxRSxRQUFELElBQWEsQ0FBQ0EsU0FBU2xCLElBQTNCLEVBQWlDO0FBQzdCLGNBQU0sSUFBSWpELEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTW9FLFdBQVd0RSxLQUFLc0UsUUFBTCxJQUFpQixFQUFsQztBQUNBLFFBQU1DLGVBQWVuRSxPQUFPQyxJQUFQLENBQVlpRSxRQUFaLENBQXJCO0FBQ0EsUUFBTUUsVUFBVSxFQUFoQjs7QUFFQTtBQUNBLFNBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRixhQUFhdEYsTUFBakMsRUFBeUN3RixLQUFLLENBQTlDLEVBQWlEO0FBQzdDLFlBQU0vRCxNQUFNNkQsYUFBYUUsQ0FBYixDQUFaO0FBQ0EsWUFBTUMsTUFBTUosU0FBUzVELEdBQVQsQ0FBWjtBQUNBO0FBQ0EsWUFBTWlFLE1BQU1OLFNBQVNsQixJQUFULE1BQWlCdUIsSUFBSWxDLFFBQXJCLENBQVo7QUFDQSxZQUFNb0MsU0FBU0YsSUFBSUosUUFBbkI7QUFDQSxZQUFNTyxPQUFPSCxJQUFJSSxTQUFqQjtBQUNBLFlBQU1DLFNBQVNMLElBQUlLLE1BQW5CO0FBQ0EsWUFBTUMsU0FBUyxFQUFmOztBQUVBO0FBQ0EsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlOLElBQUkxRixNQUF4QixFQUFnQ2dHLEtBQUssQ0FBckMsRUFBd0M7QUFDcEMsZ0JBQU1DLEtBQUtQLElBQUlNLENBQUosQ0FBWDtBQUNBLGdCQUFJRSxlQUFKOztBQUVBLGdCQUFJUCxNQUFKLEVBQVk7QUFDUixvQkFBSSxDQUFDMUIsQ0FBRCxJQUFNLENBQUNBLEVBQUVDLElBQWIsRUFBbUI7QUFDZiwwQkFBTSxJQUFJakQsS0FBSixDQUFVLG9EQUFWLENBQU47QUFDSDs7QUFFRDtBQUNBLG9CQUFJZ0YsR0FBR0UsWUFBSCxDQUFnQixLQUFoQixNQUEyQixVQUEvQixFQUEyQztBQUN2QztBQUNIOztBQUVEO0FBQ0E7QUFDQUQseUJBQVNmLFNBQVNsQixDQUFULEVBQVlBLEVBQUVnQyxFQUFGLENBQVosRUFBbUJSLEdBQW5CLENBQVQ7O0FBRUE7QUFDQSxvQkFBSXRFLE9BQU9DLElBQVAsQ0FBWThFLE1BQVosRUFBb0JsRyxNQUF4QixFQUFnQztBQUM1QitGLDJCQUFPN0QsSUFBUCxDQUFZZ0UsTUFBWjtBQUNIO0FBQ0osYUFsQkQsTUFrQk87QUFDSDtBQUNBLG9CQUFJRCxHQUFHRSxZQUFILENBQWdCLEtBQWhCLE1BQTJCLFVBQS9CLEVBQTJDO0FBQ3ZDO0FBQ0g7O0FBRUQ7QUFDQUQseUJBQVMsQ0FBQyxDQUFDTixJQUFGLEdBQVNLLEdBQUdFLFlBQUgsQ0FBZ0JQLElBQWhCLENBQVQsR0FBaUNLLEdBQUdHLFdBQTdDO0FBQ0EsaUJBQUMscUJBQVNOLE1BQVQsRUFBaUJJLE1BQWpCLENBQUQsSUFBNkJILE9BQU83RCxJQUFQLENBQVlnRSxNQUFaLENBQTdCO0FBQ0g7QUFDSjs7QUFFRDtBQUNBLFlBQUlILE9BQU8vRixNQUFYLEVBQW1CO0FBQ2Z1RixvQkFBUTlELEdBQVIsSUFBZXNFLE1BQWY7QUFDSDtBQUNKOztBQUVELFdBQU9SLE9BQVA7QUFDSCxDQTlERDs7QUFnRUE7Ozs7Ozs7QUFPQSxJQUFNYyxZQUFZLFNBQVpBLFNBQVksQ0FBQ0MsT0FBRCxFQUFnQztBQUFBLFFBQXRCQyxZQUFzQix1RUFBUCxFQUFPOztBQUM5QyxRQUFJLENBQUNELE9BQUQsSUFBWSxRQUFPQSxPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQW5DLEVBQTZDO0FBQ3pDLGVBQU8sSUFBSTdELE9BQUosQ0FBWSxZQUFNO0FBQ3JCLGtCQUFNLElBQUl4QixLQUFKLENBQVUsbURBQVYsQ0FBTjtBQUNILFNBRk0sQ0FBUDtBQUdIOztBQUVEO0FBQ0EsUUFDSSxDQUFDcUYsUUFBUXRGLEdBQVQsSUFDQXNGLFFBQVFFLFNBQVIsSUFBc0JDLEtBQUtDLEdBQUwsS0FBYUosUUFBUUUsU0FBckIsR0FBaUMvRyxlQUF2RCxJQUNBMEIsT0FBT0MsSUFBUCxDQUFZa0YsUUFBUVAsTUFBUixJQUFrQixFQUE5QixFQUFrQy9GLE1BRmxDLElBR0FzRyxRQUFRSyxJQUhSLElBR2dCSixhQUFhSSxJQUpqQyxFQUtFO0FBQ0UsZUFBTyxJQUFJbEUsT0FBSixDQUFZO0FBQUEsbUJBQVdDLFNBQVg7QUFBQSxTQUFaLENBQVA7QUFDSDs7QUFFRDtBQUNBLFdBQU9LLE9BQU91RCxRQUFRdEYsR0FBZixFQUFvQixLQUFwQixFQUEyQnVGLGFBQWF0RCxRQUF4QyxFQUFrRHNELGFBQWFyRCxRQUEvRCxFQUF5RXFELGFBQWFwRCxJQUF0RixFQUE0RnlELElBQTVGLENBQWlHLHFCQUFhO0FBQ2pILFlBQU1YLEtBQUtZLFVBQVU3QyxNQUFWLENBQWlCQyxDQUE1Qjs7QUFFQTtBQUNBcUMsZ0JBQVFQLE1BQVIsR0FBaUJaLFNBQVNjLEVBQVQsRUFBYUEsRUFBYixFQUFpQk0sWUFBakIsQ0FBakI7QUFDQUQsZ0JBQVFFLFNBQVIsR0FBcUIsSUFBSUMsSUFBSixFQUFELENBQWFLLE9BQWIsRUFBcEI7O0FBRUEsZUFBT1IsT0FBUDtBQUNILEtBUk0sQ0FBUDtBQVNILENBM0JEOztBQTZCQTs7Ozs7O0FBTUEsSUFBTVMsYUFBYSxTQUFiQSxVQUFhLEdBQWU7QUFBQSxRQUFkaEcsSUFBYyx1RUFBUCxFQUFPOztBQUM5QixRQUFJLENBQUMsdUJBQVFBLElBQVIsQ0FBTCxFQUFvQjtBQUNoQixlQUFPLElBQUkwQixPQUFKLENBQVksWUFBTTtBQUNyQixrQkFBTSxJQUFJeEIsS0FBSixDQUFVLHFDQUFWLENBQU47QUFDSCxTQUZNLENBQVA7QUFHSDs7QUFFRDtBQUNBLFFBQUksQ0FBQ0YsS0FBS2YsTUFBVixFQUFrQjtBQUNkLGVBQU8sSUFBSXlDLE9BQUosQ0FBWTtBQUFBLG1CQUFXQyxTQUFYO0FBQUEsU0FBWixDQUFQO0FBQ0g7O0FBRUQ7QUFDQSx1QkFBSyxpQkFBTCxFQUF3QjNCLEtBQUtmLE1BQTdCOztBQUVBO0FBQ0EsUUFBTWdILFNBQVNqRyxLQUFLYSxHQUFMLENBQVMsZ0JBQVE7QUFDNUIsWUFBSSxDQUFDcUYsSUFBRCxJQUFTLFFBQU9BLElBQVAseUNBQU9BLElBQVAsT0FBZ0IsUUFBN0IsRUFBdUM7QUFDbkMsbUJBQU8sSUFBSXhFLE9BQUosQ0FBWSxZQUFNO0FBQ3JCLHNCQUFNLElBQUl4QixLQUFKLENBQVUsMENBQVYsQ0FBTjtBQUNILGFBRk0sQ0FBUDtBQUdIOztBQUVELFlBQUksQ0FBQ2dHLEtBQUtqRyxHQUFOLElBQWEsT0FBT2lHLEtBQUtqRyxHQUFaLEtBQW9CLFFBQXJDLEVBQStDO0FBQzNDLG1CQUFPLElBQUl5QixPQUFKLENBQVksWUFBTTtBQUNyQixzQkFBTSxJQUFJeEIsS0FBSixDQUFVLGtDQUFWLENBQU47QUFDSCxhQUZNLENBQVA7QUFHSDtBQUNKLEtBWmMsRUFZWm9CLE1BWlksQ0FZTDtBQUFBLGVBQU9DLEdBQVA7QUFBQSxLQVpLLEVBWU8sQ0FaUCxDQUFmO0FBYUEsUUFBSTBFLE1BQUosRUFBWTtBQUFFLGVBQU9BLE1BQVA7QUFBZ0I7O0FBRTlCO0FBQ0EsUUFBSUUsV0FBVyxFQUFmO0FBQ0FuRyxTQUFLUSxPQUFMLENBQWEsVUFBQzBGLElBQUQsRUFBVTtBQUNuQjtBQUNBLFlBQU1FLGFBQWFGLEtBQUsxQixPQUFMLElBQWdCLEVBQW5DO0FBQ0EwQixhQUFLMUIsT0FBTCxHQUFlekUsZUFBZW1HLElBQWYsRUFBcUJyRixHQUFyQixDQUF5QixlQUFPO0FBQzNDLGdCQUFJd0YsVUFBVSxFQUFFcEcsS0FBS3dCLEdBQVAsRUFBZDs7QUFFQTtBQUNBMkUsdUJBQVc1RixPQUFYLENBQW1CLGVBQU87QUFDdEI2RiwwQkFBVTlFLElBQUl0QixHQUFKLEtBQVl3QixHQUFaLEdBQWtCLHFCQUFNMkUsVUFBTixFQUFrQkMsT0FBbEIsQ0FBbEIsR0FBK0NBLE9BQXpEO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT0EsT0FBUDtBQUNILFNBVGMsQ0FBZjs7QUFXQTtBQUNBRixtQkFBV0EsU0FBU0csTUFBVCxDQUFnQkosS0FBSzFCLE9BQUwsQ0FBYTNELEdBQWIsQ0FBaUI7QUFBQSxtQkFBYTtBQUFBLHVCQUFNeUUsVUFBVWlCLFNBQVYsRUFBcUJMLElBQXJCLEVBQzlETCxJQUQ4RCxDQUN6RCxzQkFBYztBQUNoQix3QkFBSSxDQUFDVyxVQUFMLEVBQWlCO0FBQUU7QUFBUzs7QUFFNUI7QUFDQSx1Q0FBSyxpQkFBTCxFQUF3Qk4sSUFBeEI7O0FBRUEsMkJBQU9NLFVBQVA7QUFDSCxpQkFSOEQsQ0FBTjtBQUFBLGFBQWI7QUFBQSxTQUFqQixDQUFoQixDQUFYO0FBU0gsS0F4QkQ7O0FBMEJBO0FBQ0EsV0FBTyxJQUFJOUUsT0FBSixDQUFZO0FBQUEsZUFBV0MsUUFBUXdFLFlBQVksRUFBcEIsQ0FBWDtBQUFBLEtBQVosRUFDTk4sSUFETSxDQUNELHVCQUFlO0FBQ2pCO0FBQ0EsWUFBTVksT0FBTyxTQUFQQSxJQUFPLElBQUs7QUFDZCxnQkFBTUMsVUFBVUMsWUFBWXpGLENBQVosQ0FBaEI7QUFDQSxnQkFBSSxDQUFDd0YsT0FBTCxFQUFjO0FBQUU7QUFBUzs7QUFFekIsbUJBQU9BLFVBQVViLElBQVYsQ0FBZTtBQUFBLHVCQUFNWSxLQUFLdkYsSUFBSSxDQUFULENBQU47QUFBQSxhQUFmLENBQVA7QUFDSCxTQUxEOztBQU9BO0FBQ0EsZUFBT3VGLEtBQUssQ0FBTCxDQUFQO0FBQ0gsS0FaTSxFQWFOWixJQWJNLENBYUQ7QUFBQSxlQUFNN0YsSUFBTjtBQUFBLEtBYkMsQ0FBUDtBQWNILENBMUVEOztBQTRFQTs7Ozs7O0FBTUEsSUFBTTRHLE1BQU0sU0FBTkEsR0FBTSxDQUFDQyxVQUFELEVBQWdCO0FBQ3hCO0FBQ0EsdUJBQUssZ0JBQUw7O0FBRUEsUUFBTUgsVUFBVSxJQUFJaEYsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUNyQztBQUNBLDJCQUFLLGFBQUwsRUFBb0IsaUJBQVVrRixVQUFWLENBQXBCOztBQUVBO0FBQ0EsMkJBQUssZ0JBQUwsRUFBdUIsVUFBQ0MsUUFBRDtBQUFBLG1CQUFjbkYsUUFBUW1GLFFBQVIsQ0FBZDtBQUFBLFNBQXZCO0FBQ0gsS0FOZSxFQU9makIsSUFQZSxDQU9WLGtCQUFVO0FBQ1osWUFBTWtCLGdCQUFnQmYsV0FBV25DLE9BQU83RCxJQUFsQixFQUNyQjZGLElBRHFCLENBQ2hCO0FBQUEsbUJBQU0sSUFBSW5FLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQWE7QUFDakM7QUFDQTs7QUFFQTtBQUNBLG1DQUFLLGFBQUwsRUFBb0JrQyxNQUFwQjs7QUFFQTtBQUNBLG1DQUFLLGNBQUw7O0FBRUFsQyx3QkFBUWtDLE1BQVI7QUFDSCxhQVhXLENBQU47QUFBQSxTQURnQixDQUF0Qjs7QUFjQSxlQUFPa0QsYUFBUDtBQUNILEtBdkJlLENBQWhCOztBQXlCQSxXQUFPTCxPQUFQO0FBQ0gsQ0E5QkQ7O0FBZ0NBO0FBQ0E7O1FBRVNFLEcsR0FBQUEsRztRQUFLcEYsTSxHQUFBQSxNO1FBQVFRLE0sR0FBQUEsTTs7QUFFdEIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCB1bmlxIGZyb20gJ2xvZGFzaC91bmlxLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwLmpzJztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2gvZmxhdHRlbkRlZXAuanMnO1xuaW1wb3J0IHsgc2VuZCB9IGZyb20gJy4vbWFpbGJveC5qcyc7XG5pbXBvcnQgeyBpc1VybCwgY29udGFpbnMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbmNvbnN0IE1JTl9VUERBVEVfRElGRiA9IDUxODQwMDAwMDsgLy8gNyBkYXlzXG5jb25zdCBjYWNoZSA9IHt9O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldCBhIHJhbmRvbSB1c2VyIGFnZW50XG4gKiBVc2VkIHRvIGF2b2lkIHNvbWUgY3Jhd2xpbmcgaXNzdWVzXG4gKlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2V0VXNlckFnZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IGxpc3QgPSBbXG4gICAgICAgIC8vIENocm9tZVxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI4LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xMF8xKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjEgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjcuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjcuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjYuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuNDsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjUuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjUuMCBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDUuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNC4zIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQwLjAuMjIxNC45MyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChYMTE7IExpbnV4IHg4Nl82NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzMzLjAuMTc1MC4xNDkgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgIC8vIEVkZ2VcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80Mi4wLjIzMTEuMTM1IFNhZmFyaS81MzcuMzYgRWRnZS8xMi4yNDYnLFxuICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBydjo0MC4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzQwLjEnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4zOyBydjozNi4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzM2LjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTA7IHJ2OjMzLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzMuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCBpNTg2OyBydjozMS4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMxLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6MzEuMCkgR2Vja28vMjAxMzA0MDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDUuMTsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgLy8gSUVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IFRyaWRlbnQvNy4wOyBBUzsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZSwgTVNJRSAxMSwgV2luZG93cyBOVCA2LjM7IFRyaWRlbnQvNy4wOyBydjoxMS4wKSBsaWtlIEdlY2tvJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjY7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzUuMDsgSW5mb1BhdGguMjsgU0xDQzE7IC5ORVQgQ0xSIDMuMC40NTA2LjIxNTI7IC5ORVQgQ0xSIDMuNS4zMDcyOTsgLk5FVCBDTFIgMi4wLjUwNzI3KSAzZ3BwLWdiYSBVTlRSVVNURUQvMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNy4wOyBJbmZvUGF0aC4zOyAuTkVUIENMUiAzLjEuNDA3Njc7IFRyaWRlbnQvNi4wOyBlbi1JTiknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzQuMDsgSW5mb1BhdGguMjsgU1YxOyAuTkVUIENMUiAyLjAuNTA3Mjc7IFdPVzY0KScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzdfMzsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNC4wIChDb21wYXRpYmxlOyBNU0lFIDguMDsgV2luZG93cyBOVCA1LjI7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjApJyxcbiAgICAgICAgJ01vemlsbGEvMS4yMiAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIDMuMSknLFxuICAgICAgICAvLyBTYWZhcmlcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzlfMykgQXBwbGVXZWJLaXQvNTM3Ljc1LjE0IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi83LjAuMyBTYWZhcmkvNzA0NkExOTRBJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChpUGFkOyBDUFUgT1MgNl8wIGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzUzNi4yNiAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNi4wIE1vYmlsZS8xMEE1MzU1ZCBTYWZhcmkvODUzNi4yNSdcbiAgICBdO1xuXG4gICAgcmV0dXJuIGxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGgpXTtcbn07XG5cbi8qKlxuICogR2V0IHVybCBjb25maWdcbiAqXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXRVcmxDb25maWcgPSAoKSA9PiAoe1xuICAgIC8vIGRlZmF1bHRFbmNvZGluZzogJ3dpbmRvd3MtMTI1MicsXG4gICAgZGVmYXVsdEVuY29kaW5nOiAndXRmLTgnLFxuICAgIGRldGVjdE1ldGFDaGFyc2V0OiB0cnVlLFxuICAgIC8vIGhlYWRlcnM6IGNvbmZpZy5oZWFkZXJzLFxuICAgIHBvb2w6IHtcbiAgICAgICAgbWF4U29ja2V0czogNlxuICAgIH0sXG4gICAgc3RyaWN0U1NMOiB0cnVlLFxuICAgIC8vIFRPRE86IFdoYXQgYWJvdXQgcm90YXRpbmcgaXBzP1xuICAgIC8vIHByb3h5OiBjb25maWcucHJveHksXG4gICAgY29va2llSmFyOiBuZXcgdG91Z2hDb29raWUuQ29va2llSmFyKG51bGwsIHsgbG9vc2VNb2RlOiB0cnVlIH0pLFxuICAgIHVzZXJBZ2VudDogZ2V0VXNlckFnZW50KCksXG4gICAgLy8gdXNlckFnZW50OiBgTm9kZS5qcyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgVTsgcnY6JHtwcm9jZXNzLnZlcnNpb259KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKWAsXG4gICAgLy8gYWdlbnQ6IGNvbmZpZy5hZ2VudCxcbiAgICAvLyBhZ2VudENsYXNzOiBjb25maWcuYWdlbnRDbGFzcyxcbiAgICBhZ2VudE9wdGlvbnM6IHtcbiAgICAgICAga2VlcEFsaXZlOiB0cnVlLFxuICAgICAgICBrZWVwQWxpdmVNc2VjczogMTE1ICogMTAwMFxuICAgIH1cbn0pO1xuXG4vKipcbiAqIEdldHMgcXVlcmllZCB1cmxzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UXVlcmllZFVybHMgPSAoZGF0YSkgPT4ge1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5zcmMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBpcyBuZWVkZWQgdG8gcXVlcnkgdXJsJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBzdHJpbmcgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU1vZGlmaWVycyA9IE9iamVjdC5rZXlzKGRhdGEubW9kaWZpZXJzIHx8IFtdKTtcbiAgICBpZiAoIWtleU1vZGlmaWVycyB8fCAha2V5TW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW2RhdGEuc3JjXTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGNhY2hlIHRoZSBmaXJzdCBvbmVcbiAgICBsZXQgc3JjcztcblxuICAgIC8vIE5vdyBsZXRzIGdvIHBlciBtb2RpZmllclxuICAgIGtleU1vZGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVyc1NldCA9IGRhdGEubW9kaWZpZXJzW2tleV07XG4gICAgICAgIGNvbnN0IHNyY3NUb1NldCA9IHNyY3MgfHwgW2RhdGEuc3JjXTtcblxuICAgICAgICAvLyBQZXIgZWFjaCB1cmwsIHNldCBlYWNoIG1vZGlmaWVyXG4gICAgICAgIGNvbnN0IG5ld1NyY3MgPSBzcmNzVG9TZXQubWFwKHNyYyA9PiBtb2RpZmllcnNTZXQubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gTGV0cyBjYWNoZSBpdCBub3dcbiAgICAgICAgc3JjcyA9IGZsYXR0ZW5EZWVwKG5ld1NyY3MpLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVuaXEoc3Jjcyk7XG59O1xuXG4vKipcbiAqIEdldHMgdXJsIG1hcmt1cFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRVcmwgPSAodXJsKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVXJsIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gRmluYWxseSBkb3dubG9hZCBpdCFcbiAgICByZXNvdXJjZUxvYWRlci5kb3dubG9hZCh1cmwsIGdldFVybENvbmZpZygpLCAoZXJyLCByZXNwb25zZVRleHQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZVRleHQpO1xuICAgIH0pO1xufSk7XG5cbi8qKlxuICogR2V0cyBET00gZnJvbSB1cmxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtpbnR9IHRocm90dGxlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZUpzXG4gKiBAcGFyYW0ge29iamVjdH0gd2FpdFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldERvbSA9IChzcmMsIHR5cGUgPSAndXJsJywgdGhyb3R0bGUgPSAyMDAwLCBlbmFibGVKcyA9IGZhbHNlLCB3YWl0ID0ge30pID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBuZWVkcyB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8vIFJhbmRvbSB0aHJvdHRsZSBleGlzdHMgdG8gYXZvaWQgdGltZSBwYXR0ZXJucyB3aGljaCBtYXkgbGVhZCB0byBzb21lIGNyYXdsZXIgaXNzdWVzXG4gICAgdGhyb3R0bGUgPSB0eXBlID09PSAndXJsJyA/IE1hdGgucm91bmQodGhyb3R0bGUgKyBNYXRoLnJhbmRvbSgpICogdGhyb3R0bGUgKiAyKSA6IDE7XG5cbiAgICAvLyBGaXJzdCB0aGUgdGhyb3R0bGUgc28gaXQgZG9lc24ndCBtYWtlIHRoZSByZXF1ZXN0IGJlZm9yZVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCB0aW1lID0gKHdhaXQuc2VsZWN0b3IgfHwgZW5hYmxlSnMpID8gKHdhaXQuZm9yIHx8IDYwMDAwKSA6IDE7XG4gICAgICAgIC8vIFByZXBhcmUgZm9yIHBvc3NpYmxlIGVycm9yc1xuICAgICAgICBjb25zdCB2aXJ0dWFsQ29uc29sZSA9IGVuYWJsZUpzID8ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICAvLyBTZXQgdGhlIHRpbWVyIHRvIHdhaXQgZm9yIGFuZCBldmFsdWF0ZSBldmFsdWF0aW9uXG4gICAgICAgIGNvbnN0IHdhaXRGb3JUaW1lciA9ICh3aW5kb3csIGkgPSAwKSA9PiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICh3YWl0LnNlbGVjdG9yICYmIHdpbmRvdy4kLmZpbmQod2FpdC5zZWxlY3RvcikubGVuZ3RoID09PSAwICYmIGkgPCAxMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3YWl0Rm9yVGltZXIod2luZG93LCBpICsgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRvY0h0bWwgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgIGNvbnN0IHRvQ2FjaGUgPSB7IHdpbmRvdywgZG9jSHRtbCwgZXJyb3JzLCBsb2dzLCB3YXJucyB9O1xuXG4gICAgICAgICAgICAvLyBTYXZlIGl0XG4gICAgICAgICAgICBjYWNoZVtzcmNdID0gdG9DYWNoZTtcblxuICAgICAgICAgICAgLy8gQW5kIHJlc29sdmUgaXRcbiAgICAgICAgICAgIHJlc29sdmUodG9DYWNoZSk7XG4gICAgICAgIH0sIHRpbWUgLyAxMCk7XG5cbiAgICAgICAgaWYgKGVuYWJsZUpzKSB7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdlcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdsb2cnLCBsb2cgPT4geyBsb2dzLnB1c2gobG9nKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignd2FybicsIHdhcm4gPT4geyB3YXJucy5wdXNoKHdhcm4pOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgY2hlY2sgaWYgaXQgZXhpc3RzIGluIGNhY2hlLi4uXG4gICAgICAgIGlmIChjYWNoZVtzcmNdKSB7XG4gICAgICAgICAgICByZXR1cm4gd2FpdEZvclRpbWVyKGNhY2hlW3NyY10ud2luZG93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG5vdC4uLiBsZXRzIGp1c3QgZ2V0IGl0XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IG1lcmdlKGdldFVybENvbmZpZygpLCB7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZSxcbiAgICAgICAgICAgIHNjcmlwdHM6IFsnaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnkubWluLmpzJ10sXG4gICAgICAgICAgICBmZWF0dXJlczoge1xuICAgICAgICAgICAgICAgIEZldGNoRXh0ZXJuYWxSZXNvdXJjZXM6IGVuYWJsZUpzID8gWydzY3JpcHQnXSA6IFtdLFxuICAgICAgICAgICAgICAgIFByb2Nlc3NFeHRlcm5hbFJlc291cmNlczogZW5hYmxlSnMgPyBbJ3NjcmlwdCddIDogW10sXG4gICAgICAgICAgICAgICAgU2tpcEV4dGVybmFsUmVzb3VyY2VzOiAhZW5hYmxlSnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm93IGZvciB0aGUgYWN0dWFsIGdldHRpbmdcbiAgICAgICAganNkb20uZW52KHNyYywgY29uZmlnLCAoZXJyLCB3aW5kb3cpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIHJlamVjdChlcnIpOyB9XG5cbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHNlbGVjdG9yIHRvIGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgd2FpdEZvclRpbWVyKHdpbmRvdyk7XG4gICAgICAgIH0pO1xuICAgIH0sIHRocm90dGxlKTtcbn0pO1xuXG4vKipcbiAqIEdldHMgc2NyYXAgZnJvbSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtlbGVtZW50fSBwYXJlbnRFbFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldFNjcmFwID0gKCQsIHBhcmVudEVsLCBkYXRhID0ge30pID0+IHtcbiAgICBpZiAoIXBhcmVudEVsIHx8ICFwYXJlbnRFbC5maW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgcGFyZW50IGVsZW1lbnQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXRyaWV2ZSA9IGRhdGEucmV0cmlldmUgfHwge307XG4gICAgY29uc3QgcmV0cmlldmVLZXlzID0gT2JqZWN0LmtleXMocmV0cmlldmUpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcblxuICAgIC8vIExldHMgaXRlcmF0ZSB0aGUgcmV0cmlldmUgcmVxdWVzdHNcbiAgICBmb3IgKGxldCBjID0gMDsgYyA8IHJldHJpZXZlS2V5cy5sZW5ndGg7IGMgKz0gMSkge1xuICAgICAgICBjb25zdCBrZXkgPSByZXRyaWV2ZUtleXNbY107XG4gICAgICAgIGNvbnN0IHJlcSA9IHJldHJpZXZlW2tleV07XG4gICAgICAgIC8vIFNvIHRoYXQgd2UgYXZvaWQgcG9zc2libGUgY3Jhd2xpbmcgaXNzdWVzXG4gICAgICAgIGNvbnN0IGVscyA9IHBhcmVudEVsLmZpbmQoYCR7cmVxLnNlbGVjdG9yfWApO1xuICAgICAgICBjb25zdCBuZXN0ZWQgPSByZXEucmV0cmlldmU7XG4gICAgICAgIGNvbnN0IGF0dHIgPSByZXEuYXR0cmlidXRlO1xuICAgICAgICBjb25zdCBpZ25vcmUgPSByZXEuaWdub3JlO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgICAgICAvLyBMZXRzIGdvIHBlciBlbGVtZW50Li4uXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZWxzLmxlbmd0aDsgZCArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGVsc1tkXTtcbiAgICAgICAgICAgIGxldCBzaW5nbGU7XG5cbiAgICAgICAgICAgIGlmIChuZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQgfHwgISQuZmluZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50ICQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAgb2YgbmVzdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZm9yIHRoZSBjb250ZW50IGlmIGl0IGdvdHMgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5lc3RlZCB0aGVuXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gZ2V0U2NyYXAoJCwgJChlbCksIHJlcSk7XG5cbiAgICAgICAgICAgICAgICAvLyBEb24ndCBhZGQgaWYgdGhlcmUgaXMgbm8gZGF0YVxuICAgICAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhzaW5nbGUpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGlmIHRoZSBlbGVtZW50IGhhcyBzb21lIFwibm9mb2xsb3dcIlxuICAgICAgICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnbm9mb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lc3RlZCwgZ2V0IGNvbnRlbnQhXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gISFhdHRyID8gZWwuZ2V0QXR0cmlidXRlKGF0dHIpIDogZWwudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIWNvbnRhaW5zKGlnbm9yZSwgc2luZ2xlKSAmJiByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyB0YWtlIGNhcmUgb2YgaWdub3JlIGFuZCBmaW5hbGx5IGNhY2hlIGl0Li4uXG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzcmNJdGVtXG4gKiBAcGFyYW0ge29iamVjdH0gb3JpZ2luYWxJdGVtXG4gKiBAcmV0dXJuIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRTaW5nbGUgPSAoc3JjSXRlbSwgb3JpZ2luYWxJdGVtID0ge30pID0+IHtcbiAgICBpZiAoIXNyY0l0ZW0gfHwgdHlwZW9mIHNyY0l0ZW0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NyYyBpdGVtIG5lZWRzIHRvIGV4aXN0IGFuZCBiZSBhIGNvbXBsaWFudCBvYmplY3QnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjaGVjayBpZiB3ZSBhcmUgc3RpbGwgaW4gdGhlIGRpZmYgdGltZVxuICAgIGlmIChcbiAgICAgICAgIXNyY0l0ZW0uc3JjIHx8XG4gICAgICAgIHNyY0l0ZW0udXBkYXRlZEF0ICYmIChEYXRlLm5vdygpIC0gc3JjSXRlbS51cGRhdGVkQXQgPCBNSU5fVVBEQVRFX0RJRkYpICYmXG4gICAgICAgIE9iamVjdC5rZXlzKHNyY0l0ZW0ucmVzdWx0IHx8IHt9KS5sZW5ndGggfHxcbiAgICAgICAgc3JjSXRlbS5za2lwIHx8IG9yaWdpbmFsSXRlbS5za2lwXG4gICAgKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoKSk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSB0aGUgcmVxdWVzdCBhbmQgZ2V0IGJhY2tcbiAgICByZXR1cm4gZ2V0RG9tKHNyY0l0ZW0uc3JjLCAndXJsJywgb3JpZ2luYWxJdGVtLnRocm90dGxlLCBvcmlnaW5hbEl0ZW0uZW5hYmxlSnMsIG9yaWdpbmFsSXRlbS53YWl0KS50aGVuKHNpbmdsZURvbSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gc2luZ2xlRG9tLndpbmRvdy4kO1xuXG4gICAgICAgIC8vIENhY2hlIGRhdGFcbiAgICAgICAgc3JjSXRlbS5yZXN1bHQgPSBnZXRTY3JhcChlbCwgZWwsIG9yaWdpbmFsSXRlbSk7XG4gICAgICAgIHNyY0l0ZW0udXBkYXRlZEF0ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcblxuICAgICAgICByZXR1cm4gc3JjSXRlbTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2F0aGVyIGRhdGFcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2F0aGVyRGF0YSA9IChkYXRhID0gW10pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUgaXMgbm8gZGF0YVxuICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZSgpKTtcbiAgICB9XG5cbiAgICAvLyBJbmZvcm0gdGhhdCBhbGwgc3RhcnRlZFxuICAgIHNlbmQoJ291dHB1dC5vblVwZGF0ZScsIGRhdGEubGVuZ3RoKTtcblxuICAgIC8vIExldHMgZmlyc3QgY2hlY2sgaWYgd2UgaGF2ZSBhbGwgZGF0YSBvciBzb21ldGhpbmcgZmFpbGVkXG4gICAgY29uc3QgZmFpbGVkID0gZGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGRhdGEgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXRlbS5zcmMgfHwgdHlwZW9mIGl0ZW0uc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc3JjIGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pLmZpbHRlcih2YWwgPT4gdmFsKVswXTtcbiAgICBpZiAoZmFpbGVkKSB7IHJldHVybiBmYWlsZWQ7IH1cblxuICAgIC8vIExldHMgZ28gcGVyIGVhY2ggZGF0YSBtZW1iZXJcbiAgICBsZXQgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2ljc1xuICAgICAgICBjb25zdCBvbGRSZXN1bHRzID0gaXRlbS5yZXN1bHRzIHx8IFtdO1xuICAgICAgICBpdGVtLnJlc3VsdHMgPSBnZXRRdWVyaWVkVXJscyhpdGVtKS5tYXAodXJsID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0geyBzcmM6IHVybCB9O1xuXG4gICAgICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIHRoaXMgZXhpc3RzIGluIHRoZSBvbGQgcmVzdWx0cyBhbHJlYWR5XG4gICAgICAgICAgICBvbGRSZXN1bHRzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgICAgICAgICBuZXdJdGVtID0gdmFsLnNyYyA9PT0gdXJsID8gbWVyZ2Uob2xkUmVzdWx0cywgbmV3SXRlbSkgOiBuZXdJdGVtO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdJdGVtO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgcHJvbWlzZXNcbiAgICAgICAgcHJvbWlzZXMgPSBwcm9taXNlcy5jb25jYXQoaXRlbS5yZXN1bHRzLm1hcChxdWVyeUl0ZW0gPT4gKCkgPT4gZ2V0U2luZ2xlKHF1ZXJ5SXRlbSwgaXRlbSlcbiAgICAgICAgLnRoZW4oc2luZ2xlRGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNpbmdsZURhdGEpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgIC8vIExldHMgc2F2ZSB0aGUgZGF0YSBjb21pbmcgaW5cbiAgICAgICAgICAgIHNlbmQoJ291dHB1dC5zYXZlSXRlbScsIGl0ZW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc2luZ2xlRGF0YTtcbiAgICAgICAgfSkpKTtcbiAgICB9KTtcblxuICAgIC8vIExldHMgcnVuIHByb21pc2VzIGluIHN5bmNcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKHByb21pc2VzIHx8IFtdKSlcbiAgICAudGhlbihwcm9taXNlc0FyciA9PiB7XG4gICAgICAgIC8vIExvb3AgdGhlIHByb21pc2VzXG4gICAgICAgIGNvbnN0IG5leHQgPSBpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSBwcm9taXNlc0FycltpXTtcbiAgICAgICAgICAgIGlmICghcHJvbWlzZSkgeyByZXR1cm47IH1cblxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UoKS50aGVuKCgpID0+IG5leHQoaSArIDEpKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgZmlyc3RcbiAgICAgICAgcmV0dXJuIG5leHQoMCk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiBkYXRhKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBzY3JhcGVyXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBiYXNlQ29uZmlnXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGJhc2VDb25maWcpID0+IHtcbiAgICAvLyBJbmZvcm0gdGhhdCBhbGwgc3RhcnRlZFxuICAgIHNlbmQoJ291dHB1dC5vblN0YXJ0Jyk7XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgLy8gU2F2ZSB0aGUgY29uZmlnIGRhdGEgaW4gY2FzZSBpdCBpc24ndCBhbHJlYWR5Li4uXG4gICAgICAgIHNlbmQoJ291dHB1dC5zYXZlJywgY29uZmlnR2V0KGJhc2VDb25maWcpKTtcblxuICAgICAgICAvLyBOb3cgZ2V0IHRoZSBmdWxsIGZpbGVcbiAgICAgICAgc2VuZCgnb3V0cHV0LmdldEZpbGUnLCAoZmlsZURhdGEpID0+IHJlc29sdmUoZmlsZURhdGEpKTtcbiAgICB9KVxuICAgIC50aGVuKGNvbmZpZyA9PiB7XG4gICAgICAgIGNvbnN0IGdhdGhlclByb21pc2UgPSBnYXRoZXJEYXRhKGNvbmZpZy5kYXRhKVxuICAgICAgICAudGhlbigoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzdWx0cyBhcmUgYWxyZWFkeSBjYWNoZWQgc2luY2UgdGhlIHByb2plY3RcbiAgICAgICAgICAgIC8vIGlzIHVzaW5nIG9iamVjdC9hcnJheSByZWZlcmVuY2VzXG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIG91dHB1dFxuICAgICAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWcpO1xuXG4gICAgICAgICAgICAvLyBJbmZvcm0gdGhhdCBhbGwgZW5kZWRcbiAgICAgICAgICAgIHNlbmQoJ291dHB1dC5vbkVuZCcpO1xuXG4gICAgICAgICAgICByZXNvbHZlKGNvbmZpZyk7XG4gICAgICAgIH0pKTtcblxuICAgICAgICByZXR1cm4gZ2F0aGVyUHJvbWlzZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IHJ1biwgZ2V0VXJsLCBnZXREb20gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2F0aGVyRGF0YSwgZ2V0U2luZ2xlLCBnZXREb20sIGdldFNjcmFwLCBnZXRVcmwsIGdldFF1ZXJpZWRVcmxzLCBnZXRVcmxDb25maWcsIGdldFVzZXJBZ2VudCB9O1xuIl19