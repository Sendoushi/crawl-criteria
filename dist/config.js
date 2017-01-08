'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STRUCT = _joi2.default.object().keys({
    projectId: _joi2.default.string().default('projectname'),
    projectName: _joi2.default.string().default('Project Name'),
    data: _joi2.default.array().items(_joi2.default.object().keys({
        src: _joi2.default.string().required(),
        name: _joi2.default.string(),
        throttle: _joi2.default.number().default(2000),
        modifiers: _joi2.default.object(),
        enableJs: _joi2.default.boolean().default(false),
        waitFor: _joi2.default.string(),
        retrieve: _joi2.default.object().required(),
        result: _joi2.default.object()
    })).required()
}).required();

//-------------------------------------
// Functions

/**
 * Verify if config is right
 * @param  {object} config
 * @return {boolean}
 */
var verify = function verify(config) {
    var result = _joi2.default.validate(config, STRUCT);
    var value = result.value;

    return result.error ? {
        error: { type: 'root', err: result.error }
    } : { value: value };
};

/**
 * Gets config
 *
 * @param {object|string} config
 * @returns {object}
 */
var get = function get(config) {
    if (typeof config === 'string') {
        config = (0, _utils.readFile)((0, _utils.getPwd)(config));
        config = JSON.parse(config);
    }

    config = verify(config);

    // Verify config
    if (!config || config.error) {
        if (config && config.error && _typeof(config.error) === 'object' && config.error.err) {
            throw new Error(config.error.err);
        }

        throw new Error(config && config.error || 'Couldn\'t validate');
    }

    return config.value;
};

//-------------------------------------
// Runtime

