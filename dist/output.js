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
        _mkdirp2.default.sync(_path2.default.basename(output.src));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsiZ2V0RmlsZSIsIm91dHB1dCIsIkVycm9yIiwiZXhpc3RzIiwic3JjIiwiZXhpc3RzU3luYyIsInR5cGUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwic2F2ZSIsImZyb21GaWxlIiwiZmluYWxPYmoiLCJmb3JjZSIsImZpbGVEYXRhIiwiYWN0dWFsRGF0YSIsImNvbmNhdCIsInJldmVyc2UiLCJhIiwiYiIsIm5hbWUiLCJmaWx0ZXIiLCJ2YWwiLCJmbiIsInN5bmMiLCJiYXNlbmFtZSIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsImxvZ2dlciIsImxvZyIsInNhdmVJdGVtIiwiY291bnQiLCJhbGxTcmNzIiwic2V0IiwibWJJZCIsImFjdHVhbFR5cGUiLCJleHRuYW1lIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwiaGFzQ29uc29sZSIsImRlc2NyaWJlIiwidW5kZWZpbmVkIiwiY29uc29sZSIsIndhcm4iLCJlcnJvciIsImNiIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLENBQUNDLE1BQUQsRUFBWTtBQUN4QixRQUFJLENBQUNBLE1BQUQsSUFBVyxRQUFPQSxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWpDLEVBQTJDO0FBQ3ZDLGNBQU0sSUFBSUMsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNQyxTQUFTRixPQUFPRyxHQUFQLEdBQWEsYUFBR0MsVUFBSCxDQUFjSixPQUFPRyxHQUFyQixDQUFiLEdBQXlDLEtBQXhEOztBQUVBO0FBQ0EsWUFBUUgsT0FBT0ssSUFBZjtBQUNBLGFBQUssU0FBTDtBQUNBLGFBQUssWUFBTDtB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RyxhQUFILEVBQWtCRyxJQUFsQixFQUF3QjtBQUFBLGVBQVF6QixLQUFLVixNQUFMLEVBQWFNLElBQWIsQ0FBUjtBQUFBLEtBQXhCO0FBQ0EscUJBQUcsaUJBQUgsRUFBc0I2QixJQUF0QixFQUE0QjtBQUFBLGVBQVFKLFNBQVMvQixNQUFULEVBQWlCTSxJQUFqQixDQUFSO0FBQUEsS0FBNUI7QUFDQSxxQkFBRyxhQUFILEVBQWtCNkIsSUFBbEIsRUFBd0IsVUFBQ1csRUFBRDtBQUFBLGVBQVFBLEdBQUdWLFVBQUgsQ0FBUjtBQUFBLEtBQXhCO0FBQ0EscUJBQUcsZ0JBQUgsRUFBcUJELElBQXJCLEVBQTJCLFVBQUNXLEVBQUQ7QUFBQSxlQUFRQSxHQUFHL0MsUUFBUUMsTUFBUixDQUFILENBQVI7QUFBQSxLQUEzQjs7QUFFQSxxQkFBRyxnQkFBSCxFQUFxQm1DLElBQXJCLEVBQTJCO0FBQUEsZUFBTW5DLE9BQU82QixNQUFQLENBQWNDLEdBQWQsQ0FBa0IsYUFBbEIsRUFBaUMsWUFBakMsQ0FBTjtBQUFBLEtBQTNCO0FBQ0EscUJBQUcsaUJBQUgsRUFBc0JLLElBQXRCLEVBQTRCLFVBQUNGLE9BQUQsRUFBYTtBQUNyQ2pDLGVBQU9pQyxPQUFQLEdBQWlCQSxXQUFXakMsT0FBT2lDLE9BQW5DO0FBQ0gsS0FGRDtBQUdBLHFCQUFHLGNBQUgsRUFBbUJFLElBQW5CLEVBQXlCO0FBQUEsZUFBTW5DLE9BQU82QixNQUFQLENBQWNDLEdBQWQsQ0FBa0IsYUFBbEIsRUFBaUMsT0FBakMsQ0FBTjtBQUFBLEtBQXpCOztBQUVBLFdBQU85QixNQUFQO0FBQ0gsQ0ExQ0Q7O0FBNENBO0FBQ0E7O1FBRVNrQyxHLEdBQUFBLEc7UUFDQXhCLEksR0FBQUEsSTtRQUNBcUIsUSxHQUFBQSxRO1FBQ0FoQyxPLEdBQUFBLE87O0FBRVQiLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIFByb21pc2UgKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHVuaXFXaXRoIGZyb20gJ2xvZGFzaC91bmlxV2l0aC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCB7IGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgb24sIG9mZiB9IGZyb20gJy4vbWFpbGJveC5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0cyBhY3R1YWwgb3V0cHV0IGZyb20gZmlsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqL1xuY29uc3QgZ2V0RmlsZSA9IChvdXRwdXQpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzID0gb3V0cHV0LnNyYyA/IGZzLmV4aXN0c1N5bmMob3V0cHV0LnNyYykgOiBmYWxzZTtcblxuICAgIC8vIE5vdyBmb3IgdGhlIHNhdmVcbiAgICBzd2l0Y2ggKG91dHB1dC50eXBlKSB7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgY2FzZSAnbWlkZGxld2FyZSc6XG4gICAgICAgIHJldHVybiBvdXRwdXQuZGF0YTtcbiAgICBjYXNlICdjc3YnOlxuICAgICAgICAvLyBUT0RPOiBXZSBuZWVkIHRvIHBhcnNlIGl0XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBleGlzdHMgPyBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhvdXRwdXQuc3JjLCAndXRmLTgnKSkgOiB7fTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNhdmVzIGRhdGEgaW50byBmaWxlXG4gKlxuICogQHBhcmFtIHtvYmVqY3R9IG91dHB1dFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJvbUZpbGVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHNhdmUgPSAob3V0cHV0LCBkYXRhLCBmcm9tRmlsZSkgPT4ge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gb3V0cHV0IG9iamVjdCBpcyBuZWVkZWQnKTtcbiAgICB9XG5cbiAgICBsZXQgZmluYWxPYmogPSBkYXRhO1xuICAgIGRhdGEuZGF0YSA9IGRhdGEuZGF0YSB8fCBbXTtcblxuICAgIGlmICghb3V0cHV0LmZvcmNlKSB7XG4gICAgICAgIGNvbnN0IGZpbGVEYXRhID0gZ2V0RmlsZShvdXRwdXQpIHx8IHt9O1xuICAgICAgICBjb25zdCBhY3R1YWxEYXRhID0gKGZpbGVEYXRhLmRhdGEgfHwgW10pLmNvbmNhdChkYXRhLmRhdGEpO1xuXG4gICAgICAgIC8vIERlbGV0ZSBzbyBpdCBkb2Vzbid0IG1lcmdlXG4gICAgICAgIGRlbGV0ZSBkYXRhLmRhdGE7XG4gICAgICAgIGRlbGV0ZSBmaWxlRGF0YS5kYXRhO1xuXG4gICAgICAgIC8vIExldHMgbWVyZ2UgdGhlIGRhdGFcbiAgICAgICAgZmluYWxPYmogPSBtZXJnZShmaWxlRGF0YSwgZGF0YSk7XG4gICAgICAgIGZpbmFsT2JqLmRhdGEgPSB1bmlxV2l0aChhY3R1YWxEYXRhLnJldmVyc2UoKSxcbiAgICAgICAgICAgIChhLCBiKSA9PiBhICYmIGIgJiYgYS5zcmMgPT09IGIuc3JjICYmIGEubmFtZSA9PT0gYi5uYW1lXG4gICAgICAgICkuZmlsdGVyKHZhbCA9PiAhIXZhbCk7XG4gICAgfVxuXG4gICAgLy8gU2F2ZSB0aGUgZmlsZVxuICAgIG91dHB1dC5kYXRhID0gZmluYWxPYmo7XG4gICAgIWZyb21GaWxlICYmIG91dHB1dC5mbihmaW5hbE9iaik7XG5cbiAgICBpZiAob3V0cHV0LnNyYykge1xuICAgICAgICBta2RpcnAuc3luYyhwYXRoLmJhc2VuYW1lKG91dHB1dC5zcmMpKTtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXQuc3JjLCBKU09OLnN0cmluZ2lmeShmaW5hbE9iaiwgbnVsbCwgNCksIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG4gICAgfVxuXG4gICAgb3V0cHV0LmxvZ2dlci5sb2coJ1tNckNyb3dsZXldJywgJ0ZpbGUgc2F2ZWQnKTtcbn07XG5cbi8qKlxuICogU2F2ZXMgaXRlbSBpbiBkYXRhXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG91dHB1dFxuICogQHBhcmFtIHthcnJheX0gZGF0YVxuICovXG5jb25zdCBzYXZlSXRlbSA9IChvdXRwdXQsIGRhdGEpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxPYmogPSB7IGRhdGE6ICFpc0FycmF5KGRhdGEpID8gW2RhdGFdIDogZGF0YSB9O1xuXG4gICAgb3V0cHV0LmZuKGZpbmFsT2JqLCB0cnVlKTtcbiAgICBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnU2F2ZWQgaXRlbScsIGBbJHtvdXRwdXQuY291bnR9LyR7b3V0cHV0LmFsbFNyY3N9XWApO1xuXG4gICAgLy8gRmluYWxseSBsZXRzIGdvIGZvciB0aGUgc2F2ZVxuICAgIHNhdmUob3V0cHV0LCBmaW5hbE9iaiwgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIFNldHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IHNldCA9IChzcmMsIHR5cGUsIGZuLCBmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgbWJJZCA9ICdvdXRwdXQnO1xuXG4gICAgLy8gUmVtb3ZlIG9sZCBldmVudHNcbiAgICBvZmYoJ291dHB1dC5zYXZlJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC50eXBlJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQpO1xuXG4gICAgb2ZmKCdvdXRwdXQub25TdGFydCcsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0Lm9uRW5kJywgbWJJZCk7XG5cbiAgICBpZiAoc3JjICYmIHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IG91dHB1dFxuICAgIGNvbnN0IGFjdHVhbFR5cGUgPSAoc3JjICYmICF0eXBlID8gcGF0aC5leHRuYW1lKHNyYykucmVwbGFjZSgnLicsICcnKS50b0xvd2VyQ2FzZSgpIDogdHlwZSkgfHwgJ3Byb21pc2UnO1xuICAgIGNvbnN0IGhhc0NvbnNvbGUgPSBhY3R1YWxUeXBlICE9PSAncHJvbWlzZScgJiYgdHlwZW9mIGRlc2NyaWJlID09PSAndW5kZWZpbmVkJztcbiAgICBjb25zdCBvdXRwdXQgPSB7XG4gICAgICAgIHNyYzogc3JjID8gZ2V0UHdkKHNyYykgOiB1bmRlZmluZWQsXG4gICAgICAgIHR5cGU6IGFjdHVhbFR5cGUsXG4gICAgICAgIGxvZ2dlcjogaGFzQ29uc29sZSA/IGNvbnNvbGUgOiB7IGxvZzogKCkgPT4ge30sIHdhcm46ICgpID0+IHt9LCBlcnJvcjogKCkgPT4ge30gfSxcbiAgICAgICAgZm46IGZuIHx8ICgoKSA9PiB7fSksXG4gICAgICAgIGZvcmNlLFxuICAgICAgICBhbGxTcmNzOiAwLFxuICAgICAgICBjb3VudDogMFxuICAgIH07XG5cbiAgICAvLyBTZXQgZXZlbnRzXG4gICAgb24oJ291dHB1dC5zYXZlJywgbWJJZCwgZGF0YSA9PiBzYXZlKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkLCBkYXRhID0+IHNhdmVJdGVtKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQudHlwZScsIG1iSWQsIChjYikgPT4gY2IoYWN0dWFsVHlwZSkpO1xuICAgIG9uKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQsIChjYikgPT4gY2IoZ2V0RmlsZShvdXRwdXQpKSk7XG5cbiAgICBvbignb3V0cHV0Lm9uU3RhcnQnLCBtYklkLCAoKSA9PiBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnU3RhcnRlZC4uLicpKTtcbiAgICBvbignb3V0cHV0Lm9uVXBkYXRlJywgbWJJZCwgKGFsbFNyY3MpID0+IHtcbiAgICAgICAgb3V0cHV0LmFsbFNyY3MgPSBhbGxTcmNzIHx8IG91dHB1dC5hbGxTcmNzO1xuICAgIH0pO1xuICAgIG9uKCdvdXRwdXQub25FbmQnLCBtYklkLCAoKSA9PiBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnRW5kZWQnKSk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBzZXQgfTtcbmV4cG9ydCB7IHNhdmUgfTtcbmV4cG9ydCB7IHNhdmVJdGVtIH07XG5leHBvcnQgeyBnZXRGaWxlIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBzZXQsIHNhdmUsIHNhdmVJdGVtLCBnZXRGaWxlIH07XG4iXX0=