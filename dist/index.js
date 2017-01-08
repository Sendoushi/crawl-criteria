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

                    // Set the timer for evaluation
                    var setTime = function setTime(selector, time) {
                        var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

                        setTimeout(function () {
                            if (selector && window.$.find(selector).length === 0 && i < 10) {
                                return setTime(selector, time, i + 1);
                            }

                            resolve({ window: window, errors: errors, logs: logs, warns: warns });
                        }, time);
                    };

                    // Wait for selector to be available
                    setTime(waitFor, waitFor ? 1000 : 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJNSU5fVVBEQVRFX0RJRkYiLCJnZXRVc2VyQWdlbnQiLCJsaXN0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwiZ2V0VXJsQ29uZmlnIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsImFnZW50T3B0aW9ucyIsImtlZXBBbGl2ZSIsImtlZXBBbGl2ZU1zZWNzIiwiZ2V0UXVlcmllZFVybHMiLCJkYXRhIiwic3JjIiwiRXJyb3IiLCJrZXlNb2RpZmllcnMiLCJPYmplY3QiLCJrZXlzIiwibW9kaWZpZXJzIiwic3JjcyIsImZvckVhY2giLCJtb2RpZmllcnNTZXQiLCJrZXkiLCJzcmNzVG9TZXQiLCJuZXdTcmNzIiwibWFwIiwiYWN0dWFsU3JjcyIsIm1vZGlmaWVyIiwibWluIiwibWF4IiwiaSIsInB1c2giLCJyZXBsYWNlIiwiUmVnRXhwIiwiZmlsdGVyIiwidmFsIiwiZ2V0VXJsIiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb3dubG9hZCIsImVyciIsInJlc3BvbnNlVGV4dCIsImdldERvbSIsInR5cGUiLCJ0aHJvdHRsZSIsImVuYWJsZUpzIiwid2FpdEZvciIsInNldFRpbWVvdXQiLCJ2aXJ0dWFsQ29uc29sZSIsImNyZWF0ZVZpcnR1YWxDb25zb2xlIiwidW5kZWZpbmVkIiwiZXJyb3JzIiwibG9ncyIsIndhcm5zIiwib24iLCJlcnJvciIsImxvZyIsIndhcm4iLCJjb25maWciLCJzY3JpcHRzIiwiZmVhdHVyZXMiLCJGZXRjaEV4dGVybmFsUmVzb3VyY2VzIiwiUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzIiwiU2tpcEV4dGVybmFsUmVzb3VyY2VzIiwiZG9uZSIsIndpbmRvdyIsInNldFRpbWUiLCJzZWxlY3RvciIsInRpbWUiLCIkIiwiZmluZCIsImVudiIsInJvdW5kIiwiZ2V0U2NyYXAiLCJwYXJlbnRFbCIsInJldHJpZXZlIiwicmV0cmlldmVLZXlzIiwicmVzdWx0cyIsImMiLCJyZXEiLCJlbHMiLCJuZXN0ZWQiLCJhdHRyIiwiYXR0cmlidXRlIiwiaWdub3JlIiwicmVzdWx0IiwiZCIsImVsIiwic2luZ2xlIiwiZ2V0QXR0cmlidXRlIiwidGV4dENvbnRlbnQiLCJnZXRTaW5nbGUiLCJwcm9taXNlcyIsIml0ZW0iLCJ1cGRhdGVkQXQiLCJEYXRlIiwibm93IiwicHJvbWlzZSIsInRoZW4iLCJzaW5nbGVEb20iLCJnZXRUaW1lIiwiYWxsIiwiZ2F0aGVyRGF0YSIsIm5hbWUiLCJiYXNlbmFtZSIsInVybHMiLCJydW4iLCJiYXNlQ29uZmlnIiwiZmlsZURhdGEiLCJvSXRlbSIsIm5JdGVtIiwiZ2F0aGVyUHJvbWlzZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1BLGtCQUFrQixTQUF4QixDLENBQW1DOztBQUVuQztBQUNBOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxlQUFlLFNBQWZBLFlBQWUsR0FBTTtBQUN2QixRQUFNQyxPQUFPO0FBQ1Q7QUFDQSwwR0FGUyxFQUdULHlIQUhTLEVBSVQseUdBSlMsRUFLVCw2R0FMUyxFQU1ULDZHQU5TLEVBT1QsNkdBUFMsRUFRVCw2R0FSUyxFQVNULHNHQVRTLEVBVVQsd0dBVlMsRUFXVCwyR0FYUztBQVlUO0FBQ0EscUlBYlM7QUFjVDtBQUNBLDhFQWZTLEVBZ0JULG1FQWhCUyxFQWlCVCxvRkFqQlMsRUFrQlQsb0VBbEJTLEVBbUJULDBFQW5CUyxFQW9CVCxtRUFwQlM7QUFxQlQ7QUFDQSw4RUF0QlMsRUF1QlQsb0ZBdkJTLEVBd0JULDRLQXhCUyxFQXlCVCx5R0F6QlMsRUEwQlQseUVB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cENEOztBQXNDQTtBQUNBOztRQUVTUyxHLEdBQUFBLEc7UUFBS3hFLE0sR0FBQUEsTTtRQUFRUSxNLEdBQUFBLE07O0FBRXRCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC9mbGF0dGVuRGVlcC5qcyc7XG5pbXBvcnQgeyBzZW5kIH0gZnJvbSAnLi9tYWlsYm94LmpzJztcbmltcG9ydCB7IGlzVXJsLCBjb250YWlucyB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcblxuY29uc3QgTUlOX1VQREFURV9ESUZGID0gNTE4NDAwMDAwOyAvLyA3IGRheXNcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgYSByYW5kb20gdXNlciBhZ2VudFxuICogVXNlZCB0byBhdm9pZCBzb21lIGNyYXdsaW5nIGlzc3Vlc1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFVzZXJBZ2VudCA9ICgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gW1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyOC4wIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTBfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNy4xIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI2LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjQ7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjQuMyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjApIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MC4wLjIyMTQuOTMgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zMy4wLjE3NTAuMTQ5IFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAvLyBFZGdlXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDIuMC4yMzExLjEzNSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMjQ2JyxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6NDAuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC80MC4xJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgcnY6MzYuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zNi4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEwOyBydjozMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMzLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggaTU4NjsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IHJ2OjMxLjApIEdlY2tvLzIwMTMwNDAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjE7IHJ2OjMxLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgIC8vIElFXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzcuMDsgQVM7IHJ2OjExLjApIGxpa2UgR2Vja28nLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGUsIE1TSUUgMTEsIFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC42OyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjA7IEluZm9QYXRoLjI7IFNMQ0MxOyAuTkVUIENMUiAzLjAuNDUwNi4yMTUyOyAuTkVUIENMUiAzLjUuMzA3Mjk7IC5ORVQgQ0xSIDIuMC41MDcyNykgM2dwcC1nYmEgVU5UUlVTVEVELzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDcuMDsgSW5mb1BhdGguMzsgLk5FVCBDTFIgMy4xLjQwNzY3OyBUcmlkZW50LzYuMDsgZW4tSU4pJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC80LjA7IEluZm9QYXRoLjI7IFNWMTsgLk5FVCBDTFIgMi4wLjUwNzI3OyBXT1c2NCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF83XzM7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoQ29tcGF0aWJsZTsgTVNJRSA4LjA7IFdpbmRvd3MgTlQgNS4yOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS80LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzEuMjIgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyAzLjEpJyxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF85XzMpIEFwcGxlV2ViS2l0LzUzNy43NS4xNCAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNy4wLjMgU2FmYXJpLzcwNDZBMTk0QScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnXG4gICAgXTtcblxuICAgIHJldHVybiBsaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKV07XG59O1xuXG4vKipcbiAqIEdldCB1cmwgY29uZmlnXG4gKlxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0VXJsQ29uZmlnID0gKCkgPT4gKHtcbiAgICAvLyBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgIGRlZmF1bHRFbmNvZGluZzogJ3V0Zi04JyxcbiAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICBwb29sOiB7XG4gICAgICAgIG1heFNvY2tldHM6IDZcbiAgICB9LFxuICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IHJvdGF0aW5nIGlwcz9cbiAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICB1c2VyQWdlbnQ6IGdldFVzZXJBZ2VudCgpLFxuICAgIC8vIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICB9XG59KTtcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IG1vZGlmaWVycyBjb21iaW5hdGlvbnM/XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjYWNoZSB0aGUgZmlyc3Qgb25lXG4gICAgbGV0IHNyY3M7XG5cbiAgICAvLyBMZXRzIGdldCB0aGUgZmlyc3Qga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgZWFjaCB2YWx1ZSBtb2RpZmllclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbCBzcmMgYW5kIHF1ZXJ5IGl0XG4gICAgICAgICAgICAvLyBDYWNoZSBpdFxuICAgIC8vIExldHMgZ2V0IHRoZSBzZWNvbmQga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgdGhyb3VnaCBhbGwgYWxyZWFkeSBzZXQgdmFsdWVzXG5cbiAgICAvLyBNb2RpZmllcnMgYXJlIHRoZSBrZXlzIHRvIGNoZWNrXG4gICAgLy8gSXRzIGFycmF5IGFyZSB0aGUgdmFsdWVcblxuICAgIC8vIE5vdyBsZXRzIGdvIHBlciBtb2RpZmllclxuICAgIGtleU1vZGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVyc1NldCA9IGRhdGEubW9kaWZpZXJzW2tleV07XG4gICAgICAgIGNvbnN0IHNyY3NUb1NldCA9IHNyY3MgfHwgW2RhdGEuc3JjXTtcblxuICAgICAgICAvLyBQZXIgZWFjaCB1cmwsIHNldCBlYWNoIG1vZGlmaWVyXG4gICAgICAgIGNvbnN0IG5ld1NyY3MgPSBzcmNzVG9TZXQubWFwKHNyYyA9PiBtb2RpZmllcnNTZXQubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gTGV0cyBjYWNoZSBpdCBub3dcbiAgICAgICAgc3JjcyA9IGZsYXR0ZW5EZWVwKG5ld1NyY3MpLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgICAgIC8vIGRhdGEubW9kaWZpZXJzW2tleV0ubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgLy8gLy8gTGV0cyBnbyBwZXIgc291cmNlIGFuZCBzZXQgdGhlIG1vZGlmaWVyXG4gICAgICAgIC8vIHVybHMgPSB1cmxzLmNvbmNhdChbZGF0YS5zcmNdKS5tYXAoc3JjID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAvLyAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgLy8gICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgIC8vICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgLy8gICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyAvLyBMZXRzIGZsYXR0ZW4gZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAvLyB1cmxzID0gZmxhdHRlbkRlZXAodXJscykuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3Jjcztcbn07XG5cbi8qKlxuICogR2V0cyB1cmwgbWFya3VwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFVybCA9ICh1cmwpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVcmwgbmVlZHMgdG8gYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgZ2V0VXJsQ29uZmlnKCksIChlcnIsIHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge2ludH0gdGhyb3R0bGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlSnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB3YWl0Rm9yXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0RG9tID0gKHNyYywgdHlwZSA9ICd1cmwnLCB0aHJvdHRsZSA9IDIwMDAsIGVuYWJsZUpzID0gZmFsc2UsIHdhaXRGb3IpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBuZWVkcyB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IHRoZSB0aHJvdHRsZSBzbyBpdCBkb2Vzbid0IG1ha2UgdGhlIHJlcXVlc3QgYmVmb3JlXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIFByZXBhcmUgZm9yIHBvc3NpYmxlIGVycm9yc1xuICAgICAgICBjb25zdCB2aXJ0dWFsQ29uc29sZSA9IGVuYWJsZUpzID8ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICBpZiAoZW5hYmxlSnMpIHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2xvZycsIGxvZyA9PiB7IGxvZ3MucHVzaChsb2cpOyB9KTtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCd3YXJuJywgd2FybiA9PiB7IHdhcm5zLnB1c2god2Fybik7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gbWVyZ2UoZ2V0VXJsQ29uZmlnKCksIHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLFxuICAgICAgICAgICAgc2NyaXB0czogWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5taW4uanMnXSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogZW5hYmxlSnMgPyBbJ3NjcmlwdCddIDogW10sXG4gICAgICAgICAgICAgICAgUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzOiBlbmFibGVKcyA/IFsnc2NyaXB0J10gOiBbXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6ICFlbmFibGVKc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbmU6IChlcnIsIHdpbmRvdykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIHJlamVjdChlcnIpOyB9XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIHRpbWVyIGZvciBldmFsdWF0aW9uXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0VGltZSA9IChzZWxlY3RvciwgdGltZSwgaSA9IDApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3IgJiYgd2luZG93LiQuZmluZChzZWxlY3RvcikubGVuZ3RoID09PSAwICYmIGkgPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRUaW1lKHNlbGVjdG9yLCB0aW1lLCBpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyB3aW5kb3csIGVycm9ycywgbG9ncywgd2FybnMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRpbWUpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBzZWxlY3RvciB0byBiZSBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICBzZXRUaW1lKHdhaXRGb3IsIHdhaXRGb3IgPyAxMDAwIDogMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihzcmMsIGNvbmZpZyk7XG4gICAgfSwgdHlwZSA9PT0gJ3VybCcgPyBNYXRoLnJvdW5kKHRocm90dGxlICsgTWF0aC5yYW5kb20oKSAqIHRocm90dGxlICogMikgOiAxKTtcbiAgICAvLyBSYW5kb20gdGhyb3R0bGUgZXhpc3RzIHRvIGF2b2lkIHRpbWUgcGF0dGVybnMgd2hpY2ggbWF5IGxlYWQgdG8gc29tZSBjcmF3bGVyIGlzc3Vlc1xufSk7XG5cbi8qKlxuICogR2V0cyBzY3JhcCBmcm9tIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2VsZW1lbnR9IHBhcmVudEVsXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0U2NyYXAgPSAoJCwgcGFyZW50RWwsIGRhdGEgPSB7fSkgPT4ge1xuICAgIGlmICghcGFyZW50RWwgfHwgIXBhcmVudEVsLmZpbmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCBwYXJlbnQgZWxlbWVudCBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBzY3JhcCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHJldHJpZXZlID0gZGF0YS5yZXRyaWV2ZSB8fCB7fTtcbiAgICBjb25zdCByZXRyaWV2ZUtleXMgPSBPYmplY3Qua2V5cyhyZXRyaWV2ZSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuXG4gICAgLy8gTGV0cyBpdGVyYXRlIHRoZSByZXRyaWV2ZSByZXF1ZXN0c1xuICAgIGZvciAobGV0IGMgPSAwOyBjIDwgcmV0cmlldmVLZXlzLmxlbmd0aDsgYyArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHJldHJpZXZlS2V5c1tjXTtcbiAgICAgICAgY29uc3QgcmVxID0gcmV0cmlldmVba2V5XTtcbiAgICAgICAgLy8gU28gdGhhdCB3ZSBhdm9pZCBwb3NzaWJsZSBjcmF3bGluZyBpc3N1ZXNcbiAgICAgICAgY29uc3QgZWxzID0gcGFyZW50RWwuZmluZChgJHtyZXEuc2VsZWN0b3J9YCk7XG4gICAgICAgIGNvbnN0IG5lc3RlZCA9IHJlcS5yZXRyaWV2ZTtcbiAgICAgICAgY29uc3QgYXR0ciA9IHJlcS5hdHRyaWJ1dGU7XG4gICAgICAgIGNvbnN0IGlnbm9yZSA9IHJlcS5pZ25vcmU7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIC8vIExldHMgZ28gcGVyIGVsZW1lbnQuLi5cbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCBlbHMubGVuZ3RoOyBkICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZWxzW2RdO1xuICAgICAgICAgICAgbGV0IHNpbmdsZTtcblxuICAgICAgICAgICAgaWYgKG5lc3RlZCkge1xuICAgICAgICAgICAgICAgIGlmICghJCB8fCAhJC5maW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgJCBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBzY3JhcCBvZiBuZXN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgaWYgdGhlIGVsZW1lbnQgaGFzIHNvbWUgXCJub2ZvbGxvd1wiXG4gICAgICAgICAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdub2ZvbGxvdycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmb3IgdGhlIGNvbnRlbnQgaWYgaXQgZ290cyBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmVzdGVkIHRoZW5cbiAgICAgICAgICAgICAgICBzaW5nbGUgPSBnZXRTY3JhcCgkLCAkKGVsKSwgcmVxKTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgaWYgdGhlIGVsZW1lbnQgaGFzIHNvbWUgXCJub2ZvbGxvd1wiXG4gICAgICAgICAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdub2ZvbGxvdycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm8gbmVzdGVkLCBnZXQgY29udGVudCFcbiAgICAgICAgICAgICAgICBzaW5nbGUgPSAhIWF0dHIgPyBlbC5nZXRBdHRyaWJ1dGUoYXR0cikgOiBlbC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICAhY29udGFpbnMoaWdub3JlLCBzaW5nbGUpICYmIHJlc3VsdC5wdXNoKHNpbmdsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIHRha2UgY2FyZSBvZiBpZ25vcmUgYW5kIGZpbmFsbHljYWNoZSBpdC4uLlxuICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIEdldHMgc2luZ2xlIGRhdGFcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0U2luZ2xlID0gKGRhdGEgPSBbXSkgPT4ge1xuICAgIGlmICghaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5lZWRzIHRvIGV4aXN0IGFuZCBiZSBhbiBhcnJheScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoZGF0YSkpO1xuICAgIH1cblxuICAgIC8vIExldHMgZ28gcGVyIGVhY2ggZGF0YSBtZW1iZXJcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgIGRhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAvLyBMZXRzIGNoZWNrIGlmIHdlIGFyZSBzdGlsbCBpbiB0aGUgZGlmZiB0aW1lXG4gICAgICAgIGlmICghaXRlbS5zcmMgfHwgaXRlbS51cGRhdGVkQXQgJiYgKERhdGUubm93KCkgLSBpdGVtLnVwZGF0ZWRBdCA8IE1JTl9VUERBVEVfRElGRikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1ha2UgdGhlIHJlcXVlc3QgYW5kIGdldCBiYWNrXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBnZXREb20oaXRlbS5zcmMsICd1cmwnLCBpdGVtLnRocm90dGxlLCBpdGVtLmVuYWJsZUpzLCBpdGVtLndhaXRGb3IpLnRoZW4oc2luZ2xlRG9tID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gc2luZ2xlRG9tLndpbmRvdy4kO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSBkYXRhXG4gICAgICAgICAgICBpdGVtLnJlc3VsdCA9IGdldFNjcmFwKGVsLCBlbCwgaXRlbSk7XG4gICAgICAgICAgICBpdGVtLnVwZGF0ZWRBdCA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSByZXRyaWV2ZSB3ZSBubyBsb25nZXIgbmVlZCBpdFxuICAgICAgICAgICAgZGVsZXRlIGl0ZW0ucmV0cmlldmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKCkgPT4gZGF0YSk7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZSgpKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIGdvIHBlciBlYWNoIGRhdGEgbWVtYmVyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICBkYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHByb21pc2U7XG5cbiAgICAgICAgaWYgKCFpdGVtIHx8IHR5cGVvZiBpdGVtICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgZGF0YSBvYmplY3QgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpdGVtLnNyYyB8fCB0eXBlb2YgaXRlbS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzcmMgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyBtYWtlIHRoZSBuYW1lIHJpZ2h0XG4gICAgICAgIGl0ZW0ubmFtZSA9IGl0ZW0ubmFtZSB8fCBwYXRoLmJhc2VuYW1lKGl0ZW0uc3JjKTtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGV4cGVjdGVkIG9iamVjdFxuICAgICAgICBjb25zdCB1cmxzID0gZ2V0UXVlcmllZFVybHMoaXRlbSkubWFwKHVybCA9PiAoe1xuICAgICAgICAgICAgc3JjOiB1cmwsIHJldHJpZXZlOiBpdGVtLnJldHJpZXZlXG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBDYWNoZSB0aGUgdXJsc1xuICAgICAgICBpdGVtLnJlc3VsdHMgPSB1cmxzO1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIHNpbmdsZSByZXF1ZXN0XG4gICAgICAgIHByb21pc2UgPSBnZXRTaW5nbGUoaXRlbS5yZXN1bHRzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIHByZWZlci1hcnJvdy1jYWxsYmFjayAqL1xuICAgICAgICAgICAgc2VuZCgnb3V0cHV0LnR5cGUnLCAodHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE5vIHByb21pc2VzIGRvZXNuJ3QgbmVlZCBjYWNoZSwgaXQgd2lsbCBpbXByb3ZlIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgIT09ICdwcm9taXNlJykgeyByZXR1cm47IH1cblxuICAgICAgICAgICAgICAgIC8vIFJlc3VsdHMgYXJlIGFscmVhZHkgY2FjaGVkIHNpbmNlIHRoZSBwcm9qZWN0XG4gICAgICAgICAgICAgICAgLy8gaXMgdXNpbmcgb2JqZWN0L2FycmF5IHJlZmVyZW5jZXNcblxuICAgICAgICAgICAgICAgIC8vIFNhdmUgZGF0YSB0byBvdXRwdXRcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiAuLi5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBwcmVmZXItYXJyb3ctY2FsbGJhY2sgKi9cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKCkgPT4gZGF0YSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgc2NyYXBlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gYmFzZUNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChiYXNlQ29uZmlnKSA9PiB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHNlbmQoJ291dHB1dC5nZXRGaWxlJywgKGZpbGVEYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb25maWcgPSBjb25maWdHZXQoYmFzZUNvbmZpZyk7XG5cbiAgICAgICAgICAgIC8vIExldHMgbWVyZ2UgdGhlIGRhdGFcbiAgICAgICAgICAgIGZpbGVEYXRhICYmIGZpbGVEYXRhLmRhdGEgJiYgZmlsZURhdGEuZGF0YS5mb3JFYWNoKG5JdGVtID0+IGNvbmZpZy5kYXRhLmZvckVhY2gob0l0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvSXRlbS5zcmMgPT09IG5JdGVtLnNyYykgeyBvSXRlbS5yZXN1bHRzID0gbkl0ZW0ucmVzdWx0czsgfVxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBmaXJzdCBkYXRhLi4uXG4gICAgICAgICAgICBzZW5kKCdvdXRwdXQuc2F2ZScsIGNvbmZpZyk7XG5cbiAgICAgICAgICAgIHJlc29sdmUoY29uZmlnKTtcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbihjb25maWcgPT4ge1xuICAgICAgICBjb25zdCBnYXRoZXJQcm9taXNlID0gZ2F0aGVyRGF0YShjb25maWcuZGF0YSlcbiAgICAgICAgLnRoZW4oKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHNlbmQoJ291dHB1dC50eXBlJywgKHR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBObyBwcm9taXNlcyBkb2Vzbid0IG5lZWQgY2FjaGUsIGl0IHdpbGwgaW1wcm92ZSBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAncHJvbWlzZScpIHsgcmV0dXJuIHJlc29sdmUoY29uZmlnKTsgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVzdWx0cyBhcmUgYWxyZWFkeSBjYWNoZWQgc2luY2UgdGhlIHByb2plY3RcbiAgICAgICAgICAgICAgICAvLyBpcyB1c2luZyBvYmplY3QvYXJyYXkgcmVmZXJlbmNlc1xuXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgb3V0cHV0XG4gICAgICAgICAgICAgICAgc2VuZCgnb3V0cHV0LnNhdmUnLCBjb25maWcpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgcmV0dXJuIGdhdGhlclByb21pc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5leHBvcnQgeyBydW4sIGdldFVybCwgZ2V0RG9tIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdhdGhlckRhdGEsIGdldFNpbmdsZSwgZ2V0RG9tLCBnZXRTY3JhcCwgZ2V0VXJsLCBnZXRRdWVyaWVkVXJscywgZ2V0VXJsQ29uZmlnLCBnZXRVc2VyQWdlbnQgfTtcbiJdfQ==