exports.get = get;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJuYW1lIiwidGhyb3R0bGUiLCJudW1iZXIiLCJtb2RpZmllcnMiLCJlbmFibGVKcyIsImJvb2xlYW4iLCJ3YWl0Rm9yIiwicmV0cmlldmUiLCJyZXN1bHQiLCJ2ZXJpZnkiLCJjb25maWciLCJ2YWxpZGF0ZSIsInZhbHVlIiwiZXJyb3IiLCJ0eXBlIiwiZXJyIiwiZ2V0IiwiSlNPTiIsInBhcnNlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBRUEsSUFBTUEsU0FBUyxjQUFJQyxNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDN0JDLGVBQVcsY0FBSUMsTUFBSixHQUFhQyxPQUFiLENBQXFCLGFBQXJCLENBRGtCO0FBRTdCQyxpQkFBYSxjQUFJRixNQUFKLEdBQWFDLE9BQWIsQ0FBcUIsY0FBckIsQ0FGZ0I7QUFHN0JFLFVBQU0sY0FBSUMsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlSLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUN0Q1EsYUFBSyxjQUFJTixNQUFKLEdBQWFPLFFBQWIsRUFEaUM7QUFFdENDLGNBQU0sY0FBSVIsTUFBSixFQUZnQztBQUd0Q1Msa0JBQVUsY0FBSUMsTUFBSixHQUFhVCxPQUFiLENBQXFCLElBQXJCLENBSDRCO0FBSXRDVSxtQkFBVyxjQUFJZCxNQUFKLEVBSjJCO0FBS3RDZSxrQkFBVSxjQUFJQyxPQUFKLEdBQWNaLE9BQWQsQ0FBc0IsS0FBdEIsQ0FMNEI7QUFNdENhLGlCQUFTLGNBQUlkLE1BQUosRUFONkI7QUFPdENlLGtCQUFVLGNBQUlsQixNQUFKLEdBQWFVLFFBQWIsRUFQNEI7QUFRdENTLGdCQUFRLGNBQUluQixNQUFKO0FBUjhCLEtBQWxCLENBQWxCLEVBU0ZVLFFBVEU7QUFIdUIsQ0FBbEIsRUFhWkEsUUFiWSxFQUFmOztBQWVBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTVUsU0FBUyxTQUFUQSxNQUFTLENBQUNDLE1BQUQsRUFBWTtBQUN2QixRQUFNRixTQUFTLGNBQUlHLFFBQUosQ0FBYUQsTUFBYixFQUFxQnRCLE1BQXJCLENBQWY7QUFDQSxRQUFNd0IsUUFBUUosT0FBT0ksS0FBckI7O0FBRUEsV0FBT0osT0FBT0ssS0FBUCxHQUFlO0FBQ2xCQSxlQUFPLEVBQUVDLE1BQU0sTUFBUixFQUFnQkMsS0FBS1AsT0FBT0ssS0FBNUI7QUFEVyxLQUFmLEdBRUgsRUFBRUQsWUFBRixFQUZKO0FBR0gsQ0FQRDs7QUFTQTs7Ozs7O0FBTUEsSUFBTUksTUFBTSxTQUFOQSxHQUFNLENBQUNOLE1BQUQsRUFBWTtBQUNwQixRQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUJBLGlCQUFTLHFCQUFTLG1CQUFPQSxNQUFQLENBQVQsQ0FBVDtBQUNBQSxpQkFBU08sS0FBS0MsS0FBTCxDQUFXUixNQUFYLENBQVQ7QUFDSDs7QUFFREEsYUFBU0QsT0FBT0MsTUFBUCxDQUFUOztBQUVBO0FBQ0EsUUFBSSxDQUFDQSxNQUFELElBQVdBLE9BQU9HLEtBQXRCLEVBQTZCO0FBQ3pCLFlBQUlILFVBQVVBLE9BQU9HLEtBQWpCLElBQTBCLFFBQU9ILE9BQU9HLEtBQWQsTUFBd0IsUUFBbEQsSUFBOERILE9BQU9HLEtBQVAsQ0FBYUUsR0FBL0UsRUFBb0Y7QUFDaEYsa0JBQU0sSUFBSUksS0FBSixDQUFVVCxPQUFPRyxLQUFQLENBQWFFLEdBQXZCLENBQU47QUFDSDs7QUFFRCxjQUFNLElBQUlJLEtBQUosQ0FBVVQsVUFBVUEsT0FBT0csS0FBakIsSUFBMEIsb0JBQXBDLENBQU47QUFDSDs7QUFFRCxXQUFPSCxPQUFPRSxLQUFkO0FBQ0gsQ0FsQkQ7O0FBb0JBO0FBQ0E7O1FBRVNJLEcsR0FBQUEsRzs7QUFFVCIsImZpbGUiOiJjb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBKb2kgZnJvbSAnam9pJztcbmltcG9ydCB7IHJlYWRGaWxlLCBnZXRQd2QgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuY29uc3QgU1RSVUNUID0gSm9pLm9iamVjdCgpLmtleXMoe1xuICAgIHByb2plY3RJZDogSm9pLnN0cmluZygpLmRlZmF1bHQoJ3Byb2plY3RuYW1lJyksXG4gICAgcHJvamVjdE5hbWU6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdQcm9qZWN0IE5hbWUnKSxcbiAgICBkYXRhOiBKb2kuYXJyYXkoKS5pdGVtcyhKb2kub2JqZWN0KCkua2V5cyh7XG4gICAgICAgIHNyYzogSm9pLnN0cmluZygpLnJlcXVpcmVkKCksXG4gICAgICAgIG5hbWU6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgdGhyb3R0bGU6IEpvaS5udW1iZXIoKS5kZWZhdWx0KDIwMDApLFxuICAgICAgICBtb2RpZmllcnM6IEpvaS5vYmplY3QoKSxcbiAgICAgICAgZW5hYmxlSnM6IEpvaS5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgIHdhaXRGb3I6IEpvaS5zdHJpbmcoKSxcbiAgICAgICAgcmV0cmlldmU6IEpvaS5vYmplY3QoKS5yZXF1aXJlZCgpLFxuICAgICAgICByZXN1bHQ6IEpvaS5vYmplY3QoKVxuICAgIH0pKS5yZXF1aXJlZCgpXG59KS5yZXF1aXJlZCgpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFZlcmlmeSBpZiBjb25maWcgaXMgcmlnaHRcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCB2ZXJpZnkgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gSm9pLnZhbGlkYXRlKGNvbmZpZywgU1RSVUNUKTtcbiAgICBjb25zdCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgIHJldHVybiByZXN1bHQuZXJyb3IgPyB7XG4gICAgICAgIGVycm9yOiB7IHR5cGU6ICdyb290JywgZXJyOiByZXN1bHQuZXJyb3IgfVxuICAgIH0gOiB7IHZhbHVlIH07XG59O1xuXG4vKipcbiAqIEdldHMgY29uZmlnXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldCA9IChjb25maWcpID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uZmlnID0gcmVhZEZpbGUoZ2V0UHdkKGNvbmZpZykpO1xuICAgICAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgY29uZmlnID0gdmVyaWZ5KGNvbmZpZyk7XG5cbiAgICAvLyBWZXJpZnkgY29uZmlnXG4gICAgaWYgKCFjb25maWcgfHwgY29uZmlnLmVycm9yKSB7XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmVycm9yICYmIHR5cGVvZiBjb25maWcuZXJyb3IgPT09ICdvYmplY3QnICYmIGNvbmZpZy5lcnJvci5lcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcuZXJyb3IuZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcgJiYgY29uZmlnLmVycm9yIHx8ICdDb3VsZG5cXCd0IHZhbGlkYXRlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy52YWx1ZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5leHBvcnQgeyBnZXQgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IGdldCwgdmVyaWZ5IH07XG4iXX0=