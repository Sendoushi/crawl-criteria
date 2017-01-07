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

var _flattenDeep = require('lodash/flattenDeep.js');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

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

    // TODO: What about modifiers combinations?

    var keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    var urls = keyModifiers.map(function (key) {
        return data.modifiers[key].map(function (modifier) {
            var actualSrcs = [];

            if ((typeof modifier === 'undefined' ? 'undefined' : _typeof(modifier)) === 'object') {
                var min = modifier.min || 0;
                var max = modifier.max || 10;

                for (var i = min; i < max + 1; i += 1) {
                    actualSrcs.push(data.src.replace(new RegExp('{{' + key + '}}', 'g'), i));
                }
            } else {
                // Now for the general rule string
                actualSrcs.push(data.src.replace(new RegExp('{{' + key + '}}', 'g'), modifier));
            }

            return actualSrcs;
        });
    }).filter(function (val) {
        return !!val;
    });

    return (0, _flattenDeep2.default)(urls);
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
        var els = parentEl.find(req.selector);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJsZW5ndGgiLCJ1cmxzIiwibWFwIiwia2V5IiwiYWN0dWFsU3JjcyIsIm1vZGlmaWVyIiwibWluIiwibWF4IiwiaSIsInB1c2giLCJyZXBsYWNlIiwiUmVnRXhwIiwiZmlsdGVyIiwidmFsIiwiZ2V0VXJsIiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvcHRpb25zIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInZlcnNpb24iLCJhZ2VudE9wdGlvbnMiLCJrZWVwQWxpdmUiLCJrZWVwQWxpdmVNc2VjcyIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwic2V0VGltZW91dCIsInZpcnR1YWxDb25zb2xlIiwiY3JlYXRlVmlydHVhbENvbnNvbGUiLCJlcnJvcnMiLCJsb2dzIiwid2FybnMiLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwiZW52IiwiZ2V0U2NyYXAiLCIkIiwicGFyZW50RWwiLCJmaW5kIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsInNlbGVjdG9yIiwibmVzdGVkIiwiYXR0ciIsImF0dHJpYnV0ZSIsImlnbm9yZSIsInJlc3VsdCIsImQiLCJlbCIsInNpbmdsZSIsImdldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiZ2V0U2luZ2xlIiwiZGF0YUFyciIsInRoZW4iLCJzaW5nbGVEb20iLCJuZXh0IiwiZ2F0aGVyRGF0YSIsImRhdGFSZXN1bHQiLCJuYW1lIiwiYmFzZW5hbWUiLCJydW4iLCJmaWxlIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlbmNvZGluZyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGlCQUFpQixTQUFqQkEsY0FBaUIsQ0FBQ0MsSUFBRCxFQUFVO0FBQzdCLFFBQUksQ0FBQ0EsSUFBRCxJQUFTLENBQUNBLEtBQUtDLEdBQW5CLEVBQXdCO0FBQ3BCLGNBQU0sSUFBSUMsS0FBSixDQUFVLGlDQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLE9BQU9GLEtBQUtDLEdBQVosS0FBb0IsUUFBeEIsRUFBa0M7QUFDOUIsY0FBTSxJQUFJQyxLQUFKLENBQVUsd0NBQVYsQ0FBTjtBQUNIOztBQUVEOztBQUVBLFFBQU1DLGVBQWVDLE9BQU9DLElBQVAsQ0FBWUwsS0FBS00sU0FBTCxJQUFrQixFQUE5QixDQUFyQjtBQUNBLFFBQUksQ0FBQ0gsWUFBRCxJQUFpQixDQUFDQSxhQUFhSSxNQUFuQyxFQUEyQztBQUN2QyxlQUFPLENBQUNQLEtBQUtDLEdBQU4sQ0FBUDtBQUNIOztBQUVELFFBQU1PLE9BQU9MLGFBQWFNLEdBQWIsQ0FBaUI7QUFBQSxlQUFPVCxLQUFLTSxTQUFMLENBQWVJLEdBQWYsRUFBb0JELEdBQXBCLENBQXdCLG9CQUFZO0FBQ3JFLGdCQUFNRSxhQUFhLEVBQW5COztBQUVBLGdCQUFJLFFBQU9DLFFBQVAseUNBQU9BLFFBQVAsT0FBb0IsUUFBeEIsRUFBa0M7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RUE5RSxvQkFBUWtDLE1BQVI7QUFDSCxTQVJhLENBQVI7QUFBQSxLQURDLENBQVA7QUFVSCxDQWREOztBQWdCQTtBQUNBOztRQUVTdUMsRyxHQUFBQSxHO1FBQUs1RSxNLEdBQUFBLE07UUFBUXdCLE0sR0FBQUEsTTs7QUFFdEIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQganNkb20gZnJvbSAnanNkb20nO1xuaW1wb3J0IHJlc291cmNlTG9hZGVyIGZyb20gJ2pzZG9tL2xpYi9qc2RvbS9icm93c2VyL3Jlc291cmNlLWxvYWRlcic7XG5pbXBvcnQgdG91Z2hDb29raWUgZnJvbSAndG91Z2gtY29va2llJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2gvZmxhdHRlbkRlZXAuanMnO1xuaW1wb3J0IHsgaXNVcmwsIGNvbnRhaW5zLCBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldCBhcyBjb25maWdHZXQgfSBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0cyBxdWVyaWVkIHVybHNcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge2FycmF5fVxuICovXG5jb25zdCBnZXRRdWVyaWVkVXJscyA9IChkYXRhKSA9PiB7XG4gICAgaWYgKCFkYXRhIHx8ICFkYXRhLnNyYykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEuc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIHN0cmluZyBpcyBuZWVkZWQgdG8gcXVlcnkgdXJsJyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogV2hhdCBhYm91dCBtb2RpZmllcnMgY29tYmluYXRpb25zP1xuXG4gICAgY29uc3Qga2V5TW9kaWZpZXJzID0gT2JqZWN0LmtleXMoZGF0YS5tb2RpZmllcnMgfHwgW10pO1xuICAgIGlmICgha2V5TW9kaWZpZXJzIHx8ICFrZXlNb2RpZmllcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBbZGF0YS5zcmNdO1xuICAgIH1cblxuICAgIGNvbnN0IHVybHMgPSBrZXlNb2RpZmllcnMubWFwKGtleSA9PiBkYXRhLm1vZGlmaWVyc1trZXldLm1hcChtb2RpZmllciA9PiB7XG4gICAgICAgIGNvbnN0IGFjdHVhbFNyY3MgPSBbXTtcblxuICAgICAgICBpZiAodHlwZW9mIG1vZGlmaWVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY29uc3QgbWluID0gbW9kaWZpZXIubWluIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBtYXggPSBtb2RpZmllci5tYXggfHwgMTA7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtaW47IGkgPCBtYXggKyAxOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBhY3R1YWxTcmNzLnB1c2goZGF0YS5zcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBOb3cgZm9yIHRoZSBnZW5lcmFsIHJ1bGUgc3RyaW5nXG4gICAgICAgICAgICBhY3R1YWxTcmNzLnB1c2goZGF0YS5zcmMucmVwbGFjZShuZXcgUmVnRXhwKGBcXHtcXHske2tleX1cXH1cXH1gLCAnZycpLCBtb2RpZmllcikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFjdHVhbFNyY3M7XG4gICAgfSkpXG4gICAgLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuXG4gICAgcmV0dXJuIGZsYXR0ZW5EZWVwKHVybHMpO1xufTtcblxuLyoqXG4gKiBHZXRzIHVybCBtYXJrdXBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2V0VXJsID0gKHVybCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VybCBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGRlZmF1bHRFbmNvZGluZzogJ3dpbmRvd3MtMTI1MicsXG4gICAgICAgIGRldGVjdE1ldGFDaGFyc2V0OiB0cnVlLFxuICAgICAgICAvLyBoZWFkZXJzOiBjb25maWcuaGVhZGVycyxcbiAgICAgICAgcG9vbDoge1xuICAgICAgICAgICAgbWF4U29ja2V0czogNlxuICAgICAgICB9LFxuICAgICAgICBzdHJpY3RTU0w6IHRydWUsXG4gICAgICAgIC8vIHByb3h5OiBjb25maWcucHJveHksXG4gICAgICAgIGNvb2tpZUphcjogbmV3IHRvdWdoQ29va2llLkNvb2tpZUphcihudWxsLCB7IGxvb3NlTW9kZTogdHJ1ZSB9KSxcbiAgICAgICAgdXNlckFnZW50OiBgTm9kZS5qcyAoJHtwcm9jZXNzLnBsYXRmb3JtfTsgVTsgcnY6JHtwcm9jZXNzLnZlcnNpb259KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKWAsXG4gICAgICAgIC8vIGFnZW50OiBjb25maWcuYWdlbnQsXG4gICAgICAgIC8vIGFnZW50Q2xhc3M6IGNvbmZpZy5hZ2VudENsYXNzLFxuICAgICAgICBhZ2VudE9wdGlvbnM6IHtcbiAgICAgICAgICAgIGtlZXBBbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGtlZXBBbGl2ZU1zZWNzOiAxMTUgKiAxMDAwXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRmluYWxseSBkb3dubG9hZCBpdCFcbiAgICByZXNvdXJjZUxvYWRlci5kb3dubG9hZCh1cmwsIG9wdGlvbnMsIChlcnIsIHJlc3BvbnNlVGV4dCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG59KTtcblxuLyoqXG4gKiBHZXRzIERPTSBmcm9tIHVybFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge2ludH0gdGhyb3R0bGVcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXREb20gPSAoc3JjLCB0eXBlID0gJ3VybCcsIHRocm90dGxlID0gMTAwMCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc291cmNlIG5lZWRzIHRvIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgLy8gTmVlZCB0byBjaGVjayBpZiB1cmwgaXMgb2tcbiAgICBpZiAodHlwZSA9PT0gJ3VybCcgJiYgIWlzVXJsKHNyYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3VyY2Ugbm90IHZhbGlkJyk7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgdGhlIHRocm90dGxlIHNvIGl0IGRvZXNuJ3QgbWFrZSB0aGUgcmVxdWVzdCBiZWZvcmVcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gUHJlcGFyZSBmb3IgcG9zc2libGUgZXJyb3JzXG4gICAgICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlID0ganNkb20uY3JlYXRlVmlydHVhbENvbnNvbGUoKTtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybnMgPSBbXTtcblxuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGVycm9yID0+IHsgZXJyb3JzLnB1c2goZXJyb3IpOyB9KTtcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignbG9nJywgbG9nID0+IHsgbG9ncy5wdXNoKGxvZyk7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignd2FybicsIHdhcm4gPT4geyB3YXJucy5wdXNoKHdhcm4pOyB9KTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZSxcbiAgICAgICAgICAgIHNjcmlwdHM6IFsnaHR0cDovL2NvZGUuanF1ZXJ5LmNvbS9qcXVlcnkubWluLmpzJ10sXG4gICAgICAgICAgICBmZWF0dXJlczoge1xuICAgICAgICAgICAgICAgIEZldGNoRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0JywgJ2xpbmsnXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0J10sXG4gICAgICAgICAgICAgICAgU2tpcEV4dGVybmFsUmVzb3VyY2VzOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbmU6IChlcnIsIHdpbmRvdykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIHJlamVjdChlcnIpOyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHdpbmRvdywgZXJyb3JzLCBsb2dzLCB3YXJucyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBOb3cgZm9yIHRoZSBhY3R1YWwgZ2V0dGluZ1xuICAgICAgICBqc2RvbS5lbnYoc3JjLCBjb25maWcpO1xuICAgIH0sIHR5cGUgPT09ICd1cmwnID8gdGhyb3R0bGUgOiAxKTtcbn0pO1xuXG4vKipcbiAqIEdldHMgc2NyYXAgZnJvbSBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtlbGVtZW50fSBwYXJlbnRFbFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldFNjcmFwID0gKCQsIHBhcmVudEVsLCBkYXRhID0ge30pID0+IHtcbiAgICBpZiAoIXBhcmVudEVsIHx8ICFwYXJlbnRFbC5maW5kKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBjb21wbGlhbnQgcGFyZW50IGVsZW1lbnQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXRyaWV2ZSA9IGRhdGEucmV0cmlldmUgfHwge307XG4gICAgY29uc3QgcmV0cmlldmVLZXlzID0gT2JqZWN0LmtleXMocmV0cmlldmUpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSB7fTtcblxuICAgIC8vIExldHMgaXRlcmF0ZSB0aGUgcmV0cmlldmUgcmVxdWVzdHNcbiAgICBmb3IgKGxldCBjID0gMDsgYyA8IHJldHJpZXZlS2V5cy5sZW5ndGg7IGMgKz0gMSkge1xuICAgICAgICBjb25zdCBrZXkgPSByZXRyaWV2ZUtleXNbY107XG4gICAgICAgIGNvbnN0IHJlcSA9IHJldHJpZXZlW2tleV07XG4gICAgICAgIGNvbnN0IGVscyA9IHBhcmVudEVsLmZpbmQocmVxLnNlbGVjdG9yKTtcbiAgICAgICAgY29uc3QgbmVzdGVkID0gcmVxLnJldHJpZXZlO1xuICAgICAgICBjb25zdCBhdHRyID0gcmVxLmF0dHJpYnV0ZTtcbiAgICAgICAgY29uc3QgaWdub3JlID0gcmVxLmlnbm9yZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG5cbiAgICAgICAgLy8gTGV0cyBnbyBwZXIgZWxlbWVudC4uLlxuICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8IGVscy5sZW5ndGg7IGQgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBlbHNbZF07XG4gICAgICAgICAgICBsZXQgc2luZ2xlO1xuXG4gICAgICAgICAgICBpZiAobmVzdGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkIHx8ICEkLmZpbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCAkIGlzIG5lZWRlZCB0byBnZXQgdGhlIHNjcmFwIG9mIG5lc3RlZCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZm9yIHRoZSBjb250ZW50IGlmIGl0IGdvdHMgbmVzdGVkXG4gICAgICAgICAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5lc3RlZCB0aGVuXG4gICAgICAgICAgICAgICAgc2luZ2xlID0gZ2V0U2NyYXAoJCwgJChlbCksIHJlcSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gbmVzdGVkLCBnZXQgY29udGVudCFcbiAgICAgICAgICAgICAgICBzaW5nbGUgPSAhIWF0dHIgPyBlbC5nZXRBdHRyaWJ1dGUoYXR0cikgOiBlbC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgICAgICAhY29udGFpbnMoaWdub3JlLCBzaW5nbGUpICYmIHJlc3VsdC5wdXNoKHNpbmdsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXRzIHRha2UgY2FyZSBvZiBpZ25vcmUgYW5kIGZpbmFsbHljYWNoZSBpdC4uLlxuICAgICAgICByZXN1bHRzW2tleV0gPSByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIEdldHMgc2luZ2xlIGRhdGFcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHBhcmFtIHtvYmplY3R9IHJldHJpZXZlXG4gKiBAcGFyYW0ge2ludH0gdGhyb3R0bGVcbiAqIEBwYXJhbSB7aW50fSBpXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhQXJyXG4gKiBAcmV0dXJuIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRTaW5nbGUgPSAoZGF0YSA9IFtdLCB0aHJvdHRsZSwgaSA9IDAsIGRhdGFBcnIgPSBbXSkgPT4ge1xuICAgIGlmICghaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEYXRhIG5lZWRzIHRvIGV4aXN0IGFuZCBiZSBhbiBhcnJheScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBNYXliZSB0aGVyZSBpcyBubyBtb3JlIGRhdGEgc28uLi4gbGV0cyBpbmZvcm1cbiAgICBpZiAoIWRhdGFbaV0gfHwgIWRhdGFbaV0uc3JjKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoZGF0YUFycikpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgdGhlIHJlcXVlc3QgYW5kIGdldCBiYWNrXG4gICAgcmV0dXJuIGdldERvbShkYXRhW2ldLnNyYywgJ3VybCcsIHRocm90dGxlKS50aGVuKHNpbmdsZURvbSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gc2luZ2xlRG9tLndpbmRvdy4kO1xuXG4gICAgICAgIC8vIENhY2hlIHVybCBkYXRhXG4gICAgICAgIGRhdGFBcnIucHVzaCh7XG4gICAgICAgICAgICBzcmM6IGRhdGFbaV0uc3JjLFxuICAgICAgICAgICAgcmVzdWx0OiBnZXRTY3JhcChlbCwgZWwsIGRhdGFbaV0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIExldHMgZ2V0IHRoZSBuZXh0IG9uZSBpbiB0aGUgcHJvbWlzZVxuICAgICAgICBjb25zdCBuZXh0ID0gZ2V0U2luZ2xlKGRhdGEsIHRocm90dGxlLCBpICs9IDEsIGRhdGFBcnIpO1xuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2F0aGVyIGRhdGFcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gdGhyb3R0bGVcbiAqIEBwYXJhbSB7aW50fSBpXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhUmVzdWx0XG4gKiBAcmV0dXJucyB7cHJvbWlzZX1cbiAqL1xuY29uc3QgZ2F0aGVyRGF0YSA9IChkYXRhID0gW10sIHRocm90dGxlLCBpID0gMCwgZGF0YVJlc3VsdCA9IFtdKSA9PiB7XG4gICAgaWYgKCFkYXRhW2ldKSB7XG4gICAgICAgIC8vIE1heWJlIHRoZXJlIGlzIG5vIG1vcmUgZGF0YSBzby4uLiBsZXRzIGluZm9ybVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlKGRhdGFSZXN1bHQpKTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFbaV0gfHwgdHlwZW9mIGRhdGFbaV0gIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgZGF0YSBvYmplY3QgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhW2ldLnNyYyB8fCB0eXBlb2YgZGF0YVtpXS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Egc3JjIGlzIHJlcXVpcmVkIHRvIGdldCB0aGUgdXJsJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIExldHMgbWFrZSB0aGUgbmFtZSByaWdodFxuICAgIGRhdGFbaV0ubmFtZSA9IGRhdGFbaV0ubmFtZSB8fCBwYXRoLmJhc2VuYW1lKGRhdGFbaV0uc3JjKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgZXhwZWN0ZWQgb2JqZWN0XG4gICAgY29uc3QgdXJscyA9IGdldFF1ZXJpZWRVcmxzKGRhdGFbaV0pLm1hcCh1cmwgPT4gKHtcbiAgICAgICAgc3JjOiB1cmwsIHJldHJpZXZlOiBkYXRhW2ldLnJldHJpZXZlXG4gICAgfSkpO1xuXG4gICAgLy8gTWFrZSB0aGUgc2luZ2xlIHJlcXVlc3RcbiAgICByZXR1cm4gZ2V0U2luZ2xlKHVybHMsIHRocm90dGxlKVxuICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIC8vIENhY2hlIHRoZSByZXN1bHRcbiAgICAgICAgZGF0YVtpXS5yZXN1bHQgPSByZXN1bHQ7XG5cbiAgICAgICAgLy8gQ2FjaGUgZGF0YVxuICAgICAgICBkYXRhUmVzdWx0LnB1c2goZGF0YVtpXSk7XG5cbiAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5leHQgb25lIGluIHRoZSBwcm9taXNlXG4gICAgICAgIGNvbnN0IG5leHQgPSBnYXRoZXJEYXRhKGRhdGEsIHRocm90dGxlLCBpICs9IDEsIGRhdGFSZXN1bHQpO1xuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBzY3JhcGVyXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBydW4gPSAoY29uZmlnLCBmaWxlKSA9PiB7XG4gICAgY29uZmlnID0gY29uZmlnR2V0KGNvbmZpZyk7XG5cbiAgICAvLyBMZXRzIGdhdGhlciBkYXRhIGZyb20gdGhlIHNyY1xuICAgIHJldHVybiBnYXRoZXJEYXRhKGNvbmZpZy5kYXRhLCBjb25maWcudGhyb3R0bGUpXG4gICAgLnRoZW4oZGF0YSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyBDYWNoZSB0aGUgcmVzdWx0XG4gICAgICAgIGNvbmZpZy5yZXN1bHQgPSBkYXRhO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGZpbGVcbiAgICAgICAgZmlsZSAmJiBmcy53cml0ZUZpbGVTeW5jKGdldFB3ZChmaWxlKSwgSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCA0KSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcblxuICAgICAgICByZXNvbHZlKGNvbmZpZyk7XG4gICAgfSkpO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IHJ1biwgZ2V0VXJsLCBnZXREb20gfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IHJ1biwgZ2F0aGVyRGF0YSwgZ2V0U2luZ2xlLCBnZXREb20sIGdldFNjcmFwLCBnZXRVcmwsIGdldFF1ZXJpZWRVcmxzIH07XG4iXX0=