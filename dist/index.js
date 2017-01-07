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

if (_yargs.argv && _yargs.argv.config) {
    run(_yargs.argv.config, _yargs.argv.save);
}
exports.run = run;
exports.getUrl = getUrl;
exports.getDom = getDom;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRRdWVyaWVkVXJscyIsImRhdGEiLCJzcmMiLCJFcnJvciIsImtleU1vZGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJtb2RpZmllcnMiLCJsZW5ndGgiLCJ1cmxzIiwibWFwIiwia2V5IiwiYWN0dWFsU3JjcyIsIm1vZGlmaWVyIiwibWluIiwibWF4IiwiaSIsInB1c2giLCJyZXBsYWNlIiwiUmVnRXhwIiwiZmlsdGVyIiwidmFsIiwiZ2V0VXJsIiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvcHRpb25zIiwiZGVmYXVsdEVuY29kaW5nIiwiZGV0ZWN0TWV0YUNoYXJzZXQiLCJwb29sIiwibWF4U29ja2V0cyIsInN0cmljdFNTTCIsImNvb2tpZUphciIsIkNvb2tpZUphciIsImxvb3NlTW9kZSIsInVzZXJBZ2VudCIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsInZlcnNpb24iLCJhZ2VudE9wdGlvbnMiLCJrZWVwQWxpdmUiLCJrZWVwQWxpdmVNc2VjcyIsImRvd25sb2FkIiwiZXJyIiwicmVzcG9uc2VUZXh0IiwiZ2V0RG9tIiwidHlwZSIsInRocm90dGxlIiwic2V0VGltZW91dCIsInZpcnR1YWxDb25zb2xlIiwiY3JlYXRlVmlydHVhbENvbnNvbGUiLCJlcnJvcnMiLCJsb2dzIiwid2FybnMiLCJvbiIsImVycm9yIiwibG9nIiwid2FybiIsImNvbmZpZyIsInNjcmlwdHMiLCJmZWF0dXJlcyIsIkZldGNoRXh0ZXJuYWxSZXNvdXJjZXMiLCJQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXMiLCJTa2lwRXh0ZXJuYWxSZXNvdXJjZXMiLCJkb25lIiwid2luZG93IiwiZW52IiwiZ2V0U2NyYXAiLCIkIiwicGFyZW50RWwiLCJmaW5kIiwicmV0cmlldmUiLCJyZXRyaWV2ZUtleXMiLCJyZXN1bHRzIiwiYyIsInJlcSIsImVscyIsInNlbGVjdG9yIiwibmVzdGVkIiwiYXR0ciIsImF0dHJpYnV0ZSIsImlnbm9yZSIsInJlc3VsdCIsImQiLCJlbCIsInNpbmdsZSIsImdldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiZ2V0U2luZ2xlIiwiZGF0YUFyciIsInRoZW4iLCJzaW5nbGVEb20iLCJuZXh0IiwiZ2F0aGVyRGF0YSIsImRhdGFSZXN1bHQiLCJuYW1lIiwiYmFzZW5hbWUiLCJydW4iLCJmaWxlIiwid3JpdGVGaWxlU3luYyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsInNhdmUiXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7OztBQU1BLElBQU1BLGlCQUFpQixTQUFqQkEsY0FBaUIsQ0FBQ0MsSUFBRCxFQUFVO0FBQzdCLFFBQUksQ0FBQ0EsSUFBRCxJQUFTLENBQUNBLEtBQUtDLEdBQW5CLEVBQXdCO0FBQ3BCLGNBQU0sSUFBSUMsS0FBSixDQUFVLGlDQUFWLENBQU47QUFDSDs7QUFFRCxRQUFJLE9BQU9GLEtBQUtDLEdBQVosS0FBb0IsUUFBeEIsRUFBa0M7QUFDOUIsY0FBTSxJQUFJQyxLQUFKLENBQVUsd0NBQVYsQ0FBTjtBQUNIOztBQUVEOztBQUVBLFFBQU1DLGVBQWVDLE9BQU9DLElBQVAsQ0FBWUwsS0FBS00sU0FBTCxJQUFrQixFQUE5QixDQUFyQjtBQUNBLFFBQUksQ0FBQ0gsWUFBRCxJQUFpQixDQUFDQSxhQUFhSSxNQUFuQyxFQUEyQztBQUN2QyxlQUFPLENBQUNQLEtBQUtDLEdBQU4sQ0FBUDtBQUNIOztBQUVELFFBQU1PLE9BQU9MLGFBQWFNLEdBQWIsQ0FBaUI7QUFBQSxlQUFPVCxLQUFLTSxTQUFMLENBQWVJLEdBQWYsRUFBb0JELEdBQXBCLENBQXdCLG9CQUFZO0FBQ3JFLGdCQUFNRSxhQUFhLEVBQW5COztBQUVBLGdCQUFJLFFBQU9DLFFBQVAseUNBQU9BLFFBQVAsT0FB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LEVBQWhFLENBQVI7O0FBRUE5RSxvQkFBUWtDLE1BQVI7QUFDSCxTQVJhLENBQVI7QUFBQSxLQURDLENBQVA7QUFVSCxDQWREOztBQWdCQTtBQUNBOztBQUVBLElBQUksZUFBUSxZQUFLQSxNQUFqQixFQUF5QjtBQUNyQnVDLFFBQUksWUFBS3ZDLE1BQVQsRUFBaUIsWUFBSzZDLElBQXRCO0FBQ0g7UUFDUU4sRyxHQUFBQSxHO1FBQUs1RSxNLEdBQUFBLE07UUFBUXdCLE0sR0FBQUEsTTs7QUFFdEIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgYXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCBqc2RvbSBmcm9tICdqc2RvbSc7XG5pbXBvcnQgcmVzb3VyY2VMb2FkZXIgZnJvbSAnanNkb20vbGliL2pzZG9tL2Jyb3dzZXIvcmVzb3VyY2UtbG9hZGVyJztcbmltcG9ydCB0b3VnaENvb2tpZSBmcm9tICd0b3VnaC1jb29raWUnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuaW1wb3J0IGZsYXR0ZW5EZWVwIGZyb20gJ2xvZGFzaC9mbGF0dGVuRGVlcC5qcyc7XG5pbXBvcnQgeyBpc1VybCwgY29udGFpbnMsIGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0IGFzIGNvbmZpZ0dldCB9IGZyb20gJy4vY29uZmlnLmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXRzIHF1ZXJpZWQgdXJsc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJucyB7YXJyYXl9XG4gKi9cbmNvbnN0IGdldFF1ZXJpZWRVcmxzID0gKGRhdGEpID0+IHtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEuc3JjKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgaXMgbmVlZGVkIHRvIHF1ZXJ5IHVybCcpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YS5zcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2Ugc3RyaW5nIGlzIG5lZWRlZCB0byBxdWVyeSB1cmwnKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXaGF0IGFib3V0IG1vZGlmaWVycyBjb21iaW5hdGlvbnM/XG5cbiAgICBjb25zdCBrZXlNb2RpZmllcnMgPSBPYmplY3Qua2V5cyhkYXRhLm1vZGlmaWVycyB8fCBbXSk7XG4gICAgaWYgKCFrZXlNb2RpZmllcnMgfHwgIWtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtkYXRhLnNyY107XG4gICAgfVxuXG4gICAgY29uc3QgdXJscyA9IGtleU1vZGlmaWVycy5tYXAoa2V5ID0+IGRhdGEubW9kaWZpZXJzW2tleV0ubWFwKG1vZGlmaWVyID0+IHtcbiAgICAgICAgY29uc3QgYWN0dWFsU3JjcyA9IFtdO1xuXG4gICAgICAgIGlmICh0eXBlb2YgbW9kaWZpZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtaW4gPSBtb2RpZmllci5taW4gfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IG1heCA9IG1vZGlmaWVyLm1heCB8fCAxMDtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG1pbjsgaSA8IG1heCArIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChkYXRhLnNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE5vdyBmb3IgdGhlIGdlbmVyYWwgcnVsZSBzdHJpbmdcbiAgICAgICAgICAgIGFjdHVhbFNyY3MucHVzaChkYXRhLnNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoYFxce1xceyR7a2V5fVxcfVxcfWAsICdnJyksIG1vZGlmaWVyKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWN0dWFsU3JjcztcbiAgICB9KSlcbiAgICAuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG5cbiAgICByZXR1cm4gZmxhdHRlbkRlZXAodXJscyk7XG59O1xuXG4vKipcbiAqIEdldHMgdXJsIG1hcmt1cFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnZXRVcmwgPSAodXJsKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVXJsIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGVmYXVsdEVuY29kaW5nOiAnd2luZG93cy0xMjUyJyxcbiAgICAgICAgZGV0ZWN0TWV0YUNoYXJzZXQ6IHRydWUsXG4gICAgICAgIC8vIGhlYWRlcnM6IGNvbmZpZy5oZWFkZXJzLFxuICAgICAgICBwb29sOiB7XG4gICAgICAgICAgICBtYXhTb2NrZXRzOiA2XG4gICAgICAgIH0sXG4gICAgICAgIHN0cmljdFNTTDogdHJ1ZSxcbiAgICAgICAgLy8gcHJveHk6IGNvbmZpZy5wcm94eSxcbiAgICAgICAgY29va2llSmFyOiBuZXcgdG91Z2hDb29raWUuQ29va2llSmFyKG51bGwsIHsgbG9vc2VNb2RlOiB0cnVlIH0pLFxuICAgICAgICB1c2VyQWdlbnQ6IGBOb2RlLmpzICgke3Byb2Nlc3MucGxhdGZvcm19OyBVOyBydjoke3Byb2Nlc3MudmVyc2lvbn0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pYCxcbiAgICAgICAgLy8gYWdlbnQ6IGNvbmZpZy5hZ2VudCxcbiAgICAgICAgLy8gYWdlbnRDbGFzczogY29uZmlnLmFnZW50Q2xhc3MsXG4gICAgICAgIGFnZW50T3B0aW9uczoge1xuICAgICAgICAgICAga2VlcEFsaXZlOiB0cnVlLFxuICAgICAgICAgICAga2VlcEFsaXZlTXNlY3M6IDExNSAqIDEwMDBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBGaW5hbGx5IGRvd25sb2FkIGl0IVxuICAgIHJlc291cmNlTG9hZGVyLmRvd25sb2FkKHVybCwgb3B0aW9ucywgKGVyciwgcmVzcG9uc2VUZXh0KSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUocmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIEdldHMgRE9NIGZyb20gdXJsXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldERvbSA9IChzcmMsIHR5cGUgPSAndXJsJywgdGhyb3R0bGUgPSAxMDAwKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzb3VyY2UgbmVlZHMgdG8gYmUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkIHRvIGNoZWNrIGlmIHVybCBpcyBva1xuICAgIGlmICh0eXBlID09PSAndXJsJyAmJiAhaXNVcmwoc3JjKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBub3QgdmFsaWQnKTtcbiAgICB9XG5cbiAgICAvLyBGaXJzdCB0aGUgdGhyb3R0bGUgc28gaXQgZG9lc24ndCBtYWtlIHRoZSByZXF1ZXN0IGJlZm9yZVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyBQcmVwYXJlIGZvciBwb3NzaWJsZSBlcnJvcnNcbiAgICAgICAgY29uc3QgdmlydHVhbENvbnNvbGUgPSBqc2RvbS5jcmVhdGVWaXJ0dWFsQ29uc29sZSgpO1xuICAgICAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBjb25zdCB3YXJucyA9IFtdO1xuXG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZXJyb3IgPT4geyBlcnJvcnMucHVzaChlcnJvcik7IH0pO1xuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCBlcnJvciA9PiB7IGVycm9ycy5wdXNoKGVycm9yKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCdsb2cnLCBsb2cgPT4geyBsb2dzLnB1c2gobG9nKTsgfSk7XG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKCd3YXJuJywgd2FybiA9PiB7IHdhcm5zLnB1c2god2Fybik7IH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlLFxuICAgICAgICAgICAgc2NyaXB0czogWydodHRwOi8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS5taW4uanMnXSxcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnLCAnbGluayddLFxuICAgICAgICAgICAgICAgIFByb2Nlc3NFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnXSxcbiAgICAgICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogKGVyciwgd2luZG93KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgeyByZXR1cm4gcmVqZWN0KGVycik7IH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgd2luZG93LCBlcnJvcnMsIGxvZ3MsIHdhcm5zIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE5vdyBmb3IgdGhlIGFjdHVhbCBnZXR0aW5nXG4gICAgICAgIGpzZG9tLmVudihzcmMsIGNvbmZpZyk7XG4gICAgfSwgdHlwZSA9PT0gJ3VybCcgPyB0aHJvdHRsZSA6IDEpO1xufSk7XG5cbi8qKlxuICogR2V0cyBzY3JhcCBmcm9tIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge2VsZW1lbnR9IHBhcmVudEVsXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHJldHVybnMge29iamVjdH1cbiAqL1xuY29uc3QgZ2V0U2NyYXAgPSAoJCwgcGFyZW50RWwsIGRhdGEgPSB7fSkgPT4ge1xuICAgIGlmICghcGFyZW50RWwgfHwgIXBhcmVudEVsLmZpbmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIGNvbXBsaWFudCBwYXJlbnQgZWxlbWVudCBpcyBuZWVkZWQgdG8gZ2V0IHRoZSBzY3JhcCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHJldHJpZXZlID0gZGF0YS5yZXRyaWV2ZSB8fCB7fTtcbiAgICBjb25zdCByZXRyaWV2ZUtleXMgPSBPYmplY3Qua2V5cyhyZXRyaWV2ZSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuXG4gICAgLy8gTGV0cyBpdGVyYXRlIHRoZSByZXRyaWV2ZSByZXF1ZXN0c1xuICAgIGZvciAobGV0IGMgPSAwOyBjIDwgcmV0cmlldmVLZXlzLmxlbmd0aDsgYyArPSAxKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHJldHJpZXZlS2V5c1tjXTtcbiAgICAgICAgY29uc3QgcmVxID0gcmV0cmlldmVba2V5XTtcbiAgICAgICAgY29uc3QgZWxzID0gcGFyZW50RWwuZmluZChyZXEuc2VsZWN0b3IpO1xuICAgICAgICBjb25zdCBuZXN0ZWQgPSByZXEucmV0cmlldmU7XG4gICAgICAgIGNvbnN0IGF0dHIgPSByZXEuYXR0cmlidXRlO1xuICAgICAgICBjb25zdCBpZ25vcmUgPSByZXEuaWdub3JlO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgICAgICAvLyBMZXRzIGdvIHBlciBlbGVtZW50Li4uXG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZWxzLmxlbmd0aDsgZCArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGVsc1tkXTtcbiAgICAgICAgICAgIGxldCBzaW5nbGU7XG5cbiAgICAgICAgICAgIGlmIChuZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQgfHwgISQuZmluZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29tcGxpYW50ICQgaXMgbmVlZGVkIHRvIGdldCB0aGUgc2NyYXAgb2YgbmVzdGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBnbyBmb3IgdGhlIGNvbnRlbnQgaWYgaXQgZ290cyBuZXN0ZWRcbiAgICAgICAgICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmVzdGVkIHRoZW5cbiAgICAgICAgICAgICAgICBzaW5nbGUgPSBnZXRTY3JhcCgkLCAkKGVsKSwgcmVxKTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChzaW5nbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyBuZXN0ZWQsIGdldCBjb250ZW50IVxuICAgICAgICAgICAgICAgIHNpbmdsZSA9ICEhYXR0ciA/IGVsLmdldEF0dHJpYnV0ZShhdHRyKSA6IGVsLnRleHRDb250ZW50O1xuICAgICAgICAgICAgICAgICFjb250YWlucyhpZ25vcmUsIHNpbmdsZSkgJiYgcmVzdWx0LnB1c2goc2luZ2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExldHMgdGFrZSBjYXJlIG9mIGlnbm9yZSBhbmQgZmluYWxseWNhY2hlIGl0Li4uXG4gICAgICAgIHJlc3VsdHNba2V5XSA9IHJlc3VsdDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gcmV0cmlldmVcbiAqIEBwYXJhbSB7aW50fSB0aHJvdHRsZVxuICogQHBhcmFtIHtpbnR9IGlcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJcbiAqIEByZXR1cm4ge3Byb21pc2V9XG4gKi9cbmNvbnN0IGdldFNpbmdsZSA9IChkYXRhID0gW10sIHRocm90dGxlLCBpID0gMCwgZGF0YUFyciA9IFtdKSA9PiB7XG4gICAgaWYgKCFpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RhdGEgbmVlZHMgdG8gZXhpc3QgYW5kIGJlIGFuIGFycmF5Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE1heWJlIHRoZXJlIGlzIG5vIG1vcmUgZGF0YSBzby4uLiBsZXRzIGluZm9ybVxuICAgIGlmICghZGF0YVtpXSB8fCAhZGF0YVtpXS5zcmMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShkYXRhQXJyKSk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSB0aGUgcmVxdWVzdCBhbmQgZ2V0IGJhY2tcbiAgICByZXR1cm4gZ2V0RG9tKGRhdGFbaV0uc3JjLCAndXJsJywgdGhyb3R0bGUpLnRoZW4oc2luZ2xlRG9tID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSBzaW5nbGVEb20ud2luZG93LiQ7XG5cbiAgICAgICAgLy8gQ2FjaGUgdXJsIGRhdGFcbiAgICAgICAgZGF0YUFyci5wdXNoKHtcbiAgICAgICAgICAgIHNyYzogZGF0YVtpXS5zcmMsXG4gICAgICAgICAgICByZXN1bHQ6IGdldFNjcmFwKGVsLCBlbCwgZGF0YVtpXSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTGV0cyBnZXQgdGhlIG5leHQgb25lIGluIHRoZSBwcm9taXNlXG4gICAgICAgIGNvbnN0IG5leHQgPSBnZXRTaW5nbGUoZGF0YSwgdGhyb3R0bGUsIGkgKz0gMSwgZGF0YUFycik7XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHYXRoZXIgZGF0YVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aHJvdHRsZVxuICogQHBhcmFtIHtpbnR9IGlcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFSZXN1bHRcbiAqIEByZXR1cm5zIHtwcm9taXNlfVxuICovXG5jb25zdCBnYXRoZXJEYXRhID0gKGRhdGEgPSBbXSwgdGhyb3R0bGUsIGkgPSAwLCBkYXRhUmVzdWx0ID0gW10pID0+IHtcbiAgICBpZiAoIWRhdGFbaV0pIHtcbiAgICAgICAgLy8gTWF5YmUgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIHNvLi4uIGxldHMgaW5mb3JtXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUoZGF0YVJlc3VsdCkpO1xuICAgIH1cblxuICAgIGlmICghZGF0YVtpXSB8fCB0eXBlb2YgZGF0YVtpXSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBkYXRhIG9iamVjdCBpcyByZXF1aXJlZCB0byBnZXQgdGhlIHVybCcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFbaV0uc3JjIHx8IHR5cGVvZiBkYXRhW2ldLnNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQSBzcmMgaXMgcmVxdWlyZWQgdG8gZ2V0IHRoZSB1cmwnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyBtYWtlIHRoZSBuYW1lIHJpZ2h0XG4gICAgZGF0YVtpXS5uYW1lID0gZGF0YVtpXS5uYW1lIHx8IHBhdGguYmFzZW5hbWUoZGF0YVtpXS5zcmMpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBleHBlY3RlZCBvYmplY3RcbiAgICBjb25zdCB1cmxzID0gZ2V0UXVlcmllZFVybHMoZGF0YVtpXSkubWFwKHVybCA9PiAoe1xuICAgICAgICBzcmM6IHVybCwgcmV0cmlldmU6IGRhdGFbaV0ucmV0cmlldmVcbiAgICB9KSk7XG5cbiAgICAvLyBNYWtlIHRoZSBzaW5nbGUgcmVxdWVzdFxuICAgIHJldHVybiBnZXRTaW5nbGUodXJscywgdGhyb3R0bGUpXG4gICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgLy8gQ2FjaGUgdGhlIHJlc3VsdFxuICAgICAgICBkYXRhW2ldLnJlc3VsdCA9IHJlc3VsdDtcblxuICAgICAgICAvLyBDYWNoZSBkYXRhXG4gICAgICAgIGRhdGFSZXN1bHQucHVzaChkYXRhW2ldKTtcblxuICAgICAgICAvLyBMZXRzIGdldCB0aGUgbmV4dCBvbmUgaW4gdGhlIHByb21pc2VcbiAgICAgICAgY29uc3QgbmV4dCA9IGdhdGhlckRhdGEoZGF0YSwgdGhyb3R0bGUsIGkgKz0gMSwgZGF0YVJlc3VsdCk7XG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHNjcmFwZXJcbiAqXG4gKiBAcGFyYW0ge29iamVjdHxzdHJpbmd9IGNvbmZpZ1xuICogQHJldHVybnMge3Byb21pc2V9XG4gKi9cbmNvbnN0IHJ1biA9IChjb25maWcsIGZpbGUpID0+IHtcbiAgICBjb25maWcgPSBjb25maWdHZXQoY29uZmlnKTtcblxuICAgIC8vIExldHMgZ2F0aGVyIGRhdGEgZnJvbSB0aGUgc3JjXG4gICAgcmV0dXJuIGdhdGhlckRhdGEoY29uZmlnLmRhdGEsIGNvbmZpZy50aHJvdHRsZSlcbiAgICAudGhlbihkYXRhID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vIENhY2hlIHRoZSByZXN1bHRcbiAgICAgICAgY29uZmlnLnJlc3VsdCA9IGRhdGE7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgZmlsZVxuICAgICAgICBmaWxlICYmIGZzLndyaXRlRmlsZVN5bmMoZ2V0UHdkKGZpbGUpLCBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDQpLCB7IGVuY29kaW5nOiAndXRmLTgnIH0pO1xuXG4gICAgICAgIHJlc29sdmUoY29uZmlnKTtcbiAgICB9KSk7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuaWYgKGFyZ3YgJiYgYXJndi5jb25maWcpIHtcbiAgICBydW4oYXJndi5jb25maWcsIGFyZ3Yuc2F2ZSk7XG59XG5leHBvcnQgeyBydW4sIGdldFVybCwgZ2V0RG9tIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBydW4sIGdhdGhlckRhdGEsIGdldFNpbmdsZSwgZ2V0RG9tLCBnZXRTY3JhcCwgZ2V0VXJsLCBnZXRRdWVyaWVkVXJscyB9O1xuIl19