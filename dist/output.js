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

var _uniqBy = require('lodash/uniqBy.js');

var _uniqBy2 = _interopRequireDefault(_uniqBy);

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
        finalObj.data = (0, _uniqBy2.default)(actualData.reverse(), 'src');
    }

    // Now for the save
    switch (output.type) {
        case 'middleware':
            output.data = finalObj;
            !fromFile && output.fn(finalObj);
            break;
        case 'promise':
            output.data = finalObj;
            break;
        case 'csv':
            // TODO: We may need to parse it to CSV for example
            break;
        case 'json':
        default:
            if (!output.src) {
                return;
            }

            // Save the file
            _fs2.default.writeFileSync(output.src, JSON.stringify(finalObj, null, 4), { encoding: 'utf-8' });
            /* eslint-disable no-console */
            !fromFile && console.log('File saved:', output.src);
        /* eslint-enable no-console */
    }
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

    // Type specifics
    switch (output.type) {
        case 'middleware':
            output.fn(finalObj, true);
            break;
        case 'promise':
            break;
        case 'csv':
        case 'json':
        default:
            /* eslint-disable no-console */
            console.log('Saved item');
        /* eslint-enable no-console */
    }

    // Finally lets go for the save
    save(output, finalObj, true);
};

/**
 * Sets
 *
 * @param {string} src
 * @param {boolean} force
 * @param {boolean} isPromise
 * @returns {object}
 */
