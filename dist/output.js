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
 * Merge arrays with objects
 *
 * @param {array} a
 * @param {array} b
 * @returns
 */
var mergeArr = function mergeArr() {
    var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var newArr = a;

    // Update old ones
    newArr.forEach(function (val1, i) {
        return b.forEach(function (val2) {
            if (val1.src !== val2.src || val1.name !== val2.name) {
                return val2;
            }
            newArr[i] = (0, _merge2.default)({}, val1, val2);
        });
    });

    // Add those that didn't make the cut
    b.forEach(function (val1) {
        var found = newArr.map(function (val2) {
            return val1.src === val2.src && val1.name === val2.name;
        }).filter(function (val) {
            return !!val;
        })[0];

        !found && newArr.push(val1);
    });

    return newArr;
};

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
        var actualData = mergeArr(fileData.data, data.data);

        // Delete so it doesn't merge
        delete data.data;
        delete fileData.data;

        // Lets merge the data
        finalObj = (0, _merge2.default)(fileData, data);
        finalObj.data = actualData;
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
    output.logger.log('[MrCrowley]', 'Saving item', '[' + output.count + '/' + output.allSrcs + ']');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsibWVyZ2VBcnIiLCJhIiwiYiIsIm5ld0FyciIsImZvckVhY2giLCJ2YWwxIiwiaSIsInNyYyIsInZhbDIiLCJuYW1lIiwiZm91bmQiLCJtYXAiLCJmaWx0ZXIiLCJ2YWwiLCJwdXNoIiwiZ2V0RmlsZSIsIm91dHB1dCIsIkVycm9yIiwiZXhpc3RzIiwiZXhpc3RzU3luYyIsInR5cGUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwic2F2ZSIsImZyb21GaWxlIiwiZmluYWxPYmoiLCJmb3JjZSIsImZpbGVEYXRhIiwiYWN0dWFsRGF0YSIsImZuIiwic3luYyIsImRpcm5hbWUiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5IiwiZW5jb2RpbmciLCJsb2dnZXIiLCJsb2ciLCJzYXZlSXRlbSIsImNvdW50IiwiYWxsU3JjcyIsInNldCIsIm1iSWQiLCJhY3R1YWxUeXBlIiwiZXh0bmFtZSIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsImhhc0NvbnNvbGUiLCJkZXNjcmliZSIsInVuZGVmaW5lZCIsImNvbnNvbGUiLCJ3YXJuIiwiZXJyb3IiLCJjYiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQU9BLElBQU1BLFdBQVcsU0FBWEEsUUFBVyxHQUFvQjtBQUFBLFFBQW5CQyxDQUFtQix1RUFBZixFQUFlO0FBQUEsUUFBWEMsQ0FBVyx1RUFBUCxFQUFPOztBQUNqQyxRQUFNQyxTQUFTRixDQUFmOztBQUVBO0FBQ0FFLFdBQU9DLE9BQVAsQ0FBZSxVQUFDQyxJQUFELEVBQU9DLENBQVA7QUFBQSxlQUFhSixFQUFFRSxPQUFGLENBQVUsZ0JBQVE7QUFDMUMsZ0JBQUlDLEtBQUtFLEdBQUwsS0FBYUMsS0FBS0QsR0FBbEIsSUFBeUJGLEtBQUtJ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QUVBLHFCQUFHLGdCQUFILEVBQXFCMkIsSUFBckIsRUFBMkI7QUFBQSxlQUFNM0IsT0FBT3FCLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQixhQUFsQixFQUFpQyxZQUFqQyxDQUFOO0FBQUEsS0FBM0I7QUFDQSxxQkFBRyxpQkFBSCxFQUFzQkssSUFBdEIsRUFBNEIsVUFBQ0YsT0FBRCxFQUFhO0FBQ3JDekIsZUFBT3lCLE9BQVAsR0FBaUJBLFdBQVd6QixPQUFPeUIsT0FBbkM7QUFDSCxLQUZEO0FBR0EscUJBQUcsY0FBSCxFQUFtQkUsSUFBbkIsRUFBeUI7QUFBQSxlQUFNM0IsT0FBT3FCLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQixhQUFsQixFQUFpQyxPQUFqQyxDQUFOO0FBQUEsS0FBekI7O0FBRUEsV0FBT3RCLE1BQVA7QUFDSCxDQTFDRDs7QUE0Q0E7QUFDQTs7UUFFUzBCLEcsR0FBQUEsRztRQUNBakIsSSxHQUFBQSxJO1FBQ0FjLFEsR0FBQUEsUTtRQUNBeEIsTyxHQUFBQSxPOztBQUVUIiwiZmlsZSI6Im91dHB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UuanMnO1xuaW1wb3J0IHsgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBvbiwgb2ZmIH0gZnJvbSAnLi9tYWlsYm94LmpzJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBNZXJnZSBhcnJheXMgd2l0aCBvYmplY3RzXG4gKlxuICogQHBhcmFtIHthcnJheX0gYVxuICogQHBhcmFtIHthcnJheX0gYlxuICogQHJldHVybnNcbiAqL1xuY29uc3QgbWVyZ2VBcnIgPSAoYSA9IFtdLCBiID0gW10pID0+IHtcbiAgICBjb25zdCBuZXdBcnIgPSBhO1xuXG4gICAgLy8gVXBkYXRlIG9sZCBvbmVzXG4gICAgbmV3QXJyLmZvckVhY2goKHZhbDEsIGkpID0+IGIuZm9yRWFjaCh2YWwyID0+IHtcbiAgICAgICAgaWYgKHZhbDEuc3JjICE9PSB2YWwyLnNyYyB8fCB2YWwxLm5hbWUgIT09IHZhbDIubmFtZSkgeyByZXR1cm4gdmFsMjsgfVxuICAgICAgICBuZXdBcnJbaV0gPSBtZXJnZSh7fSwgdmFsMSwgdmFsMik7XG4gICAgfSkpO1xuXG4gICAgLy8gQWRkIHRob3NlIHRoYXQgZGlkbid0IG1ha2UgdGhlIGN1dFxuICAgIGIuZm9yRWFjaCh2YWwxID0+IHtcbiAgICAgICAgY29uc3QgZm91bmQgPSBuZXdBcnIubWFwKHZhbDIgPT4gdmFsMS5zcmMgPT09IHZhbDIuc3JjICYmIHZhbDEubmFtZSA9PT0gdmFsMi5uYW1lKVxuICAgICAgICAuZmlsdGVyKHZhbCA9PiAhIXZhbClbMF07XG5cbiAgICAgICAgIWZvdW5kICYmIG5ld0Fyci5wdXNoKHZhbDEpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ld0Fycjtcbn07XG5cbi8qKlxuICogR2V0cyBhY3R1YWwgb3V0cHV0IGZyb20gZmlsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqL1xuY29uc3QgZ2V0RmlsZSA9IChvdXRwdXQpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzID0gb3V0cHV0LnNyYyA/IGZzLmV4aXN0c1N5bmMob3V0cHV0LnNyYykgOiBmYWxzZTtcblxuICAgIC8vIE5vdyBmb3IgdGhlIHNhdmVcbiAgICBzd2l0Y2ggKG91dHB1dC50eXBlKSB7XG4gICAgY2FzZSAncHJvbWlzZSc6XG4gICAgY2FzZSAnbWlkZGxld2FyZSc6XG4gICAgICAgIHJldHVybiBvdXRwdXQuZGF0YTtcbiAgICBjYXNlICdjc3YnOlxuICAgICAgICAvLyBUT0RPOiBXZSBuZWVkIHRvIHBhcnNlIGl0XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2pzb24nOlxuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBleGlzdHMgPyBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhvdXRwdXQuc3JjLCAndXRmLTgnKSkgOiB7fTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFNhdmVzIGRhdGEgaW50byBmaWxlXG4gKlxuICogQHBhcmFtIHtvYmVqY3R9IG91dHB1dFxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJvbUZpbGVcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHNhdmUgPSAob3V0cHV0LCBkYXRhLCBmcm9tRmlsZSkgPT4ge1xuICAgIGlmICghb3V0cHV0IHx8IHR5cGVvZiBvdXRwdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gb3V0cHV0IG9iamVjdCBpcyBuZWVkZWQnKTtcbiAgICB9XG5cbiAgICBsZXQgZmluYWxPYmogPSBkYXRhO1xuICAgIGRhdGEuZGF0YSA9IGRhdGEuZGF0YSB8fCBbXTtcblxuICAgIGlmICghb3V0cHV0LmZvcmNlKSB7XG4gICAgICAgIGNvbnN0IGZpbGVEYXRhID0gZ2V0RmlsZShvdXRwdXQpIHx8IHt9O1xuICAgICAgICBjb25zdCBhY3R1YWxEYXRhID0gbWVyZ2VBcnIoZmlsZURhdGEuZGF0YSwgZGF0YS5kYXRhKTtcblxuICAgICAgICAvLyBEZWxldGUgc28gaXQgZG9lc24ndCBtZXJnZVxuICAgICAgICBkZWxldGUgZGF0YS5kYXRhO1xuICAgICAgICBkZWxldGUgZmlsZURhdGEuZGF0YTtcblxuICAgICAgICAvLyBMZXRzIG1lcmdlIHRoZSBkYXRhXG4gICAgICAgIGZpbmFsT2JqID0gbWVyZ2UoZmlsZURhdGEsIGRhdGEpO1xuICAgICAgICBmaW5hbE9iai5kYXRhID0gYWN0dWFsRGF0YTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoZSBmaWxlXG4gICAgb3V0cHV0LmRhdGEgPSBmaW5hbE9iajtcbiAgICAhZnJvbUZpbGUgJiYgb3V0cHV0LmZuKGZpbmFsT2JqKTtcblxuICAgIGlmIChvdXRwdXQuc3JjKSB7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShvdXRwdXQuc3JjKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0LnNyYywgSlNPTi5zdHJpbmdpZnkoZmluYWxPYmosIG51bGwsIDQpLCB7IGVuY29kaW5nOiAndXRmLTgnIH0pO1xuICAgIH1cblxuICAgIG91dHB1dC5sb2dnZXIubG9nKCdbTXJDcm93bGV5XScsICdGaWxlIHNhdmVkJyk7XG59O1xuXG4vKipcbiAqIFNhdmVzIGl0ZW0gaW4gZGF0YVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcbiAqL1xuY29uc3Qgc2F2ZUl0ZW0gPSAob3V0cHV0LCBkYXRhKSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIG91dHB1dC5jb3VudCArPSAxO1xuXG4gICAgY29uc3QgZmluYWxPYmogPSB7IGRhdGE6ICFpc0FycmF5KGRhdGEpID8gW2RhdGFdIDogZGF0YSB9O1xuXG4gICAgb3V0cHV0LmZuKGZpbmFsT2JqLCB0cnVlKTtcbiAgICBvdXRwdXQubG9nZ2VyLmxvZygnW01yQ3Jvd2xleV0nLCAnU2F2aW5nIGl0ZW0nLCBgWyR7b3V0cHV0LmNvdW50fS8ke291dHB1dC5hbGxTcmNzfV1gKTtcblxuICAgIC8vIEZpbmFsbHkgbGV0cyBnbyBmb3IgdGhlIHNhdmVcbiAgICBzYXZlKG91dHB1dCwgZmluYWxPYmosIHRydWUpO1xufTtcblxuLyoqXG4gKiBTZXRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBzZXQgPSAoc3JjLCB0eXBlLCBmbiwgZm9yY2UgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IG1iSWQgPSAnb3V0cHV0JztcblxuICAgIC8vIFJlbW92ZSBvbGQgZXZlbnRzXG4gICAgb2ZmKCdvdXRwdXQuc2F2ZScsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0LnNhdmVJdGVtJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQudHlwZScsIG1iSWQpO1xuICAgIG9mZignb3V0cHV0LmdldEZpbGUnLCBtYklkKTtcblxuICAgIG9mZignb3V0cHV0Lm9uU3RhcnQnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC5vbkVuZCcsIG1iSWQpO1xuXG4gICAgaWYgKHNyYyAmJiB0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIFNldCBvdXRwdXRcbiAgICBjb25zdCBhY3R1YWxUeXBlID0gKHNyYyAmJiAhdHlwZSA/IHBhdGguZXh0bmFtZShzcmMpLnJlcGxhY2UoJy4nLCAnJykudG9Mb3dlckNhc2UoKSA6IHR5cGUpIHx8ICdwcm9taXNlJztcbiAgICBjb25zdCBoYXNDb25zb2xlID0gYWN0dWFsVHlwZSAhPT0gJ3Byb21pc2UnICYmIHR5cGVvZiBkZXNjcmliZSA9PT0gJ3VuZGVmaW5lZCc7XG4gICAgY29uc3Qgb3V0cHV0ID0ge1xuICAgICAgICBzcmM6IHNyYyA/IGdldFB3ZChzcmMpIDogdW5kZWZpbmVkLFxuICAgICAgICB0eXBlOiBhY3R1YWxUeXBlLFxuICAgICAgICBsb2dnZXI6IGhhc0NvbnNvbGUgPyBjb25zb2xlIDogeyBsb2c6ICgpID0+IHt9LCB3YXJuOiAoKSA9PiB7fSwgZXJyb3I6ICgpID0+IHt9IH0sXG4gICAgICAgIGZuOiBmbiB8fCAoKCkgPT4ge30pLFxuICAgICAgICBmb3JjZSxcbiAgICAgICAgYWxsU3JjczogMCxcbiAgICAgICAgY291bnQ6IDBcbiAgICB9O1xuXG4gICAgLy8gU2V0IGV2ZW50c1xuICAgIG9uKCdvdXRwdXQuc2F2ZScsIG1iSWQsIGRhdGEgPT4gc2F2ZShvdXRwdXQsIGRhdGEpKTtcbiAgICBvbignb3V0cHV0LnNhdmVJdGVtJywgbWJJZCwgZGF0YSA9PiBzYXZlSXRlbShvdXRwdXQsIGRhdGEpKTtcbiAgICBvbignb3V0cHV0LnR5cGUnLCBtYklkLCAoY2IpID0+IGNiKGFjdHVhbFR5cGUpKTtcbiAgICBvbignb3V0cHV0LmdldEZpbGUnLCBtYklkLCAoY2IpID0+IGNiKGdldEZpbGUob3V0cHV0KSkpO1xuXG4gICAgb24oJ291dHB1dC5vblN0YXJ0JywgbWJJZCwgKCkgPT4gb3V0cHV0LmxvZ2dlci5sb2coJ1tNckNyb3dsZXldJywgJ1N0YXJ0ZWQuLi4nKSk7XG4gICAgb24oJ291dHB1dC5vblVwZGF0ZScsIG1iSWQsIChhbGxTcmNzKSA9PiB7XG4gICAgICAgIG91dHB1dC5hbGxTcmNzID0gYWxsU3JjcyB8fCBvdXRwdXQuYWxsU3JjcztcbiAgICB9KTtcbiAgICBvbignb3V0cHV0Lm9uRW5kJywgbWJJZCwgKCkgPT4gb3V0cHV0LmxvZ2dlci5sb2coJ1tNckNyb3dsZXldJywgJ0VuZGVkJykpO1xuXG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgc2V0IH07XG5leHBvcnQgeyBzYXZlIH07XG5leHBvcnQgeyBzYXZlSXRlbSB9O1xuZXhwb3J0IHsgZ2V0RmlsZSB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgc2V0LCBzYXZlLCBzYXZlSXRlbSwgZ2V0RmlsZSwgbWVyZ2VBcnIgfTtcbiJdfQ==