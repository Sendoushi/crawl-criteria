#!/usr/bin/env node


'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDom = exports.getUrl = exports.run = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _resourceLoader = require('jsdom/lib/jsdom/browser/resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _toughCookie = require('tough-cookie');

var _toughCookie2 = _interopRequireDefault(_toughCookie);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

var _utils = require('./utils.js');

var _config = require('./config.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

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

    var urls = keyModifiers.map(function (key) {
        return data.modifiers[key].map(function (modifier) {
            var actualSrc = data.src.replace(new RegExp('{{' + key + '}}', 'g'), modifier);
            return actualSrc;
        });
    }).reduce(function (a, b) {
        return a.concat(b);
    }).filter(function (val) {
        return !!val;
    });

    return urls;
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

        var options = {
            defaultEncoding: 'windows-1252',
            detectMetaCharset: true,
            // headers: config.headers,
            pool: {
                maxSockets: 6
            },
            strictSSL: true,
            // proxy: config.proxy,
            cookieJar: new _toughCookie2.default.CookieJar(null, { looseMode: true }),
            userAgent: 'Node.js (' + process.platform + '; U; rv:' + process.version + ') AppleWebKit/537.36 (KHTML, like Gecko)',
            // agent: config.agent,
            // agentClass: config.agentClass,
            agentOptions: {
                keepAlive: true,
                keepAliveMsecs: 115 * 1000
            }
        };

        // Finally download it!
        _resourceLoader2.default.download(url, options, function (err, responseText) {
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
    var throttle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
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

            var config = {
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
            };

            // Now for the actual getting
            _jsdom2.default.env(src, config);
        }, type === 'url' ? throttle : 1);
    });
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
        var $ = singleDom.window.$;
        var retrieve = data[i].retrieve || {};
        var retrieveKeys = Object.keys(retrieve);
        var results = {};

        // Lets iterate the retrieve requests
        for (var c = 0; c < retrieveKeys.length; c += 1) {
            var key = retrieveKeys[c];
            var attr = retrieve[key].attribute;
            var result = [];
            var els = $.find(retrieve[key].selector);
            var ignore = retrieve[key].ignore;

            // Lets go per element...
            for (var d = 0; d < els.length; d += 1) {
                var el = els[d];
                var single = !!attr ? el.getAttribute(attr) : el.textContent;

                !(0, _utils.contains)(ignore, single) && result.push(single);
            }

            // Lets take care of ignore and finallycache it...
            results[key] = result;
        }

        // Cache url data
        dataArr.push({
            src: data[i].src,
            result: results
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
var run = function run(config) {
    config = (0, _config.get)(config);

    // Lets gather data from the src
    return gatherData(config.data, config.throttle).then(function (data) {
        return new Promise(function (resolve) {
            // Cache the result
            config.result = data;

            resolve(config);
        });
    });
};

//-------------------------------------
// Runtime

_yargs.argv && _yargs.argv.config && run(_yargs.argv.config);
exports.run = run;
exports.getUrl = getUrl;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJsZW5ndGgiLCJ1cmxzIiwibWFwIiwia2V5IiwiYWN0dWFsU3JjIiwicmVwbGFjZSIsIlJlZ0V4cCIsIm1vZGlmaWVyIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9wdGlvbnMiLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwicHJvY2VzcyIsInBsYXRmb3JtIiwidmVyc2lvbiIsImFnZW50T3B0aW9ucyIsImtlZXBBbGl2ZSIsImtlZXBBbGl2ZU1zZWNzIiwiZG93bmxvYWQiLCJlcnIiLCJyZXNwb25zZVRleHQiLCJnZXREb20iLCJ0eXBlIiwidGhyb3R0bGUiLCJzZXRUaW1lb3V0IiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIm9uIiwicHVzaCIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwiZW52IiwiZ2V0U2luZ2xlIiwiaSIsImRhdGFBcnIiLCJ0aGVuIiwiJCIsInNpbmdsZURvbSIsInJldHJpZXZlIiwicmV0cmlldmVLZXlzIiwicmVzdWx0cyIsImMiLCJhdHRyIiwiYXR0cmlidXRlIiwicmVzdWx0IiwiZWxzIiwiZmluZCIsInNlbGVjdG9yIiwiaWdub3JlIiwiZCIsImVsIiwic2luZ2xlIiwiZ2V0QXR0cmlidXRlIiwidGV4dENvbnRlbnQiLCJuZXh0IiwiZ2F0aGVyRGF0YSIsImRhdGFSZXN1bHQiLCJuYW1lIiwiYmFzZW5hbWUiLCJydW4iXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsaUJBQWlCLFNBQWpCQSxjQUFpQixDQUFDQyxJQUFELEVBQVU7QUFDN0IsUUFBSSxDQUFDQSxJQUFELElBQVMsQ0FBQ0EsS0FBS0MsR0FBbkIsRUFBd0I7QUFDcEIsY0FBTSxJQUFJQyxLQUFKLENBQVUsaUNBQVYsQ0FBTjtBQUNIOztBQUVELFFBQUksT0FBT0YsS0FBS0MsR0FBWixLQUFvQixRQUF4QixFQUFrQztBQUM5QixjQUFNLElBQUlDLEtBQUosQ0FBVSx3Q0FBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTUMsZUFBZUMsT0FBT0MsSUFBUCxDQUFZTCxLQUFLTSxTQUFMLElBQWtCLEVBQTlCLENBQXJCO0FBQ0EsUUFBSSxDQUFDSCxZQUFELElBQWlCLENBQUNBLGFBQWFJLE1BQW5DLEVBQTJDO0FBQ3ZDLGVBQU8sQ0FBQ1AsS0FBS0MsR0FBTixDQUFQO0FBQ0g7O0FBRUQsUUFBTU8sT0FBT0wsYUFBYU0sR0FBYixDQUFpQjtBQUFBLGVBQU9ULEtBQUtNLFNBQUwsQ0FBZUksR0FBZixFQUFvQkQsR0FBcEIsQ0FBd0Isb0JBQVk7QUFDckUsZ0JBQU1FLFlBQVlYLEtBQUtDLEdBQUwsQ0FBU1csT0FBVCxDQUFpQixJQUFJQyxNQUFKLFFBQWtCSCxHQUFsQixTQUE2QixHQUE3QixDQUFqQixFQUFvREksUUFBcEQsQ0FBbEI7QUFDQSxtQkFBT0gsU0FBUDtBQUNILFNBSG9DLENBQVA7QUFBQSxLQUFqQixFQUdUSSxNQUhTLENBR0Ys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InNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCB7IGlzVXJsLCBjb250YWlucyB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgY29uc3QgdXJscyA9IGtleU1vZGlmaWVycy5tYXAoa2V5ID0+IGRhdGEubW9kaWZpZXJzW2tleV0ubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgY29uc3QgYWN0dWFsU3JjID0gZGF0YS5zcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBtb2RpZmllcik7XG4gICAgICAgIHJldHVybiBhY3R1YWxTcmM7XG4gICAgfSkpLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYikpLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgcmV0dXJuIHVybHM7XG59O1xuXG4vKipcbiAqIEdldHMgdXJsIG1hcmt1cFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRVcmwgPSAodXJsKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVXJsIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGVmYXVsdEVuY29kaW5nOiAnd2luZG93cy0xMjUyJyxcbiAgICAgICAgZGV0ZWN0TWV0YUNoYXJzZXQ6IHRydWUsXG4gICAgICAgIC8vIGhlYWRlcnM6IGNvbmZpZy5oZWFkZXJzLFxuICAgICAgICBwb29sOiB7XG4gICAgICAgICAgICBtYXhTb2NrZXRzOiA2XG4gICAgICAgIH0sXG4gICAgICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAgICAgLy8gcHJveHk6IGNvbmZpZy5wcm94eSxcbiAgICAgICAgY29va2llSmFyOiBuZXcgdG91Z2hDb29raWUuQ29va2llSmFyKG51bGwsIHsgbG9vc2VNb2RlOiB0cnVlIH0pLFxuICAgICAgICB1c2VyQWdlbnQ6IGBOb2RlLmpzICgke3Byb2Nlc3MucGxhdGZvcm19OyBVOyBydjoke3Byb2Nlc3MudmVyc2lvbn0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pYCxcbiAgICAgICAgLy8gYWdlbnQ6IGNvbmZpZy5hZ2VudCxcbiAgICAgICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgICAgIGFnZW50T3B0aW9uczoge1xuICAgICAgICAgICAga2VlcEFsaXZlOiB0cnVlLFxuICAgICAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgb3B0aW9ucywgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldERvbSA9IChzcmMsIHR5cGUgPSAndXJsJywgdGhyb3R0bGUgPSAxMDAwKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgbmVlZHMgdG8gYmUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkIHRvIGNoZWNrIGlmIHVybCBpcyBva1xuICAgIGlmICh0eXBlID09PSAndXJsJyAmJiAhaXNVcmwoc3JjKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvLyBGaXJzdCB0aGUgdGhyb3R0bGUgc28gaXQgZG9lc24ndCBtYWtlIHRoZSByZXF1ZXN0IGJlZm9yZVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyBQcmVwYXJlIGZvciBwb3NzaWJsZSBlcnJvcnNcbiAgICAgICAgY29uc3QgdmlydHVhbENvbnNvbGUgPSBqc2RvbS5jcmVhdGVWaXJ0dWFsQ29uc29sZSgpO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBjb25zdCB3YXJucyA9IFtdO1xuXG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdsb2cnLCBsb2cgPT4geyBsb2dzLnB1c2gobG9nKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCd3YXJuJywgd2FybiA9PiB7IHdhcm5zLnB1c2god2Fybik7IH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLFxuICAgICAgICAgICAgc2NyaXB0czogWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5taW4uanMnXSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnLCAnbGluayddLFxuICAgICAgICAgICAgICAgIFByb2Nlc3NFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgd2luZG93LCBlcnJvcnMsIGxvZ3MsIHdhcm5zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihzcmMsIGNvbmZpZyk7XG4gICAgfSwgdHlwZSA9PT0gJ3VybCcgPyB0aHJvdHRsZSA6IDEpO1xufSk7XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gcmV0cmlldmVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHBhcmFtIHtpbnR9IGlcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFNpbmdsZSA9IChkYXRhID0gW10sIHRocm90dGxlLCBpID0gMCwgZGF0YUFyciA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE1heWJlIHRoZXJlIGlzIG5vIG1vcmUgZGF0YSBzby4uLiBsZXRzIGluZm9ybVxuICAgIGlmICghZGF0YVtpXSB8fCAhZGF0YVtpXS5zcmMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShkYXRhQXJyKSk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSB0aGUgcmVxdWVzdCBhbmQgZ2V0IGJhY2tcbiAgICByZXR1cm4gZ2V0RG9tKGRhdGFbaV0uc3JjLCAndXJsJywgdGhyb3R0bGUpLnRoZW4oc2luZ2xlRG9tID0+IHtcbiAgICAgICAgY29uc3QgJCA9IHNpbmdsZURvbS53aW5kb3cuJDtcbiAgICAgICAgY29uc3QgcmV0cmlldmUgPSBkYXRhW2ldLnJldHJpZXZlIHx8IHt9O1xuICAgICAgICBjb25zdCByZXRyaWV2ZUtleXMgPSBPYmplY3Qua2V5cyhyZXRyaWV2ZSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcblxuICAgICAgICAvLyBMZXRzIGl0ZXJhdGUgdGhlIHJldHJpZXZlIHJlcXVlc3RzXG4gICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgcmV0cmlldmVLZXlzLmxlbmd0aDsgYyArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSByZXRyaWV2ZUtleXNbY107XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gcmV0cmlldmVba2V5XS5hdHRyaWJ1dGU7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGVscyA9ICQuZmluZChyZXRyaWV2ZVtrZXldLnNlbGVjdG9yKTtcbiAgICAgICAgICAgIGNvbnN0IGlnbm9yZSA9IHJldHJpZXZlW2tleV0uaWdub3JlO1xuXG4gICAgICAgICAgICAvLyBMZXRzIGdvIHBlciBlbGVtZW50Li4uXG4gICAgICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGVscy5sZW5ndGg7IGQgKz0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZWxzW2RdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpbmdsZSA9ICEhYXR0ciA/IGVsLmdldEF0dHJpYnV0ZShhdHRyKSA6IGVsLnRleHRDb250ZW50O1xuXG4gICAgICAgICAgICAgICAgIWNvbnRhaW5zKGlnbm9yZSwgc2luZ2xlKSAmJiByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMZXRzIHRha2UgY2FyZSBvZiBpZ25vcmUgYW5kIGZpbmFsbHljYWNoZSBpdC4uLlxuICAgICAgICAgICAgcmVzdWx0c1trZXldID0gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FjaGUgdXJsIGRhdGFcbiAgICAgICAgZGF0YUFyci5wdXNoKHtcbiAgICAgICAgICAgIHNyYzogZGF0YVtpXS5zcmMsXG4gICAgICAgICAgICByZXN1bHQ6IHJlc3VsdHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5leHQgb25lIGluIHRoZSBwcm9taXNlXG4gICAgICAgIGNvbnN0IG5leHQgPSBnZXRTaW5nbGUoZGF0YSwgdGhyb3R0bGUsIGkgKz0gMSwgZGF0YUFycik7XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aHJvdHRsZVxuICogQHBhcmFtIHtpbnR9IGlcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFSZXN1bHRcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSwgdGhyb3R0bGUsIGkgPSAwLCBkYXRhUmVzdWx0ID0gW10pID0+IHtcbiAgICBpZiAoIWRhdGFbaV0pIHtcbiAgICAgICAgLy8gTWF5YmUgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIHNvLi4uIGxldHMgaW5mb3JtXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoZGF0YVJlc3VsdCkpO1xuICAgIH1cblxuICAgIGlmICghZGF0YVtpXSB8fCB0eXBlb2YgZGF0YVtpXSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBkYXRhIG9iamVjdCBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFbaV0uc3JjIHx8IHR5cGVvZiBkYXRhW2ldLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzcmMgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBtYWtlIHRoZSBuYW1lIHJpZ2h0XG4gICAgZGF0YVtpXS5uYW1lID0gZGF0YVtpXS5uYW1lIHx8IHBhdGguYmFzZW5hbWUoZGF0YVtpXS5zcmMpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBleHBlY3RlZCBvYmplY3RcbiAgICBjb25zdCB1cmxzID0gZ2V0UXVlcmllZFVybHMoZGF0YVtpXSkubWFwKHVybCA9PiAoe1xuICAgICAgICBzcmM6IHVybCwgcmV0cmlldmU6IGRhdGFbaV0ucmV0cmlldmVcbiAgICB9KSk7XG5cbiAgICAvLyBNYWtlIHRoZSBzaW5nbGUgcmVxdWVzdFxuICAgIHJldHVybiBnZXRTaW5nbGUodXJscywgdGhyb3R0bGUpXG4gICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICBkYXRhW2ldLnJlc3VsdCA9IHJlc3VsdDtcblxuICAgICAgICAvLyBDYWNoZSBkYXRhXG4gICAgICAgIGRhdGFSZXN1bHQucHVzaChkYXRhW2ldKTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmV4dCBvbmUgaW4gdGhlIHByb21pc2VcbiAgICAgICAgY29uc3QgbmV4dCA9IGdhdGhlckRhdGEoZGF0YSwgdGhyb3R0bGUsIGkgKz0gMSwgZGF0YVJlc3VsdCk7XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHNjcmFwZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChjb25maWcpID0+IHtcbiAgICBjb25maWcgPSBjb25maWdHZXQoY29uZmlnKTtcblxuICAgIC8vIExldHMgZ2F0aGVyIGRhdGEgZnJvbSB0aGUgc3JjXG4gICAgcmV0dXJuIGdhdGhlckRhdGEoY29uZmlnLmRhdGEsIGNvbmZpZy50aHJvdHRsZSlcbiAgICAudGhlbihkYXRhID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vIENhY2hlIHRoZSByZXN1bHRcbiAgICAgICAgY29uZmlnLnJlc3VsdCA9IGRhdGE7XG5cbiAgICAgICAgcmVzb2x2ZShjb25maWcpO1xuICAgIH0pKTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5hcmd2ICYmIGFyZ3YuY29uZmlnICYmIHJ1bihhcmd2LmNvbmZpZyk7XG5leHBvcnQgeyBydW4sIGdldFVybCwgZ2V0RG9tIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdhdGhlckRhdGEsIGdldFNpbmdsZSwgZ2V0RG9tLCBnZXRVcmwsIGdldFF1ZXJpZWRVcmxzIH07XG4iXX0=