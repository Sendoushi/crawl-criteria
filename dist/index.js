'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDom = exports.getUrl = exports.run = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

var _utils = require('./utils.js');

var _config = require('./config.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * @returns {promise}
 */
var getDom = function getDom(src) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'url';
    var throttle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;
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
            var virtualConsole = _jsdom2.default.createVirtualConsole();
            var errors = [];
            var logs = [];
            var warns = [];

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

            var config = (0, _merge2.default)(getUrlConfig(), {
                virtualConsole: virtualConsole,
                scripts: ['http://code.jquery.com/jquery.min.js'],
                features: {
                    FetchExternalResources: ['script', 'link'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                done: function done(err, window) {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ window: window, errors: errors, logs: logs, warns: warns });
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
        var els = parentEl.find(req.selector + ':not([rel="nofollow"])');
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

                // No need to go for the content if it gots nested
                // Lets get the nested then
                single = getScrap($, $(el), req);
                result.push(single);
            } else {
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
 * @param {object} retrieve
 * @param {int} throttle
 * @param {int} i
 * @param {array} dataArr
 * @return {promise}
 */
var getSingle = function getSingle() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var throttle = arguments[1];
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var dataArr = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    if (!(0, _isArray2.default)(data)) {
        return new Promise(function () {
            throw new Error('Data needs to exist and be an array');
        });
    }

    // Maybe there is no more data so... lets inform
    if (!data[i] || !data[i].src) {
        return new Promise(function (resolve) {
            return resolve(dataArr);
        });
    }

    // Make the request and get back
    return getDom(data[i].src, 'url', throttle).then(function (singleDom) {
        var el = singleDom.window.$;

        // Cache url data
        dataArr.push({
            src: data[i].src,
            result: getScrap(el, el, data[i])
        });

        // Lets get the next one in the promise
        var next = getSingle(data, throttle, i += 1, dataArr);
        return next;
    });
};

/**
 * Gather data
 *
 * @param {array} data
 * @param {number} throttle
 * @param {int} i
 * @param {array} dataResult
 * @returns {promise}
 */
var gatherData = function gatherData() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var throttle = arguments[1];
    var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var dataResult = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    if (!data[i]) {
        // Maybe there is no more data so... lets inform
        return new Promise(function (resolve) {
            return resolve(dataResult);
        });
    }

    if (!data[i] || _typeof(data[i]) !== 'object') {
        return new Promise(function () {
            throw new Error('A data object is required to get the url');
        });
    }

    if (!data[i].src || typeof data[i].src !== 'string') {
        return new Promise(function () {
            throw new Error('A src is required to get the url');
        });
    }

    // Lets make the name right
    data[i].name = data[i].name || _path2.default.basename(data[i].src);

    // Create the expected object
    var urls = getQueriedUrls(data[i]).map(function (url) {
        return {
            src: url, retrieve: data[i].retrieve
        };
    });

    // Make the single request
    return getSingle(urls, throttle).then(function (result) {
        // Cache the result
        data[i].result = result;

        // Cache data
        dataResult.push(data[i]);

        // Lets get the next one in the promise
        var next = gatherData(data, throttle, i += 1, dataResult);
        return next;
    });
};

/**
 * Initialize scraper
 *
 * @param {object|string} config
 * @returns {promise}
 */
var run = function run(config, file) {
    config = (0, _config.get)(config);

    // Lets gather data from the src
    return gatherData(config.data, config.throttle).then(function (data) {
        return new Promise(function (resolve) {
            // Cache the result
            config.result = data;

            // Save the file
            file && _fs2.default.writeFileSync((0, _utils.getPwd)(file), JSON.stringify(config, null, 4), { encoding: 'utf-8' });

            resolve(config);
        });
    });
};

//-------------------------------------
// Runtime

exports.run = run;
exports.getUrl = getUrl;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRVc2VyQWdlbnQiLCJsaXN0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwiZ2V0VXJsQ29uZmlnIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsImFnZW50T3B0aW9ucyIsImtlZXBBbGl2ZSIsImtlZXBBbGl2ZU1zZWNzIiwiZ2V0UXVlcmllZFVybHMiLCJkYXRhIiwic3JjIiwiRXJyb3IiLCJrZXlNb2RpZmllcnMiLCJPYmplY3QiLCJrZXlzIiwibW9kaWZpZXJzIiwic3JjcyIsImZvckVhY2giLCJtb2RpZmllcnNTZXQiLCJrZXkiLCJzcmNzVG9TZXQiLCJuZXdTcmNzIiwibWFwIiwiYWN0dWFsU3JjcyIsIm1vZGlmaWVyIiwibWluIiwibWF4IiwiaSIsInB1c2giLCJyZXBsYWNlIiwiUmVnRXhwIiwiZmlsdGVyIiwidmFsIiwiZ2V0VXJsIiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb3dubG9hZCIsImVyciIsInJlc3BvbnNlVGV4dCIsImdldERvbSIsInR5cGUiLCJ0aHJvdHRsZSIsInNldFRpbWVvdXQiLCJ2aXJ0dWFsQ29uc29sZSIsImNyZWF0ZVZpcnR1YWxDb25zb2xlIiwiZXJyb3JzIiwibG9ncyIsIndhcm5zIiwib24iLCJlcnJvciIsImxvZyIsIndhcm4iLCJjb25maWciLCJzY3JpcHRzIiwiZmVhdHVyZXMiLCJGZXRjaEV4dGVybmFsUmVzb3VyY2VzIiwiUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzIiwiU2tpcEV4dGVybmFsUmVzb3VyY2VzIiwiZG9uZSIsIndpbmRvdyIsImVudiIsInJvdW5kIiwiZ2V0U2NyYXAiLCIkIiwicGFyZW50RWwiLCJmaW5kIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsInNlbGVjdG9yIiwibmVzdGVkIiwiYXR0ciIsImF0dHJpYnV0ZSIsImlnbm9yZSIsInJlc3VsdCIsImQiLCJlbCIsInNpbmdsZSIsImdldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiZ2V0U2luZ2xlIiwiZGF0YUFyciIsInRoZW4iLCJzaW5nbGVEb20iLCJuZXh0IiwiZ2F0aGVyRGF0YSIsImRhdGFSZXN1bHQiLCJuYW1lIiwiYmFzZW5hbWUiLCJ1cmxzIiwicnVuIiwiZmlsZSIsIndyaXRlRmlsZVN5bmMiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5jb2RpbmciXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGVBQWUsU0FBZkEsWUFBZSxHQUFNO0FBQ3ZCLFFBQU1DLE9BQU87QUFDVDtBQUNBLDBHQUZTLEVBR1QseUhBSFMsRUFJVCx5R0FKUyxFQUtULDZHQUxTLEVBTVQsNkdBTlMsRUFPVCw2R0FQUyxFQVFULDZHQVJTLEVBU1Qsc0dBVFMsRUFVVCx3R0FWUyxFQVdULDJHQVhTO0FBWVQ7QUFDQSxxSUFiUztBQWNUO0FBQ0EsOEVBZlMsRUFnQlQsbUVBaEJTLEVBaUJULG9GQWpCUyxFQWtCVCxvRUFsQlMsRUFtQlQsMEVBbkJTLEVBb0JULG1FQXBCUztBQXFCVDtBQUNBLDhFQXRCUyxFQXVCVCxvRkF2QlMsRUF3QlQsNEtBeEJTLEVBeUJULHlHQXpCUyxFQTBCVCx5RUExQlMsRUEyQlQsa0VBM0JTLEVBNEJULGtFQTVCUyxFQTZCVCw4R0E3QlMsRUE4QlQsb0ZBOUJTLEVBK0JULGlFQS9CUyxFQWdDVCxrRUFoQ1MsRUFpQ1QsbURBakNTO0FBa0NUO0FBQ0EsNkhBbkNTLEVBb0NULGdJQXBDUyxDQUFiOztBQXVDQSxXQUFP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QUNBa0IsbUJBQU95QixNQUFQLEdBQWdCdEUsSUFBaEI7O0FBRUE7QUFDQXVGLG9CQUFRLGFBQUdDLGFBQUgsQ0FBaUIsbUJBQU9ELElBQVAsQ0FBakIsRUFBK0JFLEtBQUtDLFNBQUwsQ0FBZTdDLE1BQWYsRUFBdUIsSUFBdkIsRUFBNkIsQ0FBN0IsQ0FBL0IsRUFBZ0UsRUFBRThDLFVBQVUsT0FBWixFQUFoRSxDQUFSOztBQUVBaEUsb0JBQVFrQixNQUFSO0FBQ0gsU0FSYSxDQUFSO0FBQUEsS0FEQyxDQUFQO0FBVUgsQ0FkRDs7QUFnQkE7QUFDQTs7UUFFU3lDLEcsR0FBQUEsRztRQUFLOUQsTSxHQUFBQSxNO1FBQVFRLE0sR0FBQUEsTTs7QUFFdEIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC9mbGF0dGVuRGVlcC5qcyc7XG5pbXBvcnQgeyBpc1VybCwgY29udGFpbnMsIGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXQgYSByYW5kb20gdXNlciBhZ2VudFxuICogVXNlZCB0byBhdm9pZCBzb21lIGNyYXdsaW5nIGlzc3Vlc1xuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFVzZXJBZ2VudCA9ICgpID0+IHtcbiAgICBjb25zdCBsaXN0ID0gW1xuICAgICAgICAvLyBDaHJvbWVcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyOC4wIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTBfMSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQxLjAuMjIyNy4xIFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggeDg2XzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI3LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI2LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjQ7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjM7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDEuMC4yMjI1LjAgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MS4wLjIyMjQuMyBTYWZhcmkvNTM3LjM2JyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjApIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80MC4wLjIyMTQuOTMgU2FmYXJpLzUzNy4zNicsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zMy4wLjE3NTAuMTQ5IFNhZmFyaS81MzcuMzYnLFxuICAgICAgICAvLyBFZGdlXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNDIuMC4yMzExLjEzNSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMjQ2JyxcbiAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgcnY6NDAuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC80MC4xJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgcnY6MzYuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zNi4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEwOyBydjozMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzMzLjAnLFxuICAgICAgICAnTW96aWxsYS81LjAgKFgxMTsgTGludXggaTU4NjsgcnY6MzEuMCkgR2Vja28vMjAxMDAxMDEgRmlyZWZveC8zMS4wJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMTsgV09XNjQ7IHJ2OjMxLjApIEdlY2tvLzIwMTMwNDAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA1LjE7IHJ2OjMxLjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvMzEuMCcsXG4gICAgICAgIC8vIElFXG4gICAgICAgICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjE7IFdPVzY0OyBUcmlkZW50LzcuMDsgQVM7IHJ2OjExLjApIGxpa2UgR2Vja28nLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGUsIE1TSUUgMTEsIFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbycsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC42OyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC81LjA7IEluZm9QYXRoLjI7IFNMQ0MxOyAuTkVUIENMUiAzLjAuNDUwNi4yMTUyOyAuTkVUIENMUiAzLjUuMzA3Mjk7IC5ORVQgQ0xSIDIuMC41MDcyNykgM2dwcC1nYmEgVU5UUlVTVEVELzEuMCcsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDcuMDsgSW5mb1BhdGguMzsgLk5FVCBDTFIgMy4xLjQwNzY3OyBUcmlkZW50LzYuMDsgZW4tSU4pJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBXT1c2NDsgVHJpZGVudC82LjApJyxcbiAgICAgICAgJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4xOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoY29tcGF0aWJsZTsgTVNJRSAxMC4wOyBXaW5kb3dzIE5UIDYuMTsgVHJpZGVudC80LjA7IEluZm9QYXRoLjI7IFNWMTsgLk5FVCBDTFIgMi4wLjUwNzI3OyBXT1c2NCknLFxuICAgICAgICAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF83XzM7IFRyaWRlbnQvNi4wKScsXG4gICAgICAgICdNb3ppbGxhLzQuMCAoQ29tcGF0aWJsZTsgTVNJRSA4LjA7IFdpbmRvd3MgTlQgNS4yOyBUcmlkZW50LzYuMCknLFxuICAgICAgICAnTW96aWxsYS80LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjE7IFRyaWRlbnQvNS4wKScsXG4gICAgICAgICdNb3ppbGxhLzEuMjIgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyAzLjEpJyxcbiAgICAgICAgLy8gU2FmYXJpXG4gICAgICAgICdNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF85XzMpIEFwcGxlV2ViS2l0LzUzNy43NS4xNCAoS0hUTUwsIGxpa2UgR2Vja28pIFZlcnNpb24vNy4wLjMgU2FmYXJpLzcwNDZBMTk0QScsXG4gICAgICAgICdNb3ppbGxhLzUuMCAoaVBhZDsgQ1BVIE9TIDZfMCBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzYuMCBNb2JpbGUvMTBBNTM1NWQgU2FmYXJpLzg1MzYuMjUnXG4gICAgXTtcblxuICAgIHJldHVybiBsaXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKV07XG59O1xuXG4vKipcbiAqIEdldCB1cmwgY29uZmlnXG4gKlxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0VXJsQ29uZmlnID0gKCkgPT4gKHtcbiAgICAvLyBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgIGRlZmF1bHRFbmNvZGluZzogJ3V0Zi04JyxcbiAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICBwb29sOiB7XG4gICAgICAgIG1heFNvY2tldHM6IDZcbiAgICB9LFxuICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IHJvdGF0aW5nIGlwcz9cbiAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICB1c2VyQWdlbnQ6IGdldFVzZXJBZ2VudCgpLFxuICAgIC8vIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICB9XG59KTtcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IG1vZGlmaWVycyBjb21iaW5hdGlvbnM/XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgLy8gTGV0cyBjYWNoZSB0aGUgZmlyc3Qgb25lXG4gICAgbGV0IHNyY3M7XG5cbiAgICAvLyBMZXRzIGdldCB0aGUgZmlyc3Qga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgZWFjaCB2YWx1ZSBtb2RpZmllclxuICAgICAgICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbCBzcmMgYW5kIHF1ZXJ5IGl0XG4gICAgICAgICAgICAvLyBDYWNoZSBpdFxuICAgIC8vIExldHMgZ2V0IHRoZSBzZWNvbmQga2V5TW9kaWZpZXJcbiAgICAgICAgLy8gTGV0cyBnZXQgdGhyb3VnaCBhbGwgYWxyZWFkeSBzZXQgdmFsdWVzXG5cbiAgICAvLyBNb2RpZmllcnMgYXJlIHRoZSBrZXlzIHRvIGNoZWNrXG4gICAgLy8gSXRzIGFycmF5IGFyZSB0aGUgdmFsdWVcblxuICAgIC8vIE5vdyBsZXRzIGdvIHBlciBtb2RpZmllclxuICAgIGtleU1vZGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVyc1NldCA9IGRhdGEubW9kaWZpZXJzW2tleV07XG4gICAgICAgIGNvbnN0IHNyY3NUb1NldCA9IHNyY3MgfHwgW2RhdGEuc3JjXTtcblxuICAgICAgICAvLyBQZXIgZWFjaCB1cmwsIHNldCBlYWNoIG1vZGlmaWVyXG4gICAgICAgIGNvbnN0IG5ld1NyY3MgPSBzcmNzVG9TZXQubWFwKHNyYyA9PiBtb2RpZmllcnNTZXQubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gTGV0cyBjYWNoZSBpdCBub3dcbiAgICAgICAgc3JjcyA9IGZsYXR0ZW5EZWVwKG5ld1NyY3MpLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgICAgIC8vIGRhdGEubW9kaWZpZXJzW2tleV0ubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgLy8gLy8gTGV0cyBnbyBwZXIgc291cmNlIGFuZCBzZXQgdGhlIG1vZGlmaWVyXG4gICAgICAgIC8vIHVybHMgPSB1cmxzLmNvbmNhdChbZGF0YS5zcmNdKS5tYXAoc3JjID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICAvLyAgICAgaWYgKHR5cGVvZiBtb2RpZmllciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgLy8gICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWF4ICsgMTsgaSArPSAxKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChzcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgIC8vICAgICAgICAgYWN0dWFsU3Jjcy5wdXNoKHNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgLy8gICAgIHJldHVybiBhY3R1YWxTcmNzO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyAvLyBMZXRzIGZsYXR0ZW4gZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAvLyB1cmxzID0gZmxhdHRlbkRlZXAodXJscykuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3Jjcztcbn07XG5cbi8qKlxuICogR2V0cyB1cmwgbWFya3VwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFVybCA9ICh1cmwpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVcmwgbmVlZHMgdG8gYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgZ2V0VXJsQ29uZmlnKCksIChlcnIsIHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge2ludH0gdGhyb3R0bGVcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlID0gJ3VybCcsIHRocm90dGxlID0gMjAwMCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIG5lZWRzIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gTmVlZCB0byBjaGVjayBpZiB1cmwgaXMgb2tcbiAgICBpZiAodHlwZSA9PT0gJ3VybCcgJiYgIWlzVXJsKHNyYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3VyY2Ugbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgdGhlIHRocm90dGxlIHNvIGl0IGRvZXNuJ3QgbWFrZSB0aGUgcmVxdWVzdCBiZWZvcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gUHJlcGFyZSBmb3IgcG9zc2libGUgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlID0ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKTtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignd2FybicsIHdhcm4gPT4geyB3YXJucy5wdXNoKHdhcm4pOyB9KTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBtZXJnZShnZXRVcmxDb25maWcoKSwge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBzY3JpcHRzOiBbJ2h0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5Lm1pbi5qcyddLFxuICAgICAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgICAgICBGZXRjaEV4dGVybmFsUmVzb3VyY2VzOiBbJ3NjcmlwdCcsICdsaW5rJ10sXG4gICAgICAgICAgICAgICAgUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzOiBbJ3NjcmlwdCddLFxuICAgICAgICAgICAgICAgIFNraXBFeHRlcm5hbFJlc291cmNlczogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb25lOiAoZXJyLCB3aW5kb3cpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJldHVybiByZWplY3QoZXJyKTsgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoeyB3aW5kb3csIGVycm9ycywgbG9ncywgd2FybnMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihzcmMsIGNvbmZpZyk7XG4gICAgfSwgdHlwZSA9PT0gJ3VybCcgPyBNYXRoLnJvdW5kKHRocm90dGxlICsgTWF0aC5yYW5kb20oKSAqIHRocm90dGxlICogMikgOiAxKTtcbiAgICAvLyBSYW5kb20gdGhyb3R0bGUgZXhpc3RzIHRvIGF2b2lkIHRpbWUgcGF0dGVybnMgd2hpY2ggbWF5IGxlYWQgdG8gc29tZSBjcmF3bGVyIGlzc3Vlc1xufSk7XG5cbi8qKlxuICogR2V0cyBzY3JhcCBmcm9tIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2VsZW1lbnR9IHBhcmVudEVsXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0U2NyYXAgPSAoJCwgcGFyZW50RWwsIGRhdGEgPSB7fSkgPT4ge1xuICAgIGlmICghcGFyZW50RWwgfHwgIXBhcmVudEVsLmZpbmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCBwYXJlbnQgZWxlbWVudCBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBzY3JhcCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHJldHJpZXZlID0gZGF0YS5yZXRyaWV2ZSB8fCB7fTtcbiAgICBjb25zdCByZXRyaWV2ZUtleXMgPSBPYmplY3Qua2V5cyhyZXRyaWV2ZSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuXG4gICAgLy8gTGV0cyBpdGVyYXRlIHRoZSByZXRyaWV2ZSByZXF1ZXN0c1xuICAgIGZvciAobGV0IGMgPSAwOyBjIDwgcmV0cmlldmVLZXlzLmxlbmd0aDsgYyArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHJldHJpZXZlS2V5c1tjXTtcbiAgICAgICAgY29uc3QgcmVxID0gcmV0cmlldmVba2V5XTtcbiAgICAgICAgLy8gU28gdGhhdCB3ZSBhdm9pZCBwb3NzaWJsZSBjcmF3bGluZyBpc3N1ZXNcbiAgICAgICAgY29uc3QgZWxzID0gcGFyZW50RWwuZmluZChgJHtyZXEuc2VsZWN0b3J9Om5vdChbcmVsPVwibm9mb2xsb3dcIl0pYCk7XG4gICAgICAgIGNvbnN0IG5lc3RlZCA9IHJlcS5yZXRyaWV2ZTtcbiAgICAgICAgY29uc3QgYXR0ciA9IHJlcS5hdHRyaWJ1dGU7XG4gICAgICAgIGNvbnN0IGlnbm9yZSA9IHJlcS5pZ25vcmU7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIC8vIExldHMgZ28gcGVyIGVsZW1lbnQuLi5cbiAgICAgICAgZm9yIChsZXQgZCA9IDA7IGQgPCBlbHMubGVuZ3RoOyBkICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZWxzW2RdO1xuICAgICAgICAgICAgbGV0IHNpbmdsZTtcblxuICAgICAgICAgICAgaWYgKG5lc3RlZCkge1xuICAgICAgICAgICAgICAgIGlmICghJCB8fCAhJC5maW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgJCBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBzY3JhcCBvZiBuZXN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIGdvIGZvciB0aGUgY29udGVudCBpZiBpdCBnb3RzIG5lc3RlZFxuICAgICAgICAgICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXN0ZWQgdGhlblxuICAgICAgICAgICAgICAgIHNpbmdsZSA9IGdldFNjcmFwKCQsICQoZWwpLCByZXEpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNpbmdsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5vIG5lc3RlZCwgZ2V0IGNvbnRlbnQhXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gISFhdHRyID8gZWwuZ2V0QXR0cmlidXRlKGF0dHIpIDogZWwudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICAgICAgIWNvbnRhaW5zKGlnbm9yZSwgc2luZ2xlKSAmJiByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0cyB0YWtlIGNhcmUgb2YgaWdub3JlIGFuZCBmaW5hbGx5Y2FjaGUgaXQuLi5cbiAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBkYXRhXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXRyaWV2ZVxuICogQHBhcmFtIHtpbnR9IHRocm90dGxlXG4gKiBAcGFyYW0ge2ludH0gaVxuICogQHBhcmFtIHthcnJheX0gZGF0YUFyclxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0U2luZ2xlID0gKGRhdGEgPSBbXSwgdGhyb3R0bGUsIGkgPSAwLCBkYXRhQXJyID0gW10pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTWF5YmUgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIHNvLi4uIGxldHMgaW5mb3JtXG4gICAgaWYgKCFkYXRhW2ldIHx8ICFkYXRhW2ldLnNyYykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGRhdGFBcnIpKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IGFuZCBnZXQgYmFja1xuICAgIHJldHVybiBnZXREb20oZGF0YVtpXS5zcmMsICd1cmwnLCB0aHJvdHRsZSkudGhlbihzaW5nbGVEb20gPT4ge1xuICAgICAgICBjb25zdCBlbCA9IHNpbmdsZURvbS53aW5kb3cuJDtcblxuICAgICAgICAvLyBDYWNoZSB1cmwgZGF0YVxuICAgICAgICBkYXRhQXJyLnB1c2goe1xuICAgICAgICAgICAgc3JjOiBkYXRhW2ldLnNyYyxcbiAgICAgICAgICAgIHJlc3VsdDogZ2V0U2NyYXAoZWwsIGVsLCBkYXRhW2ldKVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmV4dCBvbmUgaW4gdGhlIHByb21pc2VcbiAgICAgICAgY29uc3QgbmV4dCA9IGdldFNpbmdsZShkYXRhLCB0aHJvdHRsZSwgaSArPSAxLCBkYXRhQXJyKTtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHRocm90dGxlXG4gKiBAcGFyYW0ge2ludH0gaVxuICogQHBhcmFtIHthcnJheX0gZGF0YVJlc3VsdFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdLCB0aHJvdHRsZSwgaSA9IDAsIGRhdGFSZXN1bHQgPSBbXSkgPT4ge1xuICAgIGlmICghZGF0YVtpXSkge1xuICAgICAgICAvLyBNYXliZSB0aGVyZSBpcyBubyBtb3JlIGRhdGEgc28uLi4gbGV0cyBpbmZvcm1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShkYXRhUmVzdWx0KSk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhW2ldIHx8IHR5cGVvZiBkYXRhW2ldICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGRhdGEgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZGF0YVtpXS5zcmMgfHwgdHlwZW9mIGRhdGFbaV0uc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNyYyBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIG1ha2UgdGhlIG5hbWUgcmlnaHRcbiAgICBkYXRhW2ldLm5hbWUgPSBkYXRhW2ldLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShkYXRhW2ldLnNyYyk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGV4cGVjdGVkIG9iamVjdFxuICAgIGNvbnN0IHVybHMgPSBnZXRRdWVyaWVkVXJscyhkYXRhW2ldKS5tYXAodXJsID0+ICh7XG4gICAgICAgIHNyYzogdXJsLCByZXRyaWV2ZTogZGF0YVtpXS5yZXRyaWV2ZVxuICAgIH0pKTtcblxuICAgIC8vIE1ha2UgdGhlIHNpbmdsZSByZXF1ZXN0XG4gICAgcmV0dXJuIGdldFNpbmdsZSh1cmxzLCB0aHJvdHRsZSlcbiAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAvLyBDYWNoZSB0aGUgcmVzdWx0XG4gICAgICAgIGRhdGFbaV0ucmVzdWx0ID0gcmVzdWx0O1xuXG4gICAgICAgIC8vIENhY2hlIGRhdGFcbiAgICAgICAgZGF0YVJlc3VsdC5wdXNoKGRhdGFbaV0pO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXh0IG9uZSBpbiB0aGUgcHJvbWlzZVxuICAgICAgICBjb25zdCBuZXh0ID0gZ2F0aGVyRGF0YShkYXRhLCB0aHJvdHRsZSwgaSArPSAxLCBkYXRhUmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgc2NyYXBlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGNvbmZpZywgZmlsZSkgPT4ge1xuICAgIGNvbmZpZyA9IGNvbmZpZ0dldChjb25maWcpO1xuXG4gICAgLy8gTGV0cyBnYXRoZXIgZGF0YSBmcm9tIHRoZSBzcmNcbiAgICByZXR1cm4gZ2F0aGVyRGF0YShjb25maWcuZGF0YSwgY29uZmlnLnRocm90dGxlKVxuICAgIC50aGVuKGRhdGEgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICBjb25maWcucmVzdWx0ID0gZGF0YTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBmaWxlXG4gICAgICAgIGZpbGUgJiYgZnMud3JpdGVGaWxlU3luYyhnZXRQd2QoZmlsZSksIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgNCksIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG5cbiAgICAgICAgcmVzb2x2ZShjb25maWcpO1xuICAgIH0pKTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5leHBvcnQgeyBydW4sIGdldFVybCwgZ2V0RG9tIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdhdGhlckRhdGEsIGdldFNpbmdsZSwgZ2V0RG9tLCBnZXRTY3JhcCwgZ2V0VXJsLCBnZXRRdWVyaWVkVXJscywgZ2V0VXJsQ29uZmlnLCBnZXRVc2VyQWdlbnQgfTtcbiJdfQ==