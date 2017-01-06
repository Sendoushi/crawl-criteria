#!/usr/bin/env node


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

if (_yargs.argv && _yargs.argv.config) {
    run(_yargs.argv.config, _yargs.argv.save);
}
exports.run = run;
exports.getUrl = getUrl;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJsZW5ndGgiLCJ1cmxzIiwibWFwIiwia2V5IiwiYWN0dWFsU3JjIiwicmVwbGFjZSIsIlJlZ0V4cCIsIm1vZGlmaWVyIiwicmVkdWNlIiwiYSIsImIiLCJjb25jYXQiLCJmaWx0ZXIiLCJ2YWwiLCJnZXRVcmwiLCJ1cmwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9wdGlvbnMiLCJkZWZhdWx0RW5jb2RpbmciLCJkZXRlY3RNZXRhQ2hhcnNldCIsInBvb2wiLCJtYXhTb2NrZXRzIiwic3RyaWN0U1NMIiwiY29va2llSmFyIiwiQ29va2llSmFyIiwibG9vc2VNb2RlIiwidXNlckFnZW50IiwicHJvY2VzcyIsInBsYXRmb3JtIiwidmVyc2lvbiIsImFnZW50T3B0aW9ucyIsImtlZXBBbGl2ZSIsImtlZXBBbGl2ZU1zZWNzIiwiZG93bmxvYWQiLCJlcnIiLCJyZXNwb25zZVRleHQiLCJnZXREb20iLCJ0eXBlIiwidGhyb3R0bGUiLCJzZXRUaW1lb3V0IiwidmlydHVhbENvbnNvbGUiLCJjcmVhdGVWaXJ0dWFsQ29uc29sZSIsImVycm9ycyIsImxvZ3MiLCJ3YXJucyIsIm9uIiwicHVzaCIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwiZW52IiwiZ2V0U2luZ2xlIiwiaSIsImRhdGFBcnIiLCJ0aGVuIiwiJCIsInNpbmdsZURvbSIsInJldHJpZXZlIiwicmV0cmlldmVLZXlzIiwicmVzdWx0cyIsImMiLCJhdHRyIiwiYXR0cmlidXRlIiwicmVzdWx0IiwiZWxzIiwiZmluZCIsInNlbGVjdG9yIiwiaWdub3JlIiwiZCIsImVsIiwic2luZ2xlIiwiZ2V0QXR0cmlidXRlIiwidGV4dENvbnRlbnQiLCJuZXh0IiwiZ2F0aGVyRGF0YSIsImRhdGFSZXN1bHQiLCJuYW1lIiwiYmFzZW5hbWUiLCJydW4iLCJmaWxlIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsInNhdmUiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxpQkFBaUIsU0FBakJBLGNBQWlCLENBQUNDLElBQUQsRUFBVTtBQUM3QixRQUFJLENBQUNBLElBQUQsSUFBUyxDQUFDQSxLQUFLQyxHQUFuQixFQUF3QjtBQUNwQixjQUFNLElBQUlDLEtBQUosQ0FBVSxpQ0FBVixDQUFOO0FBQ0g7O0FBRUQsUUFBSSxPQUFPRixLQUFLQyxHQUFaLEtBQW9CLFFBQXhCLEVBQWtDO0FBQzlCLGNBQU0sSUFBSUMsS0FBSixDQUFVLHdDQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNQyxlQUFlQyxPQUFPQyxJQUFQLENBQVlMLEtBQUtNLFNBQUwsSUFBa0IsRUFBOUIsQ0FBckI7QUFDQSxRQUFJLENBQUNILFlBQUQsSUFBaUIsQ0FBQ0EsYUFBYUksTUFBbkMsRUFBMkM7QUFDdkMsZUFBTyxDQUFDUCxLQUFLQyxHQUFOLENBQVA7QUFDSDs7QUFFRCxRQUFNTyxPQUFPTCxhQUFhTSxHQUFiLENBQWlCO0FBQUEsZUFBT1QsS0FBS00sU0FBTCxDQUFlSSxHQUFmLEVBQW9CRCxHQUFwQixDQUF3QixvQkFBWTtBQUNyRSxnQkFBTUUsWUFBWVgsS0FBS0MsR0FBTCxDQUFTVyxPQUFULENBQWlCLElBQUlDLE1BQUosUUFBa0JILEdBQWxCLFNBQTZCLEdBQTdCLENBQWpCLEVBQW9ESSxRQUFw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RUFBRXlDLFVBQVUsT0FBWixFQUFoRSxDQUFSOztBQUVBNUUsb0JBQVFtQyxNQUFSO0FBQ0gsU0FSYSxDQUFSO0FBQUEsS0FEQyxDQUFQO0FBVUgsQ0FkRDs7QUFnQkE7QUFDQTs7QUFFQSxJQUFJLGVBQVEsWUFBS0EsTUFBakIsRUFBeUI7QUFDckJvQyxRQUFJLFlBQUtwQyxNQUFULEVBQWlCLFlBQUswQyxJQUF0QjtBQUNIO1FBQ1FOLEcsR0FBQUEsRztRQUFLMUUsTSxHQUFBQSxNO1FBQVF3QixNLEdBQUFBLE07O0FBRXRCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCB7IGlzVXJsLCBjb250YWlucywgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXQgYXMgY29uZmlnR2V0IH0gZnJvbSAnLi9jb25maWcuanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldHMgcXVlcmllZCB1cmxzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHthcnJheX1cbiAqL1xuY29uc3QgZ2V0UXVlcmllZFVybHMgPSAoZGF0YSkgPT4ge1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5zcmMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBpcyBuZWVkZWQgdG8gcXVlcnkgdXJsJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBzdHJpbmcgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleU1vZGlmaWVycyA9IE9iamVjdC5rZXlzKGRhdGEubW9kaWZpZXJzIHx8IFtdKTtcbiAgICBpZiAoIWtleU1vZGlmaWVycyB8fCAha2V5TW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW2RhdGEuc3JjXTtcbiAgICB9XG5cbiAgICBjb25zdCB1cmxzID0ga2V5TW9kaWZpZXJzLm1hcChrZXkgPT4gZGF0YS5tb2RpZmllcnNba2V5XS5tYXAobW9kaWZpZXIgPT4ge1xuICAgICAgICBjb25zdCBhY3R1YWxTcmMgPSBkYXRhLnNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKTtcbiAgICAgICAgcmV0dXJuIGFjdHVhbFNyYztcbiAgICB9KSkucmVkdWNlKChhLCBiKSA9PiBhLmNvbmNhdChiKSkuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG5cbiAgICByZXR1cm4gdXJscztcbn07XG5cbi8qKlxuICogR2V0cyB1cmwgbWFya3VwXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFVybCA9ICh1cmwpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVcmwgbmVlZHMgdG8gYmUgYSBzdHJpbmcnKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBkZWZhdWx0RW5jb2Rpbmc6ICd3aW5kb3dzLTEyNTInLFxuICAgICAgICBkZXRlY3RNZXRhQ2hhcnNldDogdHJ1ZSxcbiAgICAgICAgLy8gaGVhZGVyczogY29uZmlnLmhlYWRlcnMsXG4gICAgICAgIHBvb2w6IHtcbiAgICAgICAgICAgIG1heFNvY2tldHM6IDZcbiAgICAgICAgfSxcbiAgICAgICAgc3RyaWN0U1NMOiB0cnVlLFxuICAgICAgICAvLyBwcm94eTogY29uZmlnLnByb3h5LFxuICAgICAgICBjb29raWVKYXI6IG5ldyB0b3VnaENvb2tpZS5Db29raWVKYXIobnVsbCwgeyBsb29zZU1vZGU6IHRydWUgfSksXG4gICAgICAgIHVzZXJBZ2VudDogYE5vZGUuanMgKCR7cHJvY2Vzcy5wbGF0Zm9ybX07IFU7IHJ2OiR7cHJvY2Vzcy52ZXJzaW9ufSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbylgLFxuICAgICAgICAvLyBhZ2VudDogY29uZmlnLmFnZW50LFxuICAgICAgICAvLyBhZ2VudENsYXNzOiBjb25maWcuYWdlbnRDbGFzcyxcbiAgICAgICAgYWdlbnRPcHRpb25zOiB7XG4gICAgICAgICAgICBrZWVwQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBrZWVwQWxpdmVNc2VjczogMTE1ICogMTAwMFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEZpbmFsbHkgZG93bmxvYWQgaXQhXG4gICAgcmVzb3VyY2VMb2FkZXIuZG93bmxvYWQodXJsLCBvcHRpb25zLCAoZXJyLCByZXNwb25zZVRleHQpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShyZXNwb25zZVRleHQpO1xuICAgIH0pO1xufSk7XG5cbi8qKlxuICogR2V0cyBET00gZnJvbSB1cmxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtpbnR9IHRocm90dGxlXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0RG9tID0gKHNyYywgdHlwZSA9ICd1cmwnLCB0aHJvdHRsZSA9IDEwMDApID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNvdXJjZSBuZWVkcyB0byBiZSBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIC8vIE5lZWQgdG8gY2hlY2sgaWYgdXJsIGlzIG9rXG4gICAgaWYgKHR5cGUgPT09ICd1cmwnICYmICFpc1VybChzcmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IHRoZSB0aHJvdHRsZSBzbyBpdCBkb2Vzbid0IG1ha2UgdGhlIHJlcXVlc3QgYmVmb3JlXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIFByZXBhcmUgZm9yIHBvc3NpYmxlIGVycm9yc1xuICAgICAgICBjb25zdCB2aXJ0dWFsQ29uc29sZSA9IGpzZG9tLmNyZWF0ZVZpcnR1YWxDb25zb2xlKCk7XG4gICAgICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgICAgICBjb25zdCBsb2dzID0gW107XG4gICAgICAgIGNvbnN0IHdhcm5zID0gW107XG5cbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdlcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2xvZycsIGxvZyA9PiB7IGxvZ3MucHVzaChsb2cpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ3dhcm4nLCB3YXJuID0+IHsgd2FybnMucHVzaCh3YXJuKTsgfSk7XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAgICAgdmlydHVhbENvbnNvbGUsXG4gICAgICAgICAgICBzY3JpcHRzOiBbJ2h0dHA6Ly9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5Lm1pbi5qcyddLFxuICAgICAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgICAgICBGZXRjaEV4dGVybmFsUmVzb3VyY2VzOiBbJ3NjcmlwdCcsICdsaW5rJ10sXG4gICAgICAgICAgICAgICAgUHJvY2Vzc0V4dGVybmFsUmVzb3VyY2VzOiBbJ3NjcmlwdCddLFxuICAgICAgICAgICAgICAgIFNraXBFeHRlcm5hbFJlc291cmNlczogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb25lOiAoZXJyLCB3aW5kb3cpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7IHJldHVybiByZWplY3QoZXJyKTsgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoeyB3aW5kb3csIGVycm9ycywgbG9ncywgd2FybnMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gTm93IGZvciB0aGUgYWN0dWFsIGdldHRpbmdcbiAgICAgICAganNkb20uZW52KHNyYywgY29uZmlnKTtcbiAgICB9LCB0eXBlID09PSAndXJsJyA/IHRocm90dGxlIDogMSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBkYXRhXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXRyaWV2ZVxuICogQHBhcmFtIHtpbnR9IHRocm90dGxlXG4gKiBAcGFyYW0ge2ludH0gaVxuICogQHBhcmFtIHthcnJheX0gZGF0YUFyclxuICogQHJldHVybiB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0U2luZ2xlID0gKGRhdGEgPSBbXSwgdGhyb3R0bGUsIGkgPSAwLCBkYXRhQXJyID0gW10pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBuZWVkcyB0byBleGlzdCBhbmQgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTWF5YmUgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIHNvLi4uIGxldHMgaW5mb3JtXG4gICAgaWYgKCFkYXRhW2ldIHx8ICFkYXRhW2ldLnNyYykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGRhdGFBcnIpKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0IGFuZCBnZXQgYmFja1xuICAgIHJldHVybiBnZXREb20oZGF0YVtpXS5zcmMsICd1cmwnLCB0aHJvdHRsZSkudGhlbihzaW5nbGVEb20gPT4ge1xuICAgICAgICBjb25zdCAkID0gc2luZ2xlRG9tLndpbmRvdy4kO1xuICAgICAgICBjb25zdCByZXRyaWV2ZSA9IGRhdGFbaV0ucmV0cmlldmUgfHwge307XG4gICAgICAgIGNvbnN0IHJldHJpZXZlS2V5cyA9IE9iamVjdC5rZXlzKHJldHJpZXZlKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIC8vIExldHMgaXRlcmF0ZSB0aGUgcmV0cmlldmUgcmVxdWVzdHNcbiAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCByZXRyaWV2ZUtleXMubGVuZ3RoOyBjICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHJldHJpZXZlS2V5c1tjXTtcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSByZXRyaWV2ZVtrZXldLmF0dHJpYnV0ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgY29uc3QgZWxzID0gJC5maW5kKHJldHJpZXZlW2tleV0uc2VsZWN0b3IpO1xuICAgICAgICAgICAgY29uc3QgaWdub3JlID0gcmV0cmlldmVba2V5XS5pZ25vcmU7XG5cbiAgICAgICAgICAgIC8vIExldHMgZ28gcGVyIGVsZW1lbnQuLi5cbiAgICAgICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZWxzLmxlbmd0aDsgZCArPSAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbHNbZF07XG4gICAgICAgICAgICAgICAgY29uc3Qgc2luZ2xlID0gISFhdHRyID8gZWwuZ2V0QXR0cmlidXRlKGF0dHIpIDogZWwudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgICAgICAgICAhY29udGFpbnMoaWdub3JlLCBzaW5nbGUpICYmIHJlc3VsdC5wdXNoKHNpbmdsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExldHMgdGFrZSBjYXJlIG9mIGlnbm9yZSBhbmQgZmluYWxseWNhY2hlIGl0Li4uXG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWNoZSB1cmwgZGF0YVxuICAgICAgICBkYXRhQXJyLnB1c2goe1xuICAgICAgICAgICAgc3JjOiBkYXRhW2ldLnNyYyxcbiAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0c1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmV4dCBvbmUgaW4gdGhlIHByb21pc2VcbiAgICAgICAgY29uc3QgbmV4dCA9IGdldFNpbmdsZShkYXRhLCB0aHJvdHRsZSwgaSArPSAxLCBkYXRhQXJyKTtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdhdGhlciBkYXRhXG4gKlxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHRocm90dGxlXG4gKiBAcGFyYW0ge2ludH0gaVxuICogQHBhcmFtIHthcnJheX0gZGF0YVJlc3VsdFxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdhdGhlckRhdGEgPSAoZGF0YSA9IFtdLCB0aHJvdHRsZSwgaSA9IDAsIGRhdGFSZXN1bHQgPSBbXSkgPT4ge1xuICAgIGlmICghZGF0YVtpXSkge1xuICAgICAgICAvLyBNYXliZSB0aGVyZSBpcyBubyBtb3JlIGRhdGEgc28uLi4gbGV0cyBpbmZvcm1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShkYXRhUmVzdWx0KSk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhW2ldIHx8IHR5cGVvZiBkYXRhW2ldICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGRhdGEgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZGF0YVtpXS5zcmMgfHwgdHlwZW9mIGRhdGFbaV0uc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHNyYyBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIG1ha2UgdGhlIG5hbWUgcmlnaHRcbiAgICBkYXRhW2ldLm5hbWUgPSBkYXRhW2ldLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShkYXRhW2ldLnNyYyk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGV4cGVjdGVkIG9iamVjdFxuICAgIGNvbnN0IHVybHMgPSBnZXRRdWVyaWVkVXJscyhkYXRhW2ldKS5tYXAodXJsID0+ICh7XG4gICAgICAgIHNyYzogdXJsLCByZXRyaWV2ZTogZGF0YVtpXS5yZXRyaWV2ZVxuICAgIH0pKTtcblxuICAgIC8vIE1ha2UgdGhlIHNpbmdsZSByZXF1ZXN0XG4gICAgcmV0dXJuIGdldFNpbmdsZSh1cmxzLCB0aHJvdHRsZSlcbiAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAvLyBDYWNoZSB0aGUgcmVzdWx0XG4gICAgICAgIGRhdGFbaV0ucmVzdWx0ID0gcmVzdWx0O1xuXG4gICAgICAgIC8vIENhY2hlIGRhdGFcbiAgICAgICAgZGF0YVJlc3VsdC5wdXNoKGRhdGFbaV0pO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXh0IG9uZSBpbiB0aGUgcHJvbWlzZVxuICAgICAgICBjb25zdCBuZXh0ID0gZ2F0aGVyRGF0YShkYXRhLCB0aHJvdHRsZSwgaSArPSAxLCBkYXRhUmVzdWx0KTtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgc2NyYXBlclxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgcnVuID0gKGNvbmZpZywgZmlsZSkgPT4ge1xuICAgIGNvbmZpZyA9IGNvbmZpZ0dldChjb25maWcpO1xuXG4gICAgLy8gTGV0cyBnYXRoZXIgZGF0YSBmcm9tIHRoZSBzcmNcbiAgICByZXR1cm4gZ2F0aGVyRGF0YShjb25maWcuZGF0YSwgY29uZmlnLnRocm90dGxlKVxuICAgIC50aGVuKGRhdGEgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICBjb25maWcucmVzdWx0ID0gZGF0YTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBmaWxlXG4gICAgICAgIGZpbGUgJiYgZnMud3JpdGVGaWxlU3luYyhnZXRQd2QoZmlsZSksIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgNCksIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG5cbiAgICAgICAgcmVzb2x2ZShjb25maWcpO1xuICAgIH0pKTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5pZiAoYXJndiAmJiBhcmd2LmNvbmZpZykge1xuICAgIHJ1bihhcmd2LmNvbmZpZywgYXJndi5zYXZlKTtcbn1cbmV4cG9ydCB7IHJ1biwgZ2V0VXJsLCBnZXREb20gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2F0aGVyRGF0YSwgZ2V0U2luZ2xlLCBnZXREb20sIGdldFVybCwgZ2V0UXVlcmllZFVybHMgfTtcbiJdfQ==