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
            !fromFile && typeof describe === 'undefined' && console.log('File saved:', output.src);
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
            typeof describe === 'undefined' && console.log('Saved item');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsiZ2V0RmlsZSIsIm91dHB1dCIsIkVycm9yIiwiZXhpc3RzIiwic3JjIiwiZXhpc3RzU3luYyIsInR5cGUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwic2F2ZSIsImZyb21GaWxlIiwiZmluYWxPYmoiLCJmb3JjZSIsImZpbGVEYXRhIiwiYWN0dWFsRGF0YSIsImNvbmNhdCIsInJldmVyc2UiLCJhIiwiYiIsIm5hbWUiLCJmaWx0ZXIiLCJ2YWwiLCJmbiIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsImRlc2NyaWJlIiwiY29uc29sZSIsImxvZyIsInNhdmVJdGVtIiwic2V0IiwibWJJZCIsImFjdHVhbFR5cGUiLCJleHRuYW1lIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwidW5kZWZpbmVkIiwibG9nZ2VyIiwid2FybiIsImVycm9yIiwiY2IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLENBQUNDLE1BQUQsRUFBWTtBQUN4QixRQUFJLENBQUNBLE1BQUQsSUFBVyxRQUFPQSxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWpDLEVBQTJDO0FBQ3ZDLGNBQU0sSUFBSUMsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNQyxTQUFTRixPQUFPRyxHQUFQLEdBQWEsYUFBR0MsVUFBSCxDQUFjSixPQUFPRyxHQUFyQixDQUFiLEdBQXlDLEtBQXhEOztBQUVBO0FBQ0EsWUFBUUgsT0FBT0ssSUFBZjtBQUNBLGFBQUssU0FBTDtBQUNBLGFBQUssWUFBTDtBQUNJLG1CQUFPTCxPQUFPTSxJQUFkO0FBQ0osYUFBSyxLQUFMO0FBQ0k7QUFDQTtBQUNKLGFBQUss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SUFBbEIsRUFBd0I7QUFBQSxlQUFRdEIsS0FBS1YsTUFBTCxFQUFhTSxJQUFiLENBQVI7QUFBQSxLQUF4QjtBQUNBLHFCQUFHLGlCQUFILEVBQXNCMEIsSUFBdEIsRUFBNEI7QUFBQSxlQUFRRixTQUFTOUIsTUFBVCxFQUFpQk0sSUFBakIsQ0FBUjtBQUFBLEtBQTVCO0FBQ0EscUJBQUcsYUFBSCxFQUFrQjBCLElBQWxCLEVBQXdCLFVBQUNTLEVBQUQ7QUFBQSxlQUFRQSxHQUFHUixVQUFILENBQVI7QUFBQSxLQUF4QjtBQUNBLHFCQUFHLGdCQUFILEVBQXFCRCxJQUFyQixFQUEyQixVQUFDUyxFQUFEO0FBQUEsZUFBUUEsR0FBRzFDLFFBQVFDLE1BQVIsQ0FBSCxDQUFSO0FBQUEsS0FBM0I7O0FBRUEsV0FBT0EsTUFBUDtBQUNILENBN0JEOztBQStCQTtBQUNBOztRQUVTK0IsRyxHQUFBQSxHO1FBQ0FyQixJLEdBQUFBLEk7UUFDQW9CLFEsR0FBQUEsUTtRQUNBL0IsTyxHQUFBQSxPOztBQUVUIiwiZmlsZSI6Im91dHB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1bmlxV2l0aCBmcm9tICdsb2Rhc2gvdW5pcVdpdGguanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXkuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZS5qcyc7XG5pbXBvcnQgeyBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IG9uLCBvZmYgfSBmcm9tICcuL21haWxib3guanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEdldHMgYWN0dWFsIG91dHB1dCBmcm9tIGZpbGVcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3V0cHV0XG4gKi9cbmNvbnN0IGdldEZpbGUgPSAob3V0cHV0KSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0cyA9IG91dHB1dC5zcmMgPyBmcy5leGlzdHNTeW5jKG91dHB1dC5zcmMpIDogZmFsc2U7XG5cbiAgICAvLyBOb3cgZm9yIHRoZSBzYXZlXG4gICAgc3dpdGNoIChvdXRwdXQudHlwZSkge1xuICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgIGNhc2UgJ21pZGRsZXdhcmUnOlxuICAgICAgICByZXR1cm4gb3V0cHV0LmRhdGE7XG4gICAgY2FzZSAnY3N2JzpcbiAgICAgICAgLy8gVE9ETzogV2UgbmVlZCB0byBwYXJzZSBpdFxuICAgICAgICBicmVhaztcbiAgICBjYXNlICdqc29uJzpcbiAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZXhpc3RzID8gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMob3V0cHV0LnNyYywgJ3V0Zi04JykpIDoge307XG4gICAgfVxufTtcblxuLyoqXG4gKiBTYXZlcyBkYXRhIGludG8gZmlsZVxuICpcbiAqIEBwYXJhbSB7b2JlamN0fSBvdXRwdXRcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZyb21GaWxlXG4gKiBAcmV0dXJuc1xuICovXG5jb25zdCBzYXZlID0gKG91dHB1dCwgZGF0YSwgZnJvbUZpbGUpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgbGV0IGZpbmFsT2JqID0gZGF0YTtcbiAgICBkYXRhLmRhdGEgPSBkYXRhLmRhdGEgfHwgW107XG5cbiAgICBpZiAoIW91dHB1dC5mb3JjZSkge1xuICAgICAgICBjb25zdCBmaWxlRGF0YSA9IGdldEZpbGUob3V0cHV0KSB8fCB7fTtcbiAgICAgICAgY29uc3QgYWN0dWFsRGF0YSA9IChmaWxlRGF0YS5kYXRhIHx8IFtdKS5jb25jYXQoZGF0YS5kYXRhKTtcblxuICAgICAgICAvLyBEZWxldGUgc28gaXQgZG9lc24ndCBtZXJnZVxuICAgICAgICBkZWxldGUgZGF0YS5kYXRhO1xuICAgICAgICBkZWxldGUgZmlsZURhdGEuZGF0YTtcblxuICAgICAgICAvLyBMZXRzIG1lcmdlIHRoZSBkYXRhXG4gICAgICAgIGZpbmFsT2JqID0gbWVyZ2UoZmlsZURhdGEsIGRhdGEpO1xuICAgICAgICBmaW5hbE9iai5kYXRhID0gdW5pcVdpdGgoYWN0dWFsRGF0YS5yZXZlcnNlKCksXG4gICAgICAgICAgICAoYSwgYikgPT4gYSAmJiBiICYmIGEuc3JjID09PSBiLnNyYyAmJiBhLm5hbWUgPT09IGIubmFtZVxuICAgICAgICApLmZpbHRlcih2YWwgPT4gISF2YWwpO1xuICAgIH1cblxuICAgIC8vIE5vdyBmb3IgdGhlIHNhdmVcbiAgICBzd2l0Y2ggKG91dHB1dC50eXBlKSB7XG4gICAgY2FzZSAnbWlkZGxld2FyZSc6XG4gICAgICAgIG91dHB1dC5kYXRhID0gZmluYWxPYmo7XG4gICAgICAgICFmcm9tRmlsZSAmJiBvdXRwdXQuZm4oZmluYWxPYmopO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgb3V0cHV0LmRhdGEgPSBmaW5hbE9iajtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY3N2JzpcbiAgICAgICAgLy8gVE9ETzogV2UgbWF5IG5lZWQgdG8gcGFyc2UgaXQgdG8gQ1NWIGZvciBleGFtcGxlXG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICghb3V0cHV0LnNyYykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgZmlsZVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKG91dHB1dC5zcmMsIEpTT04uc3RyaW5naWZ5KGZpbmFsT2JqLCBudWxsLCA0KSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgICAhZnJvbUZpbGUgJiYgdHlwZW9mIGRlc2NyaWJlID09PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLmxvZygnRmlsZSBzYXZlZDonLCBvdXRwdXQuc3JjKTtcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gICAgfVxufTtcblxuLyoqXG4gKiBTYXZlcyBpdGVtIGluIGRhdGFcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3V0cHV0XG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXG4gKi9cbmNvbnN0IHNhdmVJdGVtID0gKG91dHB1dCwgZGF0YSkgPT4ge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gb3V0cHV0IG9iamVjdCBpcyBuZWVkZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbE9iaiA9IHsgZGF0YTogIWlzQXJyYXkoZGF0YSkgPyBbZGF0YV0gOiBkYXRhIH07XG5cbiAgICAvLyBUeXBlIHNwZWNpZmljc1xuICAgIHN3aXRjaCAob3V0cHV0LnR5cGUpIHtcbiAgICBjYXNlICdtaWRkbGV3YXJlJzpcbiAgICAgICAgb3V0cHV0LmZuKGZpbmFsT2JqLCB0cnVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Nzdic6XG4gICAgY2FzZSAnanNvbic6XG4gICAgZGVmYXVsdDpcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgICB0eXBlb2YgZGVzY3JpYmUgPT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUubG9nKCdTYXZlZCBpdGVtJyk7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgbGV0cyBnbyBmb3IgdGhlIHNhdmVcbiAgICBzYXZlKG91dHB1dCwgZmluYWxPYmosIHRydWUpO1xufTtcblxuLyoqXG4gKiBTZXRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICogQHBhcmFtIHtib29sZWFufSBpc1Byb21pc2VcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IHNldCA9IChzcmMsIHR5cGUsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBtYklkID0gJ291dHB1dCc7XG5cbiAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgIG9mZignb3V0cHV0LnNhdmUnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC5zYXZlSXRlbScsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0LnR5cGUnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC5nZXRGaWxlJywgbWJJZCk7XG5cbiAgICBpZiAoc3JjICYmIHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU291cmNlIG5lZWRzIHRvIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuXG4gICAgLy8gU2V0IG91dHB1dFxuICAgIGNvbnN0IGFjdHVhbFR5cGUgPSAoc3JjICYmICF0eXBlKSA/IHBhdGguZXh0bmFtZShzcmMpLnJlcGxhY2UoJy4nLCAnJykudG9Mb3dlckNhc2UoKSA6ICdwcm9taXNlJztcbiAgICBjb25zdCBvdXRwdXQgPSB7XG4gICAgICAgIHNyYzogc3JjID8gZ2V0UHdkKHNyYykgOiB1bmRlZmluZWQsXG4gICAgICAgIHR5cGU6IGFjdHVhbFR5cGUsXG4gICAgICAgIGxvZ2dlcjogYWN0dWFsVHlwZSAhPT0gJ3Byb21pc2UnID8gY29uc29sZSA6IHsgbG9nOiAoKSA9PiB7fSwgd2FybjogKCkgPT4ge30sIGVycm9yOiAoKSA9PiB7fSB9LFxuICAgICAgICBmb3JjZVxuICAgIH07XG5cbiAgICAvLyBTZXQgZXZlbnRzXG4gICAgb24oJ291dHB1dC5zYXZlJywgbWJJZCwgZGF0YSA9PiBzYXZlKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQuc2F2ZUl0ZW0nLCBtYklkLCBkYXRhID0+IHNhdmVJdGVtKG91dHB1dCwgZGF0YSkpO1xuICAgIG9uKCdvdXRwdXQudHlwZScsIG1iSWQsIChjYikgPT4gY2IoYWN0dWFsVHlwZSkpO1xuICAgIG9uKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQsIChjYikgPT4gY2IoZ2V0RmlsZShvdXRwdXQpKSk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEV4cG9ydFxuXG5leHBvcnQgeyBzZXQgfTtcbmV4cG9ydCB7IHNhdmUgfTtcbmV4cG9ydCB7IHNhdmVJdGVtIH07XG5leHBvcnQgeyBnZXRGaWxlIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBzZXQsIHNhdmUsIHNhdmVJdGVtLCBnZXRGaWxlIH07XG4iXX0=