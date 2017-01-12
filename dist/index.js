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
        item.results.forEach(function (queryItem) {
            return promises.push(function () {
                return getSingle(queryItem, item).then(function (newItem) {
                    (0, _mailbox.send)('output.saveItem', item);
                    return newItem;
                });
            });
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJjYWNoZSIsImdldFVzZXJBZ2VudCIsImxpc3QiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJnZXRVcmxDb25maWciLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwiYWdlbnRPcHRpb25zIiwia2VlcEFsaXZlIiwia2VlcEFsaXZlTXNlY3MiLCJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJzcmNzIiwiZm9yRWFjaCIsIm1vZGlmaWVyc1NldCIsImtleSIsInNyY3NUb1NldCIsIm5ld1NyY3MiLCJtYXAiLCJhY3R1YWxTcmNzIiwibW9kaWZpZXIiLCJtaW4iLCJtYXgiLCJpIiwicHVzaCIsInJlcGxhY2UiLCJSZWdFeHAiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwiZW5hYmxlSnMiLCJ3YWl0Iiwicm91bmQiLCJzZXRUaW1lb3V0IiwidGltZSIsInNlbGVjdG9yIiwiZm9yIiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsInVuZGVmaW5lZCIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIndhaXRGb3JUaW1lciIsIndpbmRvdyIsIiQiLCJmaW5kIiwiZG9jSHRtbCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwidG9DYWNoZSIsIm9uIiwiZXJyb3IiLCJsb2ciLCJ3YXJuIiwiY29uZmlnIiwic2NyaXB0cyIsImZlYXR1cmVzIiwiRmV0Y2hFeHRlcm5hbFJlc291cmNlcyIsIlByb2Nlc3NFeHRlcm5hbFJlc291cmNlcyIsIlNraXBFeHRlcm5hbFJlc291cmNlcyIsImVudiIsImdldFNjcmFwIiwicGFyZW50RWwiLCJyZXRyaWV2ZSIsInJldHJpZXZlS2V5cyIsInJlc3VsdHMiLCJjIiwicmVxIiwiZWxzIiwibmVzdGVkIiwiYXR0ciIsImF0dHJpYnV0ZSIsImlnbm9yZSIsInJlc3VsdCIsImQiLCJlbCIsInNpbmdsZSIsImdldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiZ2V0U2luZ2xlIiwic3JjSXRlbSIsIm9yaWdpbmFsSXRlbSIsInVwZGF0ZWRBdCIsIkRhdGUiLCJub3ciLCJza2lwIiwidGhlbiIsInNpbmdsZURvbSIsImdldFRpbWUiLCJnYXRoZXJEYXRhIiwiZmFpbGVkIiwiaXRlbSIsInByb21pc2VzIiwib2xkUmVzdWx0cyIsIm5ld0l0ZW0iLCJxdWVyeUl0ZW0iLCJuZXh0IiwicHJvbWlzZSIsInByb21pc2VzQXJyIiwicnVuIiwiYmFzZUNvbmZpZyIsImZpbGVEYXRhIiwiZ2F0aGVyUHJvbWlzZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUEsa0JBQWtCLFNBQXhCLEMsQ0FBbUM7QUFDbkMsSUFBTUMsUUFBUSxFQUFkOztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1DLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3ZCLFFBQU1DLE9BQU87QUFDVDtBQUNBLDBHQUZTLEVBR1QseUhBSFMsRUFJVCx5R0FKUyxFQUtULDZHQUxTLEVBTVQsNkdBTlMsRUFPVCw2R0FQUyxFQVFULDZHQVJTLEVBU1Qsc0dBVFMsRUFVVCx3R0FWUyxFQVdULDJHQVhTO0FBWVQ7QUFDQSxxSUFiUztBQWNUO0FBQ0EsOEVBZlMsRUFnQlQsbUVBaEJTLEVBaUJULG9GQWpCUyxFQWtCVCxvRUFsQlMsRUFtQlQsMEVBbkJTLEVBb0JULG1FQXBCUztBQXFCVDtBQUNBLDhFQXRCUyxFQXVCVCxvRkF2QlMsRUF3QlQsNEtBeEJTLEVBeUJULHlHQXpCUyxFQTBCVCx5RUExQlMsRUEyQlQsa0VBM0JTLEVBNEJULGtFQTVCUyxFQTZCVCw4R0E3QlMsRUE4QlQsb0ZBOUJTLEVBK0JULGlFQS9CUyxFQWdDVCxrRUFoQ1MsRUFpQ1QsbURBakNTO0FBa0NUO0FBQ0EsNkhBbkNTLEVBb0NULGdJQXBDUyxDQUFiOztBQXVDQSxXQUFPQSxLQUFLQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0JILEtBQUtJLE1BQWhDLENBQUwsQ0FBUDtBQUNILENBekNEOztBQTJDQTs7Ozs7QUFLQSxJQUFNQyxlQUFlLFNBQWZBLFlBQWU7QUFBQSxXQUFPO0FBQ3hCO0FBQ0FDLHlCQUFpQixPQUZPO0FBR3hCQywyQkFBbUIsSUFISztBQUl4QjtBQUNBQyxjQUFNO0FBQ0ZDLHdCQUFZO0FBRFYsU0FMa0I7QUFReEJDLG1CQUFXLElBUmE7QUFTeEI7QUFDQTtBQUNBQyxtQkFBVyxJQUFJLHNCQUFZQyxTQUFoQixDQUEwQixJQUExQixFQUFnQyxFQUFFQyxXQUFXLElBQWIsRUFBaEMsQ0FYYTtBQVl4QkMsbUJBQVdmLGNBWmE7QUFheEI7QUFDQTtBQUNBO0FBQ0FnQixzQkFBYztBQUNWQyx1QkFBVyxJQUREO0FBRVZDLDRCQUFnQixNQUFNO0FBRlo7QUFoQlUsS0FBUDtBQUFBLENBQXJCOztBQXNCQTs7Ozs7O0FBTUEsSUFBTUMsaUJBQWlCLFNBQWpCQSxjQUFpQixDQUFDQyxJQUFELEVBQVU7QUFDN0IsUUFBSSxDQUFDQSxJQUFELElBQVMsQ0FBQ0EsS0FBS0MsR0FBbkIsRUFBd0I7QUFDcEIsY0FBTSxJQUFJQyxLQUFKLENBQVUsaUNBQVYsQ0FBTjtBQUNIOztBQUVELFFBQUksT0FBT0YsS0FBS0MsR0FBWixLQUFvQixRQUF4QixFQUFrQztBQUM5QixjQUFNLElBQUlDLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTUMsZUFBZUMsT0FBT0MsSUFBUCxDQUFZTCxLQUFLTSxTQUFMLElBQWtCLEVBQTlCLENBQXJCO0FBQ0EsUUFBSSxDQUFDSCxZQUFELElBQWlCLENBQUNBLGFBQWFsQixNQUFuQyxFQUEyQztBQUN2QyxlQUFPLENBQUNlLEtBQUtDLEdBQU4sQ0FBUDtBQUNIOztBQUVEO0FBQ0EsUUFBSU0sYUFBSjs7QUFFQTtBQUNBSixpQkFBYUssT0FBYixDQUFxQixlQUFPO0FBQ3hCLFlBQU1DLGVBQWVULEtBQUtNLFNBQUwsQ0FBZUksR0FBZixDQUFyQjtBQUNBLFlBQU1DLFlBQVlKLFFBQVEsQ0FBQ1AsS0FBS0MsR0FBTixDQUExQjs7QUFFQTtBQUNBLFlBQU1XLFVBQVVELFVBQVVFLEdBQVYsQ0FBYztBQUFBLG1CQUFPSixhQUFhSSxHQUFiLENBQWlCLG9CQUFZO0FBQzlELG9CQUFNQyxhQUFhLEVBQW5COztBQUVBLG9CQUFJLFFBQU9DLFFBQVAseUNBQU9BLFFBQVAsT0FBb0IsUUFBeEIsRUFBa0M7QUFDOUIsd0JBQU1DLE1BQU1ELFNBQVNDLEdBQVQsSUFBZ0IsQ0FBNUI7QUFDQSx3QkFBTUMsTUFBTUYsU0FBU0UsR0FBVCxJQUFnQixFQUE1Qjs7QUFFQSx5QkFBSyxJQUFJQyxJQUFJRixHQUFiLEVBQWtCRSxJQUFJRCxNQUFNLENBQTVCLEVBQStCQyxLQUFLLENBQXBDLEVBQXVDO0FBQ25DSixtQ0FBV0ssSUFBWCxDQUFnQmxCLElBQUltQixPQUFKLENBQVksSUFBSUMsTUFBSixRQUFrQlgsR0FBbEIsU0FBNkIsR0FBN0IsQ0FBWixFQUErQ1EsQ0FBL0MsQ0FBaEI7QUFDSDtBQUNKLGlCQVBELE1BT087QUFDSDtBQUNBSiwrQkFBV0ssSUFBWCxDQUFnQmxCLElBQUltQixPQUFKLENBQVksSUFBSUMsTUFBSixRQUFrQlgsR0FBbEIsU0FBNkIsR0FBN0IsQ0FBWixFQUErQ0ssUUFBL0MsQ0FBaEI7QUFDSDs7QUFFRCx1QkFBT0QsVUFBUDtBQUNILGFBaEJvQyxDQUFQO0FBQUEsU0FBZCxDQUFoQjs7QUFrQkE7QUFDQVAsZUFBTywyQkFBWUssT0FBWixFQUFxQlUsTUFBckIsQ0FBNEI7QUFBQSxtQkFBTyxDQUFDLENBQUNDLEdBQVQ7QUFBQSxTQUE1QixDQUFQO0FBQ0gsS0F6QkQ7O0FBMkJBLFdBQU8sb0JBQUtoQixJQUFMLENBQVA7QUFDSCxDQTlDRDs7QUFnREE7Ozs7OztBQU1BLElBQU1pQixTQUFTLFNBQVRBLE1BQVMsQ0FBQ0MsR0FBRDtBQUFBLFdBQVMsSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNyRCxZQUFJLE9BQU9ILEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUN6QixrQkFBTSxJQUFJdkIsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDSDs7QUFFRDtBQUNBLGlDQUFlMkIsUUFBZixDQUF3QkosR0FBeEIsRUFBNkJ2QyxjQUE3QixFQUE2QyxVQUFDNEMsR0FBRCxFQUFNQyxZQUFOLEVBQXVCO0FBQ2hFLGdCQUFJRCxHQUFKLEVBQVM7QUFDTCx1QkFBT0YsT0FBT0UsR0FBUCxDQUFQO0FBQ0g7O0FBRURILG9CQUFRSSxZQUFSO0FBQ0gsU0FORDtBQU9ILEtBYnVCLENBQVQ7QUFBQSxDQUFmOztBQWVBOzs7Ozs7Ozs7O0FBVUEsSUFBTUMsU0FBUyxTQUFUQSxNQUFTLENBQUMvQixHQUFEO0FBQUEsUUFBTWdDLElBQU4sdUVBQWEsS0FBYjtBQUFBLFFBQW9CQyxRQUFwQix1RUFBK0IsSUFBL0I7QUFBQSxRQUFxQ0MsUUFBckMsdUVBQWdELEtBQWhEO0FBQUEsUUFBdURDLElBQXZELHVFQUE4RCxFQUE5RDtBQUFBLFdBQXFFLElBQUlWLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDakgsWUFBSSxPQUFPM0IsR0FBUCxLQUFlLFFBQW5CLEVBQTZCO0FBQ3pCLGtCQUFNLElBQUlDLEtBQUosQ0FBVSwrQkFBVixDQUFOO0FBQ0g7O0FBRUQ7QUFDQSxZQUFJK0IsU0FBUyxLQUFULElBQWtCLENBQUMsa0JBQU1oQyxHQUFOLENBQXZCLEVBQW1DO0FBQy9CLGtCQUFNLElBQUlDLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQ0g7O0FBRUQ7QUFDQWdDLG1CQUFXRCxTQUFTLEtBQVQsR0FBaUJuRCxLQUFLdUQsS0FBTCxDQUFXSCxXQUFXcEQsS0FBS0UsTUFBTCxLQUFnQmtELFFBQWhCLEdBQTJCLENBQWpELENBQWpCLEdBQXVFLENBQWxGOztBQUVBO0FBQ0FJLG1CQUFXLFlBQU07QUFDYixnQkFBTUMsT0FBUUgsS0FBS0ksUUFBTCxJQUFpQkwsUUFBbEIsR0FBK0JDLEtBQUtLLEdBQUwsSUFBWSxLQUEzQyxHQUFvRCxDQUFqRTtBQUNBO0FBQ0EsZ0JBQU1DLGlCQUFpQlAsV0FBVyxnQkFBTVEsb0JBQU4sRUFBWCxHQUEwQ0MsU0FBakU7QUFDQSxnQkFBTUMsU0FBUyxFQUFmO0FBQ0EsZ0JBQU1DLE9BQU8sRUFBYjtBQUNBLGdCQUFNQyxRQUFRLEVBQWQ7O0FBRUE7QUFDQSxnQkFBTUMsZUFBZSxTQUFmQSxZQUFlLENBQUNDLE1BQUQ7QUFBQSxvQkFBUy9CLENBQVQsdUVBQWEsQ0FBYjtBQUFBLHVCQUFtQm9CLFdBQVcsWUFBTTtBQUNyRCx3QkFBSUYsS0FBS0ksUUFBTCxJQUFpQlMsT0FBT0MsQ0FBUCxDQUFTQyxJQUFULENBQWNmLEtBQUtJLFFBQW5CLEVBQTZCdkQsTUFBN0IsS0FBd0MsQ0FBekQsSUFBOERpQyxJQUFJLEVBQXRFLEVBQTBFO0FBQ3RFLCtCQUFPOEIsYUFBYUMsTUFBYixFQUFxQi9CLElBQUksQ0FBekIsQ0FBUDtBQUNIOztBQUVELHdCQUFNa0MsVUFBVUgsT0FBT0ksUUFBUCxDQUFnQkMsZUFBaEIsQ0FBZ0NDLFNBQWhEO0FBQ0Esd0JBQU1DLFVBQVUsRUFBRVAsY0FBRixFQUFVRyxnQkFBVixFQUFtQlAsY0FBbkIsRUFBMkJDLFVBQTNCLEVBQWlDQyxZQUFqQyxFQUFoQjs7QUFFQTtBQUNBcEUsMEJBQU1zQixHQUFOLElBQWF1RCxPQUFiOztBQUVBO0FBQ0E3Qiw0QkFBUTZCLE9BQVI7QUFDSCxpQkFidUMsRUFhckNqQixPQUFPLEVBYjhCLENBQW5CO0FBQUEsYUFBckI7O0FBZUEsZ0JBQUlKLFFBQUosRUFBYztBQUNWTywrQkFBZWUsRUFBZixDQUFrQixZQUFsQixFQUFnQyxpQkFBUztBQUFFWiwyQkFBTzFCLElBQVAsQ0FBWXVDLEtBQVo7QUFBcUIsaUJBQWhFO0FBQ0FoQiwrQkFBZWUsRUFBZixDQUFrQixPQUFsQixFQUEyQixpQkFBUztBQUFFWiwyQkFBTzFCLElBQVAsQ0FBWXVDLEtBQVo7QUFBcUIsaUJBQTNEO0FBQ0FoQiwrQkFBZWUsRUFBZixDQUFrQixLQUFsQixFQUF5QixlQUFPO0FBQUVYLHlCQUFLM0IsSUFBTCxDQUFVd0MsR0FBVjtBQUFpQixpQkFBbkQ7QUFDQWpCLCtCQUFlZSxFQUFmLENBQWtCLE1BQWxCLEVBQTBCLGdCQUFRO0FBQUVWLDBCQUFNNUIsSUFBTixDQUFXeUMsSUFBWDtBQUFtQixpQkFBdkQ7QUFDSDs7QUFFRDtBQUNBLGdCQUFJakYsTUFBTXNCLEdBQU4sQ0FBSixFQUFnQjtBQUNaLHVCQUFPK0MsYUFBYXJFLE1BQU1zQixHQUFOLEVBQVdnRCxNQUF4QixDQUFQO0FBQ0g7O0FBRUQ7QUFDQSxnQkFBTVksU0FBUyxxQkFBTTNFLGNBQU4sRUFBc0I7QUFDakN3RCw4Q0FEaUM7QUFFakNvQix5QkFBUyxDQUFDLHNDQUFELENBRndCO0FBR2pDQywwQkFBVTtBQUNOQyw0Q0FBd0I3QixXQUFXLENBQUMsUUFBRCxDQUFYLEdBQXdCLEVBRDFDO0FBRU44Qiw4Q0FBMEI5QixXQUFXLENBQUMsUUFBRCxDQUFYLEdBQXdCLEVBRjVDO0FBR04rQiwyQ0FBdUIsQ0FBQy9CO0FBSGxCO0FBSHVCLGFBQXRCLENBQWY7O0FBVUE7QUFDQSw0QkFBTWdDLEdBQU4sQ0FBVWxFLEdBQVYsRUFBZTRELE1BQWYsRUFBdUIsVUFBQy9CLEdBQUQsRUFBTW1CLE1BQU4sRUFBaUI7QUFDcEMsb0JBQUluQixHQUFKLEVBQVM7QUFBRSwyQkFBT0YsT0FBT0UsR0FBUCxDQUFQO0FBQXFCOztBQUVoQztBQUNBa0IsNkJBQWFDLE1BQWI7QUFDSCxhQUxEO0FBTUgsU0F0REQsRUFzREdmLFFBdERIO0FBdURILEtBckVtRixDQUFyRTtBQUFBLENBQWY7O0FBdUVBOzs7Ozs7O0FBT0EsSUFBTWtDLFdBQVcsU0FBWEEsUUFBVyxDQUFDbEIsQ0FBRCxFQUFJbUIsUUFBSixFQUE0QjtBQUFBLFFBQWRyRSxJQUFjLHVFQUFQLEVBQU87O0FBQ3pDLFFBQUksQ0FBQ3FFLFFBQUQsSUFBYSxDQUFDQSxTQUFTbEIsSUFBM0IsRUFBaUM7QUFDN0IsY0FBTSxJQUFJakQsS0FBSixDQUFVLHVEQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNb0UsV0FBV3RFLEtBQUtzRSxRQUFMLElBQWlCLEVBQWxDO0FBQ0EsUUFBTUMsZUFBZW5FLE9BQU9DLElBQVAsQ0FBWWlFLFFBQVosQ0FBckI7QUFDQSxRQUFNRSxVQUFVLEVBQWhCOztBQUVBO0FBQ0EsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLGFBQWF0RixNQUFqQyxFQUF5Q3dGLEtBQUssQ0FBOUMsRUFBaUQ7QUFDN0MsWUFBTS9ELE1BQU02RCxhQUFhRSxDQUFiLENBQVo7QUFDQSxZQUFNQyxNQUFNSixTQUFTNUQsR0FBVCxDQUFaO0FBQ0E7QUFDQSxZQUFNaUUsTUFBTU4sU0FBU2xCLElBQVQsTUFBaUJ1QixJQUFJbEMsUUFBckIsQ0FBWjtBQUNBLFlBQU1vQyxTQUFTRixJQUFJSixRQUFuQjtBQUNBLFlBQU1PLE9BQU9ILElBQUlJLFNBQWpCO0FBQ0EsWUFBTUMsU0FBU0wsSUFBSUssTUFBbkI7QUFDQSxZQUFNQyxTQUFTLEVBQWY7O0FBRUE7QUFDQSxhQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSU4sSUFBSTFGLE1BQXhCLEVBQWdDZ0csS0FBSyxDQUFyQyxFQUF3QztBQUNwQyxnQkFBTUMsS0FBS1AsSUFBSU0sQ0FBSixDQUFYO0FBQ0EsZ0JBQUlFLGVBQUo7O0FBRUEsZ0JBQUlQLE1BQUosRUFBWTtBQUNSLG9CQUFJLENBQUMxQixDQUFELElBQU0sQ0FBQ0EsRUFBRUMsSUFBYixFQUFtQjtBQUNmLDBCQUFNLElBQUlqRCxLQUFKLENBQVUsb0RBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0Esb0JBQUlnRixHQUFHRSxZQUFILENBQWdCLEtBQWhCLE1BQTJCLFVBQS9CLEVBQTJDO0FBQ3ZDO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBRCx5QkFBU2YsU0FBU2xCLENBQVQsRUFBWUEsRUFBRWdDLEVBQUYsQ0FBWixFQUFtQlIsR0FBbkIsQ0FBVDs7QUFFQTtBQUNBLG9CQUFJdEUsT0FBT0MsSUFBUCxDQUFZOEUsTUFBWixFQUFvQmxHLE1BQXhCLEVBQWdDO0FBQzVCK0YsMkJBQU83RCxJQUFQLENBQVlnRSxNQUFaO0FBQ0g7QUFDSixhQWxCRCxNQWtCTztBQUNIO0FBQ0Esb0JBQUlELEdBQUdFLFlBQUgsQ0FBZ0IsS0FBaEIsTUFBMkIsVUFBL0IsRUFBMkM7QUFDdkM7QUFDSDs7QUFFRDtBQUNBRCx5QkFBUyxDQUFDLENBQUNOLElBQUYsR0FBU0ssR0FBR0UsWUFBSCxDQUFnQlAsSUFBaEIsQ0FBVCxHQUFpQ0ssR0FBR0csV0FBN0M7QUFDQSxpQkFBQyxxQkFBU04sTUFBVCxFQUFpQkksTUFBakIsQ0FBRCxJQUE2QkgsT0FBTzdELElBQVAsQ0FBWWdFLE1BQVosQ0FBN0I7QUFDSDtBQUNKOztBQUVEO0FBQ0EsWUFBSUgsT0FBTy9GLE1BQVgsRUFBbUI7QUFDZnVGLG9CQUFROUQsR0FBUixJQUFlc0UsTUFBZjtBQUNIO0FBQ0o7O0FBRUQsV0FBT1IsT0FBUDtBQUNILENBOUREOztBQWdFQTs7Ozs7OztBQU9BLElBQU1jLFlBQVksU0FBWkEsU0FBWSxDQUFDQyxPQUFELEVBQWdDO0FBQUEsUUFBdEJDLFlBQXNCLHVFQUFQLEVBQU87O0FBQzlDLFFBQUksQ0FBQ0QsT0FBRCxJQUFZLFFBQU9BLE9BQVAseUNBQU9BLE9BQVAsT0FBbUIsUUFBbkMsRUFBNkM7QUFDekMsZUFBTyxJQUFJN0QsT0FBSixDQUFZLFlBQU07QUFDckIsa0JBQU0sSUFBSXhCLEtBQUosQ0FBVSxtREFBVixDQUFOO0FBQ0gsU0FGTSxDQUFQO0FBR0g7O0FBRUQ7QUFDQSxRQUNJLENBQUNxRixRQUFRdEYsR0FBVCxJQUNBc0YsUUFBUUUsU0FBUixJQUFzQkMsS0FBS0MsR0FBTCxLQUFhSixRQUFRRSxTQUFyQixHQUFpQy9HLGVBQXZELElBQ0EwQixPQUFPQyxJQUFQLENBQVlrRixRQUFRUCxNQUFSLElBQWtCLEVBQTlCLEVBQWtDL0YsTUFGbEMsSUFHQXNHLFFBQVFLLElBSFIsSUFHZ0JKLGFBQWFJLElBSmpDLEVBS0U7QUFDRSxlQUFPLElBQUlsRSxPQUFKLENBQVk7QUFBQSxtQkFBV0MsU0FBWDtBQUFBLFNBQVosQ0FBUDtBQUNIOztBQUVEO0FBQ0EsV0FBT0ssT0FBT3VELFFBQVF0RixHQUFmLEVBQW9CLEtBQXBCLEVBQTJCdUYsYUFBYXRELFFBQXhDLEVBQWtEc0QsYUFBYXJELFFBQS9ELEVBQXlFcUQsYUFBYXBELElBQXRGLEVBQTRGeUQsSUFBNUYsQ0FBaUcscUJBQWE7QUFDakgsWUFBTVgsS0FBS1ksVUFBVTdDLE1BQVYsQ0FBaUJDLENBQTVCOztBQUVBO0FBQ0FxQyxnQkFBUVAsTUFBUixHQUFpQlosU0FBU2MsRUFBVCxFQUFhQSxFQUFiLEVBQWlCTSxZQUFqQixDQUFqQjtBQUNBRCxnQkFBUUUsU0FBUixHQUFxQixJQUFJQyxJQUFKLEVBQUQsQ0FBYUssT0FBYixFQUFwQjs7QUFFQSxlQUFPUixPQUFQO0FBQ0gsS0FSTSxDQUFQO0FBU0gsQ0EzQkQ7O0FBNkJBOzs7Ozs7QUFNQSxJQUFNUyxhQUFhLFNBQWJBLFVBQWEsR0FBZTtBQUFBLFFBQWRoRyxJQUFjLHVFQUFQLEVBQU87O0FBQzlCLFFBQUksQ0FBQyx1QkFBUUEsSUFBUixDQUFMLEVBQW9CO0FBQ2hCLGVBQU8sSUFBSTBCLE9BQUosQ0FBWSxZQUFNO0FBQ3JCLGtCQUFNLElBQUl4QixLQUFKLENBQVUscUNBQVYsQ0FBTjtBQUNILFNBRk0sQ0FBUDtBQUdIOztBQUVEO0FBQ0EsUUFBSSxDQUFDRixLQUFLZixNQUFWLEVBQWtCO0FBQ2QsZUFBTyxJQUFJeUMsT0FBSixDQUFZO0FBQUEsbUJBQVdDLFNBQVg7QUFBQSxTQUFaLENBQVA7QUFDSDs7QUFFRDtBQUNBLHVCQUFLLGlCQUFMLEVBQXdCM0IsS0FBS2YsTUFBN0I7O0FBRUE7QUFDQSxRQUFNZ0gsU0FBU2pHLEtBQUthLEdBQUwsQ0FBUyxnQkFBUTtBQUM1QixZQUFJLENBQUNxRixJQUFELElBQVMsUUFBT0EsSUFBUCx5Q0FBT0EsSUFBUCxPQUFnQixRQUE3QixFQUF1QztBQUNuQyxtQkFBTyxJQUFJeEUsT0FBSixDQUFZLFlBQU07QUFDckIsc0JBQU0sSUFBSXhCLEtBQUosQ0FBVSwwQ0FBVixDQUFOO0FBQ0gsYUFGTSxDQUFQO0FBR0g7O0FBRUQsWUFBSSxDQUFDZ0csS0FBS2pHLEdBQU4sSUFBYSxPQUFPaUcsS0FBS2pHLEdBQVosS0FBb0IsUUFBckMsRUFBK0M7QUFDM0MsbUJBQU8sSUFBSXlCLE9BQUosQ0FBWSxZQUFNO0FBQ3JCLHNCQUFNLElBQUl4QixLQUFKLENBQVUsa0NBQVYsQ0FBTjtBQUNILGFBRk0sQ0FBUDtBQUdIO0FBQ0osS0FaYyxFQVlab0IsTUFaWSxDQVlMO0FBQUEsZUFBT0MsR0FBUDtBQUFBLEtBWkssRUFZTyxDQVpQLENBQWY7QUFhQSxRQUFJMEUsTUFBSixFQUFZO0FBQUUsZUFBT0EsTUFBUDtBQUFnQjs7QUFFOUI7QUFDQSxRQUFNRSxXQUFXLEVBQWpCO0FBQ0FuRyxTQUFLUSxPQUFMLENBQWEsVUFBQzBGLElBQUQsRUFBVTtBQUNuQjtBQUNBLFlBQU1FLGFBQWFGLEtBQUsxQixPQUFMLElBQWdCLEVBQW5DO0FBQ0EwQixhQUFLMUIsT0FBTCxHQUFlekUsZUFBZW1HLElBQWYsRUFBcUJyRixHQUFyQixDQUF5QixlQUFPO0FBQzNDLGdCQUFJd0YsVUFBVSxFQUFFcEcsS0FBS3dCLEdBQVAsRUFBZDs7QUFFQTtBQUNBMkUsdUJBQVc1RixPQUFYLENBQW1CLGVBQU87QUFDdEI2RiwwQkFBVTlFLElBQUl0QixHQUFKLEtBQVl3QixHQUFaLEdBQWtCLHFCQUFNMkUsVUFBTixFQUFrQkMsT0FBbEIsQ0FBbEIsR0FBK0NBLE9BQXpEO0FBQ0gsYUFGRDs7QUFJQSxtQkFBT0EsT0FBUDtBQUNILFNBVGMsQ0FBZjs7QUFXQTtBQUNBSCxhQUFLMUIsT0FBTCxDQUFhaEUsT0FBYixDQUFxQjtBQUFBLG1CQUFhMkYsU0FBU2hGLElBQVQsQ0FBYztBQUFBLHVCQUM1Q21FLFVBQVVnQixTQUFWLEVBQXFCSixJQUFyQixFQUNDTCxJQURELENBQ00sbUJBQVc7QUFDYix1Q0FBSyxpQkFBTCxFQUF3QkssSUFBeEI7QUFDQSwyQkFBT0csT0FBUDtBQUNILGlCQUpELENBRDRDO0FBQUEsYUFBZCxDQUFiO0FBQUEsU0FBckI7QUFPSCxLQXRCRDs7QUF3QkE7QUFDQSxXQUFPLElBQUkzRSxPQUFKLENBQVk7QUFBQSxlQUFXQyxRQUFRd0UsWUFBWSxFQUFwQixDQUFYO0FBQUEsS0FBWixFQUNOTixJQURNLENBQ0QsdUJBQWU7QUFDakI7QUFDQSxZQUFNVSxPQUFPLFNBQVBBLElBQU8sSUFBSztBQUNkLGdCQUFNQyxVQUFVQyxZQUFZdkYsQ0FBWixDQUFoQjtBQUNBLGdCQUFJLENBQUNzRixPQUFMLEVBQWM7QUFBRTtBQUFTOztBQUV6QixtQkFBT0EsVUFBVVgsSUFBVixDQUFlO0FBQUEsdUJBQU1VLEtBQUtyRixJQUFJLENBQVQsQ0FBTjtBQUFBLGFBQWYsQ0FBUDtBQUNILFNBTEQ7O0FBT0E7QUFDQSxlQUFPcUYsS0FBSyxDQUFMLENBQVA7QUFDSCxLQVpNLEVBYU5WLElBYk0sQ0FhRDtBQUFBLGVBQU03RixJQUFOO0FBQUEsS0FiQyxDQUFQO0FBY0gsQ0F4RUQ7O0FBMEVBOzs7Ozs7QUFNQSxJQUFNMEcsTUFBTSxTQUFOQSxHQUFNLENBQUNDLFVBQUQsRUFBZ0I7QUFDeEI7QUFDQSx1QkFBSyxnQkFBTDs7QUFFQSxRQUFNSCxVQUFVLElBQUk5RSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFhO0FBQ3JDO0FBQ0EsMkJBQUssYUFBTCxFQUFvQixpQkFBVWdGLFVBQVYsQ0FBcEI7O0FBRUE7QUFDQSwyQkFBSyxnQkFBTCxFQUF1QixVQUFDQyxRQUFEO0FBQUEsbUJBQWNqRixRQUFRaUYsUUFBUixDQUFkO0FBQUEsU0FBdkI7QUFDSCxLQU5lLEVBT2ZmLElBUGUsQ0FPVixrQkFBVTtBQUNaLFlBQU1nQixnQkFBZ0JiLFdBQVduQyxPQUFPN0QsSUFBbEIsRUFDckI2RixJQURxQixDQUNoQjtBQUFBLG1CQUFNLElBQUluRSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFhO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQSxtQ0FBSyxhQUFMLEVBQW9Ca0MsTUFBcEI7O0FBRUE7QUFDQSxtQ0FBSyxjQUFMOztBQUVBbEMsd0JBQVFrQyxNQUFSO0FBQ0gsYUFYVyxDQUFOO0FBQUEsU0FEZ0IsQ0FBdEI7O0FBY0EsZUFBT2dELGFBQVA7QUFDSCxLQXZCZSxDQUFoQjs7QUF5QkEsV0FBT0wsT0FBUDtBQUNILENBOUJEOztBQWdDQTtBQUNBOztRQUVTRSxHLEdBQUFBLEc7UUFBS2xGLE0sR0FBQUEsTTtRQUFRUSxNLEdBQUFBLE07O0FBRXRCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGpzZG9tIGZyb20gJ2pzZG9tJztcbmltcG9ydCByZXNvdXJjZUxvYWRlciBmcm9tICdqc2RvbS9saWIvanNkb20vYnJvd3Nlci9yZXNvdXJjZS1sb2FkZXInO1xuaW1wb3J0IHRvdWdoQ29va2llIGZyb20gJ3RvdWdoLWNvb2tpZSc7XG5pbXBvcnQgdW5pcSBmcm9tICdsb2Rhc2gvdW5pcS5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcC5qcyc7XG5pbXBvcnQgZmxhdHRlbkRlZXAgZnJvbSAnbG9kYXNoL2ZsYXR0ZW5EZWVwLmpzJztcbmltcG9ydCB7IHNlbmQgfSBmcm9tICcuL21haWxib3guanMnO1xuaW1wb3J0IHsgaXNVcmwsIGNvbnRhaW5zIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgY29uZmlnR2V0IH0gZnJvbSAnLi9jb25maWcuanMnO1xuXG5jb25zdCBNSU5fVVBEQVRFX0RJRkYgPSA1MTg0MDAwMDA7IC8vIDcgZGF5c1xuY29uc3QgY2FjaGUgPSB7fTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgYSByYW5kb20gdXNlciBhZ2VudFxuICogVXNlZCB0byBhdm9pZCBzb21lIGNyYXdsaW5nIGlzc3Vlc1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFVzZXJBZ2VudCA9ICgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gW1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyOC4wIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTBfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNy4xIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI2LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjQ7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjQuMyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjApIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MC4wLjIyMTQuOTMgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zMy4wLjE3NTAuMTQ5IFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAvLyBFZGdlXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDIuMC4yMzExLjEzNSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMjQ2JyxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6NDAuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC80MC4xJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgcnY6MzYuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zNi4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEwOyBydjozMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMzLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggaTU4NjsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IHJ2OjMxLjApIEdlY2tvLzIwMTMwNDAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjE7IHJ2OjMxLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgIC8vIElFXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzcuMDsgQVM7IHJ2OjExLjApIGxpa2UgR2Vja28nLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGUsIE1TSUUgMTEsIFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC42OyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjA7IEluZm9QYXRoLjI7IFNMQ0MxOyAuTkVUIENMUiAzLjAuNDUwNi4yMTUyOyAuTkVUIENMUiAzLjUuMzA3Mjk7IC5ORVQgQ0xSIDIuMC41MDcyNykgM2dwcC1nYmEgVU5UUlVTVEVELzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDcuMDsgSW5mb1BhdGguMzsgLk5FVCBDTFIgMy4xLjQwNzY3OyBUcmlkZW50LzYuMDsgZW4tSU4pJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC80LjA7IEluZm9QYXRoLjI7IFNWMTsgLk5FVCBDTFIgMi4wLjUwNzI3OyBXT1c2NCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF83XzM7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoQ29tcGF0aWJsZTsgTVNJRSA4LjA7IFdpbmRvd3MgTlQgNS4yOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS80LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzEuMjIgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyAzLjEpJyxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF85XzMpIEFwcGxlV2ViS2l0LzUzNy43NS4xNCAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNy4wLjMgU2FmYXJpLzcwNDZBMTk0QScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnXG4gICAgXTtcblxuICAgIHJldHVybiBsaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKV07XG59O1xuXG4vKipcbiAqIEdldCB1cmwgY29uZmlnXG4gKlxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0VXJsQ29uZmlnID0gKCkgPT4gKHtcbiAgICAvLyBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgIGRlZmF1bHRFbmNvZGluZzogJ3V0Zi04JyxcbiAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICBwb29sOiB7XG4gICAgICAgIG1heFNvY2tldHM6IDZcbiAgICB9LFxuICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IHJvdGF0aW5nIGlwcz9cbiAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICB1c2VyQWdlbnQ6IGdldFVzZXJBZ2VudCgpLFxuICAgIC8vIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICB9XG59KTtcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjYWNoZSB0aGUgZmlyc3Qgb25lXG4gICAgbGV0IHNyY3M7XG5cbiAgICAvLyBOb3cgbGV0cyBnbyBwZXIgbW9kaWZpZXJcbiAgICBrZXlNb2RpZmllcnMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCBtb2RpZmllcnNTZXQgPSBkYXRhLm1vZGlmaWVyc1trZXldO1xuICAgICAgICBjb25zdCBzcmNzVG9TZXQgPSBzcmNzIHx8IFtkYXRhLnNyY107XG5cbiAgICAgICAgLy8gUGVyIGVhY2ggdXJsLCBzZXQgZWFjaCBtb2RpZmllclxuICAgICAgICBjb25zdCBuZXdTcmNzID0gc3Jjc1RvU2V0Lm1hcChzcmMgPT4gbW9kaWZpZXJzU2V0Lm1hcChtb2RpZmllciA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3R1YWxTcmNzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbW9kaWZpZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWluID0gbW9kaWZpZXIubWluIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF4ID0gbW9kaWZpZXIubWF4IHx8IDEwO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1pbjsgaSA8IG1heCArIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhY3R1YWxTcmNzLnB1c2goc3JjLnJlcGxhY2UobmV3IFJlZ0V4cChgXFx7XFx7JHtrZXl9XFx9XFx9YCwgJ2cnKSwgaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm93IGZvciB0aGUgZ2VuZXJhbCBydWxlIHN0cmluZ1xuICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBtb2RpZmllcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYWN0dWFsU3JjcztcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIExldHMgY2FjaGUgaXQgbm93XG4gICAgICAgIHNyY3MgPSBmbGF0dGVuRGVlcChuZXdTcmNzKS5maWx0ZXIodmFsID0+ICEhdmFsKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bmlxKHNyY3MpO1xufTtcblxuLyoqXG4gKiBHZXRzIHVybCBtYXJrdXBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0VXJsID0gKHVybCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VybCBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgZG93bmxvYWQgaXQhXG4gICAgcmVzb3VyY2VMb2FkZXIuZG93bmxvYWQodXJsLCBnZXRVcmxDb25maWcoKSwgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVKc1xuICogQHBhcmFtIHtvYmplY3R9IHdhaXRcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlID0gJ3VybCcsIHRocm90dGxlID0gMjAwMCwgZW5hYmxlSnMgPSBmYWxzZSwgd2FpdCA9IHt9KSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgbmVlZHMgdG8gYmUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkIHRvIGNoZWNrIGlmIHVybCBpcyBva1xuICAgIGlmICh0eXBlID09PSAndXJsJyAmJiAhaXNVcmwoc3JjKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvLyBSYW5kb20gdGhyb3R0bGUgZXhpc3RzIHRvIGF2b2lkIHRpbWUgcGF0dGVybnMgd2hpY2ggbWF5IGxlYWQgdG8gc29tZSBjcmF3bGVyIGlzc3Vlc1xuICAgIHRocm90dGxlID0gdHlwZSA9PT0gJ3VybCcgPyBNYXRoLnJvdW5kKHRocm90dGxlICsgTWF0aC5yYW5kb20oKSAqIHRocm90dGxlICogMikgOiAxO1xuXG4gICAgLy8gRmlyc3QgdGhlIHRocm90dGxlIHNvIGl0IGRvZXNuJ3QgbWFrZSB0aGUgcmVxdWVzdCBiZWZvcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgdGltZSA9ICh3YWl0LnNlbGVjdG9yIHx8IGVuYWJsZUpzKSA/ICh3YWl0LmZvciB8fCA2MDAwMCkgOiAxO1xuICAgICAgICAvLyBQcmVwYXJlIGZvciBwb3NzaWJsZSBlcnJvcnNcbiAgICAgICAgY29uc3QgdmlydHVhbENvbnNvbGUgPSBlbmFibGVKcyA/IGpzZG9tLmNyZWF0ZVZpcnR1YWxDb25zb2xlKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgICBjb25zdCBsb2dzID0gW107XG4gICAgICAgIGNvbnN0IHdhcm5zID0gW107XG5cbiAgICAgICAgLy8gU2V0IHRoZSB0aW1lciB0byB3YWl0IGZvciBhbmQgZXZhbHVhdGUgZXZhbHVhdGlvblxuICAgICAgICBjb25zdCB3YWl0Rm9yVGltZXIgPSAod2luZG93LCBpID0gMCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAod2FpdC5zZWxlY3RvciAmJiB3aW5kb3cuJC5maW5kKHdhaXQuc2VsZWN0b3IpLmxlbmd0aCA9PT0gMCAmJiBpIDwgMTApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2FpdEZvclRpbWVyKHdpbmRvdywgaSArIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBkb2NIdG1sID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUw7XG4gICAgICAgICAgICBjb25zdCB0b0NhY2hlID0geyB3aW5kb3csIGRvY0h0bWwsIGVycm9ycywgbG9ncywgd2FybnMgfTtcblxuICAgICAgICAgICAgLy8gU2F2ZSBpdFxuICAgICAgICAgICAgY2FjaGVbc3JjXSA9IHRvQ2FjaGU7XG5cbiAgICAgICAgICAgIC8vIEFuZCByZXNvbHZlIGl0XG4gICAgICAgICAgICByZXNvbHZlKHRvQ2FjaGUpO1xuICAgICAgICB9LCB0aW1lIC8gMTApO1xuXG4gICAgICAgIGlmIChlbmFibGVKcykge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ3dhcm4nLCB3YXJuID0+IHsgd2FybnMucHVzaCh3YXJuKTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIGl0IGV4aXN0cyBpbiBjYWNoZS4uLlxuICAgICAgICBpZiAoY2FjaGVbc3JjXSkge1xuICAgICAgICAgICAgcmV0dXJuIHdhaXRGb3JUaW1lcihjYWNoZVtzcmNdLndpbmRvdyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBub3QuLi4gbGV0cyBqdXN0IGdldCBpdFxuICAgICAgICBjb25zdCBjb25maWcgPSBtZXJnZShnZXRVcmxDb25maWcoKSwge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBzY3JpcHRzOiBbJ2h0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5Lm1pbi5qcyddLFxuICAgICAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgICAgICBGZXRjaEV4dGVybmFsUmVzb3VyY2VzOiBlbmFibGVKcyA/IFsnc2NyaXB0J10gOiBbXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IGVuYWJsZUpzID8gWydzY3JpcHQnXSA6IFtdLFxuICAgICAgICAgICAgICAgIFNraXBFeHRlcm5hbFJlc291cmNlczogIWVuYWJsZUpzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihzcmMsIGNvbmZpZywgKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7IHJldHVybiByZWplY3QoZXJyKTsgfVxuXG4gICAgICAgICAgICAvLyBXYWl0IGZvciBzZWxlY3RvciB0byBiZSBhdmFpbGFibGVcbiAgICAgICAgICAgIHdhaXRGb3JUaW1lcih3aW5kb3cpO1xuICAgICAgICB9KTtcbiAgICB9LCB0aHJvdHRsZSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIHNjcmFwIGZyb20gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7ZWxlbWVudH0gcGFyZW50RWxcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXRTY3JhcCA9ICgkLCBwYXJlbnRFbCwgZGF0YSA9IHt9KSA9PiB7XG4gICAgaWYgKCFwYXJlbnRFbCB8fCAhcGFyZW50RWwuZmluZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50IHBhcmVudCBlbGVtZW50IGlzIG5lZWRlZCB0byBnZXQgdGhlIHNjcmFwJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0cmlldmUgPSBkYXRhLnJldHJpZXZlIHx8IHt9O1xuICAgIGNvbnN0IHJldHJpZXZlS2V5cyA9IE9iamVjdC5rZXlzKHJldHJpZXZlKTtcbiAgICBjb25zdCByZXN1bHRzID0ge307XG5cbiAgICAvLyBMZXRzIGl0ZXJhdGUgdGhlIHJldHJpZXZlIHJlcXVlc3RzXG4gICAgZm9yIChsZXQgYyA9IDA7IGMgPCByZXRyaWV2ZUtleXMubGVuZ3RoOyBjICs9IDEpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcmV0cmlldmVLZXlzW2NdO1xuICAgICAgICBjb25zdCByZXEgPSByZXRyaWV2ZVtrZXldO1xuICAgICAgICAvLyBTbyB0aGF0IHdlIGF2b2lkIHBvc3NpYmxlIGNyYXdsaW5nIGlzc3Vlc1xuICAgICAgICBjb25zdCBlbHMgPSBwYXJlbnRFbC5maW5kKGAke3JlcS5zZWxlY3Rvcn1gKTtcbiAgICAgICAgY29uc3QgbmVzdGVkID0gcmVxLnJldHJpZXZlO1xuICAgICAgICBjb25zdCBhdHRyID0gcmVxLmF0dHJpYnV0ZTtcbiAgICAgICAgY29uc3QgaWdub3JlID0gcmVxLmlnbm9yZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgICAgLy8gTGV0cyBnbyBwZXIgZWxlbWVudC4uLlxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGVscy5sZW5ndGg7IGQgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBlbHNbZF07XG4gICAgICAgICAgICBsZXQgc2luZ2xlO1xuXG4gICAgICAgICAgICBpZiAobmVzdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkIHx8ICEkLmZpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCAkIGlzIG5lZWRlZCB0byBnZXQgdGhlIHNjcmFwIG9mIG5lc3RlZCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBpZiB0aGUgZWxlbWVudCBoYXMgc29tZSBcIm5vZm9sbG93XCJcbiAgICAgICAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ25vZm9sbG93Jykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZvciB0aGUgY29udGVudCBpZiBpdCBnb3RzIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXN0ZWQgdGhlblxuICAgICAgICAgICAgICAgIHNpbmdsZSA9IGdldFNjcmFwKCQsICQoZWwpLCByZXEpO1xuXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgYWRkIGlmIHRoZXJlIGlzIG5vIGRhdGFcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoc2luZ2xlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBpZiB0aGUgZWxlbWVudCBoYXMgc29tZSBcIm5vZm9sbG93XCJcbiAgICAgICAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ25vZm9sbG93Jykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBuZXN0ZWQsIGdldCBjb250ZW50IVxuICAgICAgICAgICAgICAgIHNpbmdsZSA9ICEhYXR0ciA/IGVsLmdldEF0dHJpYnV0ZShhdHRyKSA6IGVsLnRleHRDb250ZW50O1xuICAgICAgICAgICAgICAgICFjb250YWlucyhpZ25vcmUsIHNpbmdsZSkgJiYgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgdGFrZSBjYXJlIG9mIGlnbm9yZSBhbmQgZmluYWxseSBjYWNoZSBpdC4uLlxuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIEdldHMgc2luZ2xlIGRhdGFcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gc3JjSXRlbVxuICogQHBhcmFtIHtvYmplY3R9IG9yaWdpbmFsSXRlbVxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0U2luZ2xlID0gKHNyY0l0ZW0sIG9yaWdpbmFsSXRlbSA9IHt9KSA9PiB7XG4gICAgaWYgKCFzcmNJdGVtIHx8IHR5cGVvZiBzcmNJdGVtICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcmMgaXRlbSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYSBjb21wbGlhbnQgb2JqZWN0Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIExldHMgY2hlY2sgaWYgd2UgYXJlIHN0aWxsIGluIHRoZSBkaWZmIHRpbWVcbiAgICBpZiAoXG4gICAgICAgICFzcmNJdGVtLnNyYyB8fFxuICAgICAgICBzcmNJdGVtLnVwZGF0ZWRBdCAmJiAoRGF0ZS5ub3coKSAtIHNyY0l0ZW0udXBkYXRlZEF0IDwgTUlOX1VQREFURV9ESUZGKSAmJlxuICAgICAgICBPYmplY3Qua2V5cyhzcmNJdGVtLnJlc3VsdCB8fCB7fSkubGVuZ3RoIHx8XG4gICAgICAgIHNyY0l0ZW0uc2tpcCB8fCBvcmlnaW5hbEl0ZW0uc2tpcFxuICAgICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKCkpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3QgYW5kIGdldCBiYWNrXG4gICAgcmV0dXJuIGdldERvbShzcmNJdGVtLnNyYywgJ3VybCcsIG9yaWdpbmFsSXRlbS50aHJvdHRsZSwgb3JpZ2luYWxJdGVtLmVuYWJsZUpzLCBvcmlnaW5hbEl0ZW0ud2FpdCkudGhlbihzaW5nbGVEb20gPT4ge1xuICAgICAgICBjb25zdCBlbCA9IHNpbmdsZURvbS53aW5kb3cuJDtcblxuICAgICAgICAvLyBDYWNoZSBkYXRhXG4gICAgICAgIHNyY0l0ZW0ucmVzdWx0ID0gZ2V0U2NyYXAoZWwsIGVsLCBvcmlnaW5hbEl0ZW0pO1xuICAgICAgICBzcmNJdGVtLnVwZGF0ZWRBdCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIHNyY0l0ZW07XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRoZXJlIGlzIG5vIGRhdGFcbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoKSk7XG4gICAgfVxuXG4gICAgLy8gSW5mb3JtIHRoYXQgYWxsIHN0YXJ0ZWRcbiAgICBzZW5kKCdvdXRwdXQub25VcGRhdGUnLCBkYXRhLmxlbmd0aCk7XG5cbiAgICAvLyBMZXRzIGZpcnN0IGNoZWNrIGlmIHdlIGhhdmUgYWxsIGRhdGEgb3Igc29tZXRoaW5nIGZhaWxlZFxuICAgIGNvbnN0IGZhaWxlZCA9IGRhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoIWl0ZW0gfHwgdHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBkYXRhIG9iamVjdCBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWl0ZW0uc3JjIHx8IHR5cGVvZiBpdGVtLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNyYyBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KS5maWx0ZXIodmFsID0+IHZhbClbMF07XG4gICAgaWYgKGZhaWxlZCkgeyByZXR1cm4gZmFpbGVkOyB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBlYWNoIGRhdGEgbWVtYmVyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgLy8gTGV0cyBzZXQgdGhlIGJhc2ljc1xuICAgICAgICBjb25zdCBvbGRSZXN1bHRzID0gaXRlbS5yZXN1bHRzIHx8IFtdO1xuICAgICAgICBpdGVtLnJlc3VsdHMgPSBnZXRRdWVyaWVkVXJscyhpdGVtKS5tYXAodXJsID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdJdGVtID0geyBzcmM6IHVybCB9O1xuXG4gICAgICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIHRoaXMgZXhpc3RzIGluIHRoZSBvbGQgcmVzdWx0cyBhbHJlYWR5XG4gICAgICAgICAgICBvbGRSZXN1bHRzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgICAgICAgICBuZXdJdGVtID0gdmFsLnNyYyA9PT0gdXJsID8gbWVyZ2Uob2xkUmVzdWx0cywgbmV3SXRlbSkgOiBuZXdJdGVtO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXdJdGVtO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgcHJvbWlzZXNcbiAgICAgICAgaXRlbS5yZXN1bHRzLmZvckVhY2gocXVlcnlJdGVtID0+IHByb21pc2VzLnB1c2goKCkgPT5cbiAgICAgICAgICAgIGdldFNpbmdsZShxdWVyeUl0ZW0sIGl0ZW0pXG4gICAgICAgICAgICAudGhlbihuZXdJdGVtID0+IHtcbiAgICAgICAgICAgICAgICBzZW5kKCdvdXRwdXQuc2F2ZUl0ZW0nLCBpdGVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuICAgIH0pO1xuXG4gICAgLy8gTGV0cyBydW4gcHJvbWlzZXMgaW4gc3luY1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUocHJvbWlzZXMgfHwgW10pKVxuICAgIC50aGVuKHByb21pc2VzQXJyID0+IHtcbiAgICAgICAgLy8gTG9vcCB0aGUgcHJvbWlzZXNcbiAgICAgICAgY29uc3QgbmV4dCA9IGkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IHByb21pc2VzQXJyW2ldO1xuICAgICAgICAgICAgaWYgKCFwcm9taXNlKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZSgpLnRoZW4oKCkgPT4gbmV4dChpICsgMSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBmaXJzdFxuICAgICAgICByZXR1cm4gbmV4dCgwKTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IGRhdGEpO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHNjcmFwZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGJhc2VDb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoYmFzZUNvbmZpZykgPT4ge1xuICAgIC8vIEluZm9ybSB0aGF0IGFsbCBzdGFydGVkXG4gICAgc2VuZCgnb3V0cHV0Lm9uU3RhcnQnKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBTYXZlIHRoZSBjb25maWcgZGF0YSBpbiBjYXNlIGl0IGlzbid0IGFscmVhZHkuLi5cbiAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWdHZXQoYmFzZUNvbmZpZykpO1xuXG4gICAgICAgIC8vIE5vdyBnZXQgdGhlIGZ1bGwgZmlsZVxuICAgICAgICBzZW5kKCdvdXRwdXQuZ2V0RmlsZScsIChmaWxlRGF0YSkgPT4gcmVzb2x2ZShmaWxlRGF0YSkpO1xuICAgIH0pXG4gICAgLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgY29uc3QgZ2F0aGVyUHJvbWlzZSA9IGdhdGhlckRhdGEoY29uZmlnLmRhdGEpXG4gICAgICAgIC50aGVuKCgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyBSZXN1bHRzIGFyZSBhbHJlYWR5IGNhY2hlZCBzaW5jZSB0aGUgcHJvamVjdFxuICAgICAgICAgICAgLy8gaXMgdXNpbmcgb2JqZWN0L2FycmF5IHJlZmVyZW5jZXNcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgb3V0cHV0XG4gICAgICAgICAgICBzZW5kKCdvdXRwdXQuc2F2ZScsIGNvbmZpZyk7XG5cbiAgICAgICAgICAgIC8vIEluZm9ybSB0aGF0IGFsbCBlbmRlZFxuICAgICAgICAgICAgc2VuZCgnb3V0cHV0Lm9uRW5kJyk7XG5cbiAgICAgICAgICAgIHJlc29sdmUoY29uZmlnKTtcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHJldHVybiBnYXRoZXJQcm9taXNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgcnVuLCBnZXRVcmwsIGdldERvbSB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgcnVuLCBnYXRoZXJEYXRhLCBnZXRTaW5nbGUsIGdldERvbSwgZ2V0U2NyYXAsIGdldFVybCwgZ2V0UXVlcmllZFVybHMsIGdldFVybENvbmZpZywgZ2V0VXNlckFnZW50IH07XG4iXX0=