var set = function set(src, type) {
    var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var mbId = 'output';

    // Remove old events
    (0, _mailbox.off)('output.save', mbId);
    (0, _mailbox.off)('output.saveItem', mbId);
    (0, _mailbox.off)('output.type', mbId);
    (0, _mailbox.off)('output.getFile', mbId);

    if (src && typeof src !== 'string') {
        throw new Error('Source needs to be a string');
    }

    // Set output
    var actualType = src && !type ? _path2.default.extname(src).replace('.', '').toLowerCase() : 'promise';
    var output = {
        src: src ? (0, _utils.getPwd)(src) : undefined,
        type: actualType,
        logger: actualType !== 'promise' ? console : { log: function log() {}, warn: function warn() {}, error: function error() {} },
        force: force
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

    return output;
};

// --------------------------------
// Export

exports.set = set;
exports.save = save;
exports.saveItem = saveItem;
exports.getFile = getFile;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsiZ2V0RmlsZSIsIm91dHB1dCIsIkVycm9yIiwiZXhpc3RzIiwic3JjIiwiZXhpc3RzU3luYyIsInR5cGUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwic2F2ZSIsImZyb21GaWxlIiwiZmluYWxPYmoiLCJmb3JjZSIsImZpbGVEYXRhIiwiYWN0dWFsRGF0YSIsImNvbmNhdCIsInJldmVyc2UiLCJmbiIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsImNvbnNvbGUiLCJsb2ciLCJzYXZlSXRlbSIsInNldCIsIm1iSWQiLCJhY3R1YWxUeXBlIiwiZXh0bmFtZSIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsInVuZGVmaW5lZCIsImxvZ2dlciIsIndhcm4iLCJlcnJvciIsImNiIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTtBQUNBOztBQUVBOzs7OztBQUtBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxDQUFDQyxNQUFELEVBQVk7QUFDeEIsUUFBSSxDQUFDQSxNQUFELElBQVcsUUFBT0EsTUFBUCx5Q0FBT0EsTUFBUCxPQUFrQixRQUFqQyxFQUEyQztBQUN2QyxjQUFNLElBQUlDLEtBQUosQ0FBVSw0QkFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTUMsU0FBU0YsT0FBT0csR0FBUCxHQUFhLGFBQUdDLFVBQUgsQ0FBY0osT0FBT0csR0FBckIsQ0FBYixHQUF5QyxLQUF4RDs7QUFFQTtBQUNBLFlBQVFILE9BQU9LLElBQWY7QUFDQSxhQUFLLFNBQUw7QUFDQSxhQUFLLFlBQUw7QUFDSSxtQkFBT0wsT0FBT00sSUFBZDtBQUNKLGFBQUssS0FBTDtBQUNJO0FBQ0E7QUFDSixhQUFLLE1BQUw7QUFDQTtBQUNJLG1CQUFPSixTQUFTSyxLQUFLQyxLQUFMLENB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QSxlQUFRQSxHQUFHcEMsUUFBUUMsTUFBUixDQUFILENBQVI7QUFBQSxLQUEzQjs7QUFFQSxXQUFPQSxNQUFQO0FBQ0gsQ0E3QkQ7O0FBK0JBO0FBQ0E7O1FBRVN5QixHLEdBQUFBLEc7UUFDQWYsSSxHQUFBQSxJO1FBQ0FjLFEsR0FBQUEsUTtRQUNBekIsTyxHQUFBQSxPOztBQUVUIiwiZmlsZSI6Im91dHB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1bmlxQnkgZnJvbSAnbG9kYXNoL3VuaXFCeS5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCB7IGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgb24sIG9mZiB9IGZyb20gJy4vbWFpbGJveC5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogR2V0cyBhY3R1YWwgb3V0cHV0IGZyb20gZmlsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqL1xuY29uc3QgZ2V0RmlsZSA9IChvdXRwdXQpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzID0gb3V0cHV0LnNyYyA/IGZzLmV4aXN0c1N5bmMob3V0cHV0LnNyYykgOiBmYWxzZTtcblxuICAgIC8vIE5vdyBmb3IgdGhlIHNhdmVcbiAgICBzd2l0Y2ggKG91dHB1dC50eXBlKSB7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgY2FzZSAnbWlkZGxld2FyZSc6XG4gICAgICAgIHJldHVybiBvdXRwdXQuZGF0YTtcbiAgICBjYXNlICdjc3YnOlxuICAgICAgICAvLyBUT0RPOiBXZSBuZWVkIHRvIHBhcnNlIGl0XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBleGlzdHMgPyBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhvdXRwdXQuc3JjLCAndXRmLTgnKSkgOiB7fTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNhdmVzIGRhdGEgaW50byBmaWxlXG4gKlxuICogQHBhcmFtIHtvYmVqY3R9IG91dHB1dFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJvbUZpbGVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHNhdmUgPSAob3V0cHV0LCBkYXRhLCBmcm9tRmlsZSkgPT4ge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gb3V0cHV0IG9iamVjdCBpcyBuZWVkZWQnKTtcbiAgICB9XG5cbiAgICBsZXQgZmluYWxPYmogPSBkYXRhO1xuICAgIGRhdGEuZGF0YSA9IGRhdGEuZGF0YSB8fCBbXTtcblxuICAgIGlmICghb3V0cHV0LmZvcmNlKSB7XG4gICAgICAgIGNvbnN0IGZpbGVEYXRhID0gZ2V0RmlsZShvdXRwdXQpIHx8IHt9O1xuICAgICAgICBjb25zdCBhY3R1YWxEYXRhID0gKGZpbGVEYXRhLmRhdGEgfHwgW10pLmNvbmNhdChkYXRhLmRhdGEpO1xuXG4gICAgICAgIC8vIERlbGV0ZSBzbyBpdCBkb2Vzbid0IG1lcmdlXG4gICAgICAgIGRlbGV0ZSBkYXRhLmRhdGE7XG4gICAgICAgIGRlbGV0ZSBmaWxlRGF0YS5kYXRhO1xuXG4gICAgICAgIC8vIExldHMgbWVyZ2UgdGhlIGRhdGFcbiAgICAgICAgZmluYWxPYmogPSBtZXJnZShmaWxlRGF0YSwgZGF0YSk7XG4gICAgICAgIGZpbmFsT2JqLmRhdGEgPSB1bmlxQnkoYWN0dWFsRGF0YS5yZXZlcnNlKCksICdzcmMnKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgZm9yIHRoZSBzYXZlXG4gICAgc3dpdGNoIChvdXRwdXQudHlwZSkge1xuICAgIGNhc2UgJ21pZGRsZXdhcmUnOlxuICAgICAgICBvdXRwdXQuZGF0YSA9IGZpbmFsT2JqO1xuICAgICAgICAhZnJvbUZpbGUgJiYgb3V0cHV0LmZuKGZpbmFsT2JqKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIG91dHB1dC5kYXRhID0gZmluYWxPYmo7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Nzdic6XG4gICAgICAgIC8vIFRPRE86IFdlIG1heSBuZWVkIHRvIHBhcnNlIGl0IHRvIENTViBmb3IgZXhhbXBsZVxuICAgICAgICBicmVhaztcbiAgICBjYXNlICdqc29uJzpcbiAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIW91dHB1dC5zcmMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhdmUgdGhlIGZpbGVcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXQuc3JjLCBKU09OLnN0cmluZ2lmeShmaW5hbE9iaiwgbnVsbCwgNCksIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgIWZyb21GaWxlICYmIGNvbnNvbGUubG9nKCdGaWxlIHNhdmVkOicsIG91dHB1dC5zcmMpO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICB9XG59O1xuXG4vKipcbiAqIFNhdmVzIGl0ZW0gaW4gZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqL1xuY29uc3Qgc2F2ZUl0ZW0gPSAob3V0cHV0LCBkYXRhKSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmFsT2JqID0geyBkYXRhOiAhaXNBcnJheShkYXRhKSA/IFtkYXRhXSA6IGRhdGEgfTtcblxuICAgIC8vIFR5cGUgc3BlY2lmaWNzXG4gICAgc3dpdGNoIChvdXRwdXQudHlwZSkge1xuICAgIGNhc2UgJ21pZGRsZXdhcmUnOlxuICAgICAgICBvdXRwdXQuZm4oZmluYWxPYmosIHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3N2JzpcbiAgICBjYXNlICdqc29uJzpcbiAgICBkZWZhdWx0OlxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKCdTYXZlZCBpdGVtJyk7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgbGV0cyBnbyBmb3IgdGhlIHNhdmVcbiAgICBzYXZlKG91dHB1dCwgZmluYWxPYmosIHRydWUpO1xufTtcblxuLyoqXG4gKiBTZXRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICogQHBhcmFtIHtib29sZWFufSBpc1Byb21pc2VcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IHNldCA9IChzcmMsIHR5cGUsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBtYklkID0gJ291dHB1dCc7XG5cbiAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgIG9mZignb3V0cHV0LnNhdmUnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC5zYXZlSXRlbScsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0LnR5cGUnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC5nZXRGaWxlJywgbWJJZCk7XG5cbiAgICBpZiAoc3JjICYmIHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IG91dHB1dFxuICAgIGNvbnN0IGFjdHVhbFR5cGUgPSAoc3JjICYmICF0eXBlKSA/IHBhdGguZXh0bmFtZShzcmMpLnJlcGxhY2UoJy4nLCAnJykudG9Mb3dlckNhc2UoKSA6ICdwcm9taXNlJztcbiAgICBjb25zdCBvdXRwdXQgPSB7XG4gICAgICAgIHNyYzogc3JjID8gZ2V0UHdkKHNyYykgOiB1bmRlZmluZWQsXG4gICAgICAgIHR5cGU6IGFjdHVhbFR5cGUsXG4gICAgICAgIGxvZ2dlcjogYWN0dWFsVHlwZSAhPT0gJ3Byb21pc2UnID8gY29uc29sZSA6IHsgbG9nOiAoKSA9PiB7fSwgd2FybjogKCkgPT4ge30sIGVycm9yOiAoKSA9PiB7fSB9LFxuICAgICAgICBmb3JjZVxuICAgIH07XG5cbiAgICAvLyBTZXQgZXZlbnRzXG4gICAgb24oJ291dHB1dC5zYXZlJywgbWJJZCwgZGF0YSA9PiBzYXZlKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkLCBkYXRhID0+IHNhdmVJdGVtKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQudHlwZScsIG1iSWQsIChjYikgPT4gY2IoYWN0dWFsVHlwZSkpO1xuICAgIG9uKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQsIChjYikgPT4gY2IoZ2V0RmlsZShvdXRwdXQpKSk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBzZXQgfTtcbmV4cG9ydCB7IHNhdmUgfTtcbmV4cG9ydCB7IHNhdmVJdGVtIH07XG5leHBvcnQgeyBnZXRGaWxlIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBzZXQsIHNhdmUsIHNhdmVJdGVtLCBnZXRGaWxlIH07XG4iXX0=