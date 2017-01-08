'use strict';
/* global Promise */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFile = exports.save = exports.set = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _merge = require('lodash/merge.js');

var _merge2 = _interopRequireDefault(_merge);

var _utils = require('./utils.js');

var _mailbox = require('./mailbox.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-------------------------------------
// Functions

/**
 * Saves data into file
 *
 * @param {*} data
 * @returns
 */
var save = function save(output, data) {
    if (!output || (typeof output === 'undefined' ? 'undefined' : _typeof(output)) !== 'object') {
        throw new Error('An output object is needed');
    }

    var exists = output.src ? _fs2.default.existsSync(output.src) : false;
    // TODO: What if it is a csv? It needs conversion
    var fileData = exists ? JSON.parse(_fs2.default.readFileSync(output.src, 'utf-8')) : {};
    var finalData = output.force ? data : (0, _merge2.default)(fileData, data);

    // TODO: Lets log now

    if (output.type === 'csv') {
        // TODO: We may need to parse it to CSV for example
        return;
    }

    // Save the file
    output.src && _fs2.default.writeFileSync(output.src, JSON.stringify(finalData, null, 4), { encoding: 'utf-8' });
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
    // TODO: What if it is a csv? It needs conversion
    return exists ? JSON.parse(_fs2.default.readFileSync(output.src, 'utf-8')) : {};
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
exports.getFile = getFile;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vdXRwdXQuanMiXSwibmFtZXMiOlsic2F2ZSIsIm91dHB1dCIsImRhdGEiLCJFcnJvciIsImV4aXN0cyIsInNyYyIsImV4aXN0c1N5bmMiLCJmaWxlRGF0YSIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImZpbmFsRGF0YSIsImZvcmNlIiwidHlwZSIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiLCJlbmNvZGluZyIsImdldEZpbGUiLCJzZXQiLCJtYklkIiwiYWN0dWFsVHlwZSIsImV4dG5hbWUiLCJyZXBsYWNlIiwidG9Mb3dlckNhc2UiLCJ1bmRlZmluZWQiLCJsb2dnZXIiLCJjb25zb2xlIiwibG9nIiwid2FybiIsImVycm9yIiwiY2IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsT0FBTyxTQUFQQSxJQUFPLENBQUNDLE1BQUQsRUFBU0MsSUFBVCxFQUFrQjtBQUMzQixRQUFJLENBQUNELE1BQUQsSUFBVyxRQUFPQSxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWpDLEVBQTJDO0FBQ3ZDLGNBQU0sSUFBSUUsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNQyxTQUFTSCxPQUFPSSxHQUFQLEdBQWEsYUFBR0MsVUFBSCxDQUFjTCxPQUFPSSxHQUFyQixDQUFiLEdBQXlDLEtBQXhEO0FBQ0E7QUFDQSxRQUFNRSxXQUFXSCxTQUFTSSxLQUFLQyxLQUFMLENBQVcsYUFBR0MsWUFBSCxDQUFnQlQsT0FBT0ksR0FBdkIsRUFBNEIsT0FBNUIsQ0FBWCxDQUFULEdBQTRELEVBQTdFO0FBQ0EsUUFBTU0sWUFBWVYsT0FBT1csS0FBUCxHQUFlVixJQUFmLEdBQXNCLHFCQUFNSyxRQUFOLEVBQWdCTCxJQUFoQixDQUF4Qzs7QUFFQTs7QUFFQSxRQUFJRCxPQUFPWSxJQUFQLEtBQWdCLEtBQXBCLEVBQTJCO0FBQ3ZCO0FBQ0E7QUFDSDs7QUFFRDtBQUNBWixXQUFPSSxHQUFQLElBQWMsYUFBR1MsYUFBSCxDQUFpQmIsT0FBT0ksR0FBeEIsRUFBNkJHLEtBQUtPLFNBQUwsQ0FBZUosU0FBZixFQUEwQixJQUExQixFQUFnQyxDQUFoQyxDQUE3QixFQUFpRSxFQUFFSyxVQUFVLE9BQVosRUFBakUsQ0FBZDtBQUNILENBbkJEOztBQXFCQTs7Ozs7QUFLQSxJQUFNQyxVQUFVLFNBQVZBLE9BQVUsQ0FBQ2hCLE1BQUQsRUFBWTtBQUN4QixRQUFJLENBQUNBLE1BQUQsSUFBVyxRQUFPQSxNQUFQLHlDQUFPQSxNQUFQLE9BQWtCLFFBQWpDLEVBQTJDO0FBQ3ZDLGNBQU0sSUFBSUUsS0FBSixDQUFVLDRCQUFWLENBQU47QUFDSDs7QUFFRCxRQUFNQyxTQUFTSCxPQUFPSSxHQUFQLEdBQWEsYUFBR0MsVUFBSCxDQUFjTCxPQUFPSSxHQUFyQixDQUFiLEdBQXlDLEtBQXhEO0FBQ0E7QUFDQSxXQUFPRCxTQUFTSSxLQUFLQyxLQUFMLENBQVcsYUFBR0MsWUFBSCxDQUFnQlQsT0FBT0ksR0FBdkIsRUFBNEIsT0FBNUIsQ0FBWCxDQUFULEdBQTRELEVBQW5FO0FBQ0gsQ0FSRDs7QUFVQTs7Ozs7Ozs7QUFRQSxJQUFNYSxNQUFNLFNBQU5BLEdBQU0sQ0FBQ2IsR0FBRCxFQUFNUSxJQUFOLEVBQThCO0FBQUEsUUFBbEJELEtBQWtCLHVFQUFWLEtBQVU7O0FBQ3RDLFFBQU1PLE9BQU8sUUFBYjs7QUFFQTtBQUNBLHNCQUFJLGFBQUosRUFBbUJBLElBQW5CO0FBQ0Esc0JBQUksYUFBSixFQUFtQkEsSUFBbkI7QUFDQSxzQkFBSSxnQkFBSixFQUFzQkEsSUFBdEI7O0FBRUEsUUFBSWQsT0FBTyxPQUFPQSxHQUFQLEtBQWUsUUFBMUIsRUFBb0M7QUFDaEMsY0FBTSxJQUFJRixLQUFKLENBQVUsNkJBQVYsQ0FBTjtBQUNIOztBQUVEO0FBQ0EsUUFBTWlCLGFBQWNmLE9BQU8sQ0FBQ1EsSUFBVCxHQUFpQixlQUFLUSxPQUFMLENBQWFoQixHQUFiLEVBQWtCaUIsT0FBbEIsQ0FBMEIsR0FBMUIsRUFBK0IsRUFBL0IsRUFBbUNDLFdBQW5DLEVBQWpCLEdBQW9FLFNBQXZGO0FBQ0EsUUFBTXRCLFNBQVM7QUFDWEksYUFBS0EsTUFBTSxtQkFBT0EsR0FBUCxDQUFOLEdBQW9CbUIsU0FEZDtBQUVYWCxjQUFNTyxVQUZLO0FBR1hLLGdCQUFRTCxlQUFlLFNBQWYsR0FBMkJNLE9BQTNCLEdBQXFDLEVBQUVDLEtBQUssZUFBTSxDQUFFLENBQWYsRUFBaUJDLE1BQU0sZ0JBQU0sQ0FBRSxDQUEvQixFQUFpQ0MsT0FBTyxpQkFBTSxDQUFFLENBQWhELEVBSGxDO0FBSVhqQjtBQUpXLEtBQWY7O0FBT0E7QUFDQSxxQkFBRyxhQUFILEVBQWtCTyxJQUFsQixFQUF3QjtBQUFBLGVBQVFuQixLQUFLQyxNQUFMLEVBQWFDLElBQWIsQ0FBUjtBQUFBLEtBQXhCO0FBQ0EscUJBQUcsYUFBSCxFQUFrQmlCLElBQWxCLEVBQXdCLFVBQUNXLEVBQUQ7QUFBQSxlQUFRQSxHQUFHVixVQUFILENBQVI7QUFBQSxLQUF4QjtBQUNBLHFCQUFHLGdCQUFILEVBQXFCRCxJQUFyQixFQUEyQixVQUFDVyxFQUFEO0FBQUEsZUFBUUEsR0FBR2IsUUFBUWhCLE1BQVIsQ0FBSCxDQUFSO0FBQUEsS0FBM0I7O0FBRUEsV0FBT0EsTUFBUDtBQUNILENBM0JEOztBQTZCQTtBQUNBOztRQUVTaUIsRyxHQUFBQSxHO1FBQ0FsQixJLEdBQUFBLEk7UUFDQWlCLE8sR0FBQUEsTzs7QUFFVCIsImZpbGUiOiJvdXRwdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlLmpzJztcbmltcG9ydCB7IGdldFB3ZCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgb24sIG9mZiB9IGZyb20gJy4vbWFpbGJveC5qcyc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRnVuY3Rpb25zXG5cbi8qKlxuICogU2F2ZXMgZGF0YSBpbnRvIGZpbGVcbiAqXG4gKiBAcGFyYW0geyp9IGRhdGFcbiAqIEByZXR1cm5zXG4gKi9cbmNvbnN0IHNhdmUgPSAob3V0cHV0LCBkYXRhKSA9PiB7XG4gICAgaWYgKCFvdXRwdXQgfHwgdHlwZW9mIG91dHB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBvdXRwdXQgb2JqZWN0IGlzIG5lZWRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0cyA9IG91dHB1dC5zcmMgPyBmcy5leGlzdHNTeW5jKG91dHB1dC5zcmMpIDogZmFsc2U7XG4gICAgLy8gVE9ETzogV2hhdCBpZiBpdCBpcyBhIGNzdj8gSXQgbmVlZHMgY29udmVyc2lvblxuICAgIGNvbnN0IGZpbGVEYXRhID0gZXhpc3RzID8gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMob3V0cHV0LnNyYywgJ3V0Zi04JykpIDoge307XG4gICAgY29uc3QgZmluYWxEYXRhID0gb3V0cHV0LmZvcmNlID8gZGF0YSA6IG1lcmdlKGZpbGVEYXRhLCBkYXRhKTtcblxuICAgIC8vIFRPRE86IExldHMgbG9nIG5vd1xuXG4gICAgaWYgKG91dHB1dC50eXBlID09PSAnY3N2Jykge1xuICAgICAgICAvLyBUT0RPOiBXZSBtYXkgbmVlZCB0byBwYXJzZSBpdCB0byBDU1YgZm9yIGV4YW1wbGVcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhlIGZpbGVcbiAgICBvdXRwdXQuc3JjICYmIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0LnNyYywgSlNPTi5zdHJpbmdpZnkoZmluYWxEYXRhLCBudWxsLCA0KSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcbn07XG5cbi8qKlxuICogR2V0cyBhY3R1YWwgb3V0cHV0IGZyb20gZmlsZVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvdXRwdXRcbiAqL1xuY29uc3QgZ2V0RmlsZSA9IChvdXRwdXQpID0+IHtcbiAgICBpZiAoIW91dHB1dCB8fCB0eXBlb2Ygb3V0cHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIG91dHB1dCBvYmplY3QgaXMgbmVlZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzID0gb3V0cHV0LnNyYyA/IGZzLmV4aXN0c1N5bmMob3V0cHV0LnNyYykgOiBmYWxzZTtcbiAgICAvLyBUT0RPOiBXaGF0IGlmIGl0IGlzIGEgY3N2PyBJdCBuZWVkcyBjb252ZXJzaW9uXG4gICAgcmV0dXJuIGV4aXN0cyA/IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG91dHB1dC5zcmMsICd1dGYtOCcpKSA6IHt9O1xufTtcblxuLyoqXG4gKiBTZXRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICogQHBhcmFtIHtib29sZWFufSBpc1Byb21pc2VcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IHNldCA9IChzcmMsIHR5cGUsIGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBtYklkID0gJ291dHB1dCc7XG5cbiAgICAvLyBSZW1vdmUgb2xkIGV2ZW50c1xuICAgIG9mZignb3V0cHV0LnNhdmUnLCBtYklkKTtcbiAgICBvZmYoJ291dHB1dC50eXBlJywgbWJJZCk7XG4gICAgb2ZmKCdvdXRwdXQuZ2V0RmlsZScsIG1iSWQpO1xuXG4gICAgaWYgKHNyYyAmJiB0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvdXJjZSBuZWVkcyB0byBiZSBhIHN0cmluZycpO1xuICAgIH1cblxuICAgIC8vIFNldCBvdXRwdXRcbiAgICBjb25zdCBhY3R1YWxUeXBlID0gKHNyYyAmJiAhdHlwZSkgPyBwYXRoLmV4dG5hbWUoc3JjKS5yZXBsYWNlKCcuJywgJycpLnRvTG93ZXJDYXNlKCkgOiAncHJvbWlzZSc7XG4gICAgY29uc3Qgb3V0cHV0ID0ge1xuICAgICAgICBzcmM6IHNyYyA/IGdldFB3ZChzcmMpIDogdW5kZWZpbmVkLFxuICAgICAgICB0eXBlOiBhY3R1YWxUeXBlLFxuICAgICAgICBsb2dnZXI6IGFjdHVhbFR5cGUgIT09ICdwcm9taXNlJyA/IGNvbnNvbGUgOiB7IGxvZzogKCkgPT4ge30sIHdhcm46ICgpID0+IHt9LCBlcnJvcjogKCkgPT4ge30gfSxcbiAgICAgICAgZm9yY2VcbiAgICB9O1xuXG4gICAgLy8gU2V0IGV2ZW50c1xuICAgIG9uKCdvdXRwdXQuc2F2ZScsIG1iSWQsIGRhdGEgPT4gc2F2ZShvdXRwdXQsIGRhdGEpKTtcbiAgICBvbignb3V0cHV0LnR5cGUnLCBtYklkLCAoY2IpID0+IGNiKGFjdHVhbFR5cGUpKTtcbiAgICBvbignb3V0cHV0LmdldEZpbGUnLCBtYklkLCAoY2IpID0+IGNiKGdldEZpbGUob3V0cHV0KSkpO1xuXG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgc2V0IH07XG5leHBvcnQgeyBzYXZlIH07XG5leHBvcnQgeyBnZXRGaWxlIH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBzZXQsIHNhdmUsIGdldEZpbGUgfTtcbiJdfQ==