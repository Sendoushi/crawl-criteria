'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFile = exports.saveItem = exports.save = exports.set = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _uniqWith = require('lodash/uniqWith.js');

var _uniqWith2 = _interopRequireDefault(_uniqWith);

var _isArray = require('lodash/isArray.js');

var _isArray2 = _interopRequireDefault(_isArray);

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

var _utils = require('./utils.js');

var _mailbox = require('./mailbox.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Gets actual output from file
 *
 * @param {object} output
 */
var getFile = function getFile(output) {
    if (!output || (typeof output === 'undefined' ? 'undefined' : _typeof(output)) !== 'object') {
        throw new Error('An output object is needed');
    }

    var exists = output.src ? _fs2.default.existsSync(output.src) : false;

    // Now for the save
    switch (output.type) {
        case 'promise':
        case 'middleware':
            return output.data;
        case 'csv':
            // TODO: We need to parse it
            break;
        case 'json':
        default:
            return exists ? JSON.parse(_fs2.default.readFileSync(output.src, 'utf-8')) : {};
    }
};

/**
 * Saves data into file
 *
 * @param {obejct} output
 * @param {object} data
 * @param {boolean} fromFile
 * @returns
 */
var save = function save(output, data, fromFile) {
    if (!output || (typeof output === 'undefined' ? 'undefined' : _typeof(output)) !== 'object') {
        throw new Error('An output object is needed');
    }

    var finalObj = data;
    data.data = data.data || [];

    if (!output.force) {
        var fileData = getFile(output) || {};
        var actualData = (fileData.data || []).concat(data.data);

        // Delete so it doesn't merge
        delete data.data;
        delete fileData.data;

        // Lets merge the data
        finalObj = (0, _merge2.default)(fileData, data);
        finalObj.data = (0, _uniqWith2.default)(actualData.reverse(), function (a, b) {
            return a && b && a.src === b.src && a.name === b.name;
        }).filter(function (val) {
            return !!val;
        });
    }

    // Save the file
    output.data = finalObj;
    !fromFile && output.fn(finalObj);

    if (output.src) {
        _mkdirp2.default.sync(_path2.default.dirname(output.src));
        _fs2.default.writeFileSync(output.src, JSON.stringify(finalObj, null, 4), { encoding: 'utf-8' });
    }

    output.logger.log('[MrCrowley]', 'File saved');
};

/**
 * Saves item in data
 *
 * @param {object} output
 * @param {array} data
 */
var saveItem = function saveItem(output, data) {
    if (!output || (typeof output === 'undefined' ? 'undefined' : _typeof(output)) !== 'object') {
        throw new Error('An output object is needed');
    }

    output.count += 1;

    var finalObj = { data: !(0, _isArray2.default)(data) ? [data] : data };

    output.fn(finalObj, true);
    output.logger.log('[MrCrowley]', 'Saved item', '[' + output.count + '/' + output.allSrcs + ']');

    // Finally lets go for the save
    save(output, finalObj, true);
};

/**
 * Sets
 *
 * @param {string} src
 * @param {string} type
 * @param {function} fn
 * @param {boolean} force
 * @returns {object}
 */
var set = function set(src, type, fn) {
    var force = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var mbId = 'output';

    // Remove old events
    (0, _mailbox.off)('output.save', mbId);
    (0, _mailbox.off)('output.saveItem', mbId);
    (0, _mailbox.off)('output.type', mbId);
    (0, _mailbox.off)('output.getFile', mbId);

    (0, _mailbox.off)('output.onStart', mbId);
    (0, _mailbox.off)('output.onEnd', mbId);

    if (src && typeof src !== 'string') {
        throw new Error('Source needs to be a string');
    }

    // Set output
    var actualType = (src && !type ? _path2.default.extname(src).replace('.', '').toLowerCase() : type) || 'promise';
    var hasConsole = actualType !== 'promise' && typeof describe === 'undefined';
    var output = {
        src: src ? (0, _utils.getPwd)(src) : undefined,
        type: actualType,
        logger: hasConsole ? console : { log: function log() {}, warn: function warn() {}, error: function error() {} },
        fn: fn || function () {},
        force: force,
        allSrcs: 0,
        count: 0
    };

    // Set events
    (0, _mailbox.on)('output.save', mbId, function (data) {
        return save(output, data);
    });
    (0, _mailbox.on)('output.saveItem', mbId, function (data) {
        return saveItem(output, data);
    });
    (0, _mailbox.on)('output.type', mbId, function (cb) {
        return cb(actualType);
    });
    (0, _mailbox.on)('output.getFile', mbId, function (cb) {
        return cb(getFile(output));
    });

    (0, _mailbox.on)('output.onStart', mbId, function () {
        return output.logger.log('[MrCrowley]', 'Started...');
    });
    (0, _mailbox.on)('output.onUpdate', mbId, function (allSrcs) {
        output.allSrcs = allSrcs || output.allSrcs;
    });
    (0, _mailbox.on)('output.onEnd', mbId, function () {
        return output.logger.log('[MrCrowley]', 'Ended');
    });

    return output;
};

// --------------------------------
// Export

exports.set = set;
exports.save = save;
exports.saveItem = saveItem;
exports.getFile = getFile;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsiZ2V0RmlsZSIsIm91dHB1dCIsIkVycm9yIiwiZXhpc3RzIiwic3JjIiwiZXhpc3RzU3luYyIsInR5cGUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwic2F2ZSIsImZyb21GaWxlIiwiZmluYWxPYmoiLCJmb3JjZSIsImZpbGVEYXRhIiwiYWN0dWFsRGF0YSIsImNvbmNhdCIsInJldmVyc2UiLCJhIiwiYiIsIm5hbWUiLCJmaWx0ZXIiLCJ2YWwiLCJmbiIsInN5bmMiLCJkaXJuYW1lIiwid3JpdGVGaWxlU3luYyIsInN0cmluZ2lmeSIsImVuY29kaW5nIiwibG9nZ2VyIiwibG9nIiwic2F2ZUl0ZW0iLCJjb3VudCIsImFsbFNyY3MiLCJzZXQiLCJtYklkIiwiYWN0dWFsVHlwZSIsImV4dG5hbWUiLCJyZXBsYWNlIiwidG9Mb3dlckNhc2UiLCJoYXNDb25zb2xlIiwiZGVzY3JpYmUiLCJ1bmRlZmluZWQiLCJjb25zb2xlIiwid2FybiIsImVycm9yIiwiY2IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7QUFLQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsQ0FBQ0MsTUFBRCxFQUFZO0FBQ3hCLFFBQUksQ0FBQ0EsTUFBRCxJQUFXLFFBQU9BLE1BQVAseUNBQU9BLE1BQVAsT0FBa0IsUUFBakMsRUFBMkM7QUFDdkMsY0FBTSxJQUFJQyxLQUFKLENBQVUsNEJBQVYsQ0FBTjtBQUNIOztBQUVELFFBQU1DLFNBQVNGLE9BQU9HLEdBQVAsR0FBYSxhQUFHQyxVQUFILENBQWNKLE9BQU9HLEdBQXJCLENBQWIsR0FBeUMsS0FBeEQ7O0FBRUE7QUFDQSxZQUFRSCxPQUFPSyxJQUFmO0FBQ0EsYUFBSyxTQUFMO0FBQ0EsYUFBSyxZQUFMO0FB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RCxlQUFPO0FBUEksS0FBZjs7QUFVQTtBQUNBLHFCQUFHLGFBQUgsRUFBa0JHLElBQWxCLEVBQXdCO0FBQUEsZUFBUXpCLEtBQUtWLE1BQUwsRUFBYU0sSUFBYixDQUFSO0FBQUEsS0FBeEI7QUFDQSxxQkFBRyxpQkFBSCxFQUFzQjZCLElBQXRCLEVBQTRCO0FBQUEsZUFBUUosU0FBUy9CLE1BQVQsRUFBaUJNLElBQWpCLENBQVI7QUFBQSxLQUE1QjtBQUNBLHFCQUFHLGFBQUgsRUFBa0I2QixJQUFsQixFQUF3QixVQUFDVyxFQUFEO0FBQUEsZUFBUUEsR0FBR1YsVUFBSCxDQUFSO0FBQUEsS0FBeEI7QUFDQSxxQkFBRyxnQkFBSCxFQUFxQkQsSUFBckIsRUFBMkIsVUFBQ1csRUFBRDtBQUFBLGVBQVFBLEdBQUcvQyxRQUFRQyxNQUFSLENBQUgsQ0FBUjtBQUFBLEtBQTNCOztBQUVBLHFCQUFHLGdCQUFILEVBQXFCbUMsSUFBckIsRUFBMkI7QUFBQSxlQUFNbkMsT0FBTzZCLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQixhQUFsQixFQUFpQyxZQUFqQyxDQUFOO0FBQUEsS0FBM0I7QUFDQSxxQkFBRyxpQkFBSCxFQUFzQkssSUFBdEIsRUFBNEIsVUFBQ0YsT0FBRCxFQUFhO0FBQ3JDakMsZUFBT2lDLE9BQVAsR0FBaUJBLFdBQVdqQyxPQUFPaUMsT0FBbkM7QUFDSCxLQUZEO0FBR0EscUJBQUcsY0FBSCxFQUFtQkUsSUFBbkIsRUFBeUI7QUFBQSxlQUFNbkMsT0FBTzZCLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQixhQUFsQixFQUFpQyxPQUFqQyxDQUFOO0FBQUEsS0FBekI7O0FBRUEsV0FBTzlCLE1BQVA7QUFDSCxDQTFDRDs7QUE0Q0E7QUFDQTs7UUFFU2tDLEcsR0FBQUEsRztRQUNBeEIsSSxHQUFBQSxJO1FBQ0FxQixRLEdBQUFBLFE7UUFDQWhDLE8sR0FBQUEsTzs7QUFFVCIsImZpbGUiOiJvdXRwdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgdW5pcVdpdGggZnJvbSAnbG9kYXNoL3VuaXFXaXRoLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IHsgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBvbiwgb2ZmIH0gZnJvbSAnLi9tYWlsYm94LmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBHZXRzIGFjdHVhbCBvdXRwdXQgZnJvbSBmaWxlXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG91dHB1dFxuICovXG5jb25zdCBnZXRGaWxlID0gKG91dHB1dCkgPT4ge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gb3V0cHV0IG9iamVjdCBpcyBuZWVkZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdHMgPSBvdXRwdXQuc3JjID8gZnMuZXhpc3RzU3luYyhvdXRwdXQuc3JjKSA6IGZhbHNlO1xuXG4gICAgLy8gTm93IGZvciB0aGUgc2F2ZVxuICAgIHN3aXRjaCAob3V0cHV0LnR5cGUpIHtcbiAgICBjYXNlICdwcm9taXNlJzpcbiAgICBjYXNlICdtaWRkbGV3YXJlJzpcbiAgICAgICAgcmV0dXJuIG91dHB1dC5kYXRhO1xuICAgIGNhc2UgJ2Nzdic6XG4gICAgICAgIC8vIFRPRE86IFdlIG5lZWQgdG8gcGFyc2UgaXRcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnanNvbic6XG4gICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGV4aXN0cyA/IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG91dHB1dC5zcmMsICd1dGYtOCcpKSA6IHt9O1xuICAgIH1cbn07XG5cbi8qKlxuICogU2F2ZXMgZGF0YSBpbnRvIGZpbGVcbiAqXG4gKiBAcGFyYW0ge29iZWpjdH0gb3V0cHV0XG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICogQHBhcmFtIHtib29sZWFufSBmcm9tRmlsZVxuICogQHJldHVybnNcbiAqL1xuY29uc3Qgc2F2ZSA9IChvdXRwdXQsIGRhdGEsIGZyb21GaWxlKSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIGxldCBmaW5hbE9iaiA9IGRhdGE7XG4gICAgZGF0YS5kYXRhID0gZGF0YS5kYXRhIHx8IFtdO1xuXG4gICAgaWYgKCFvdXRwdXQuZm9yY2UpIHtcbiAgICAgICAgY29uc3QgZmlsZURhdGEgPSBnZXRGaWxlKG91dHB1dCkgfHwge307XG4gICAgICAgIGNvbnN0IGFjdHVhbERhdGEgPSAoZmlsZURhdGEuZGF0YSB8fCBbXSkuY29uY2F0KGRhdGEuZGF0YSk7XG5cbiAgICAgICAgLy8gRGVsZXRlIHNvIGl0IGRvZXNuJ3QgbWVyZ2VcbiAgICAgICAgZGVsZXRlIGRhdGEuZGF0YTtcbiAgICAgICAgZGVsZXRlIGZpbGVEYXRhLmRhdGE7XG5cbiAgICAgICAgLy8gTGV0cyBtZXJnZSB0aGUgZGF0YVxuICAgICAgICBmaW5hbE9iaiA9IG1lcmdlKGZpbGVEYXRhLCBkYXRhKTtcbiAgICAgICAgZmluYWxPYmouZGF0YSA9IHVuaXFXaXRoKGFjdHVhbERhdGEucmV2ZXJzZSgpLFxuICAgICAgICAgICAgKGEsIGIpID0+IGEgJiYgYiAmJiBhLnNyYyA9PT0gYi5zcmMgJiYgYS5uYW1lID09PSBiLm5hbWVcbiAgICAgICAgKS5maWx0ZXIodmFsID0+ICEhdmFsKTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoZSBmaWxlXG4gICAgb3V0cHV0LmRhdGEgPSBmaW5hbE9iajtcbiAgICAhZnJvbUZpbGUgJiYgb3V0cHV0LmZuKGZpbmFsT2JqKTtcblxuICAgIGlmIChvdXRwdXQuc3JjKSB7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShvdXRwdXQuc3JjKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0LnNyYywgSlNPTi5zdHJpbmdpZnkoZmluYWxPYmosIG51bGwsIDQpLCB7IGVuY29kaW5nOiAndXRmLTgnIH0pO1xuICAgIH1cblxuICAgIG91dHB1dC5sb2dnZXIubG9nKCdbTXJDcm93bGV5XScsICdGaWxlIHNhdmVkJyk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGl0ZW0gaW4gZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqL1xuY29uc3Qgc2F2ZUl0ZW0gPSAob3V0cHV0LCBkYXRhKSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIG91dHB1dC5jb3VudCArPSAxO1xuXG4gICAgY29uc3QgZmluYWxPYmogPSB7IGRhdGE6ICFpc0FycmF5KGRhdGEpID8gW2RhdGFdIDogZGF0YSB9O1xuXG4gICAgb3V0cHV0LmZuKGZpbmFsT2JqLCB0cnVlKTtcbiAgICBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnU2F2ZWQgaXRlbScsIGBbJHtvdXRwdXQuY291bnR9LyR7b3V0cHV0LmFsbFNyY3N9XWApO1xuXG4gICAgLy8gRmluYWxseSBsZXRzIGdvIGZvciB0aGUgc2F2ZVxuICAgIHNhdmUob3V0cHV0LCBmaW5hbE9iaiwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIFNldHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IHNldCA9IChzcmMsIHR5cGUsIGZuLCBmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgbWJJZCA9ICdvdXRwdXQnO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBldmVudHNcbiAgICBvZmYoJ291dHB1dC5zYXZlJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC50eXBlJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQpO1xuXG4gICAgb2ZmKCdvdXRwdXQub25TdGFydCcsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0Lm9uRW5kJywgbWJJZCk7XG5cbiAgICBpZiAoc3JjICYmIHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IG91dHB1dFxuICAgIGNvbnN0IGFjdHVhbFR5cGUgPSAoc3JjICYmICF0eXBlID8gcGF0aC5leHRuYW1lKHNyYykucmVwbGFjZSgnLicsICcnKS50b0xvd2VyQ2FzZSgpIDogdHlwZSkgfHwgJ3Byb21pc2UnO1xuICAgIGNvbnN0IGhhc0NvbnNvbGUgPSBhY3R1YWxUeXBlICE9PSAncHJvbWlzZScgJiYgdHlwZW9mIGRlc2NyaWJlID09PSAndW5kZWZpbmVkJztcbiAgICBjb25zdCBvdXRwdXQgPSB7XG4gICAgICAgIHNyYzogc3JjID8gZ2V0UHdkKHNyYykgOiB1bmRlZmluZWQsXG4gICAgICAgIHR5cGU6IGFjdHVhbFR5cGUsXG4gICAgICAgIGxvZ2dlcjogaGFzQ29uc29sZSA/IGNvbnNvbGUgOiB7IGxvZzogKCkgPT4ge30sIHdhcm46ICgpID0+IHt9LCBlcnJvcjogKCkgPT4ge30gfSxcbiAgICAgICAgZm46IGZuIHx8ICgoKSA9PiB7fSksXG4gICAgICAgIGZvcmNlLFxuICAgICAgICBhbGxTcmNzOiAwLFxuICAgICAgICBjb3VudDogMFxuICAgIH07XG5cbiAgICAvLyBTZXQgZXZlbnRzXG4gICAgb24oJ291dHB1dC5zYXZlJywgbWJJZCwgZGF0YSA9PiBzYXZlKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkLCBkYXRhID0+IHNhdmVJdGVtKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQudHlwZScsIG1iSWQsIChjYikgPT4gY2IoYWN0dWFsVHlwZSkpO1xuICAgIG9uKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQsIChjYikgPT4gY2IoZ2V0RmlsZShvdXRwdXQpKSk7XG5cbiAgICBvbignb3V0cHV0Lm9uU3RhcnQnLCBtYklkLCAoKSA9PiBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnU3RhcnRlZC4uLicpKTtcbiAgICBvbignb3V0cHV0Lm9uVXBkYXRlJywgbWJJZCwgKGFsbFNyY3MpID0+IHtcbiAgICAgICAgb3V0cHV0LmFsbFNyY3MgPSBhbGxTcmNzIHx8IG91dHB1dC5hbGxTcmNzO1xuICAgIH0pO1xuICAgIG9uKCdvdXRwdXQub25FbmQnLCBtYklkLCAoKSA9PiBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnRW5kZWQnKSk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBzZXQgfTtcbmV4cG9ydCB7IHNhdmUgfTtcbmV4cG9ydCB7IHNhdmVJdGVtIH07XG5leHBvcnQgeyBnZXRGaWxlIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBzZXQsIHNhdmUsIHNhdmVJdGVtLCBnZXRGaWxlIH07XG4iXX0=