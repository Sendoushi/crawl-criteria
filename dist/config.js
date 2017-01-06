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
    throttle: _joi2.default.number().default(1000),
    data: _joi2.default.array().items(_joi2.default.object().keys({
        src: _joi2.default.string().required(),
        name: _joi2.default.string(),
        modifiers: _joi2.default.object(),
        retrieve: _joi2.default.object().required()
    })).default([])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsInRocm90dGxlIiwibnVtYmVyIiwiZGF0YSIsImFycmF5IiwiaXRlbXMiLCJzcmMiLCJyZXF1aXJlZCIsIm5hbWUiLCJtb2RpZmllcnMiLCJyZXRyaWV2ZSIsInZlcmlmeSIsImNvbmZpZyIsInJlc3VsdCIsInZhbGlkYXRlIiwidmFsdWUiLCJlcnJvciIsInR5cGUiLCJlcnIiLCJnZXQiLCJKU09OIiwicGFyc2UiLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxTQUFTLGNBQUlDLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUM3QkMsZUFBVyxjQUFJQyxNQUFKLEdBQWFDLE9BQWIsQ0FBcUIsYUFBckIsQ0FEa0I7QUFFN0JDLGlCQUFhLGNBQUlGLE1BQUosR0FBYUMsT0FBYixDQUFxQixjQUFyQixDQUZnQjtBQUc3QkUsY0FBVSxjQUFJQyxNQUFKLEdBQWFILE9BQWIsQ0FBcUIsSUFBckIsQ0FIbUI7QUFJN0JJLFVBQU0sY0FBSUMsS0FBSixHQUFZQyxLQUFaLENBQWtCLGNBQUlWLE1BQUosR0FBYUMsSUFBYixDQUFrQjtBQUN0Q1UsYUFBSyxjQUFJUixNQUFKLEdBQWFTLFFBQWIsRUFEaUM7QUFFdENDLGNBQU0sY0FBSVYsTUFBSixFQUZnQztBQUd0Q1csbUJBQVcsY0FBSWQsTUFBSixFQUgyQjtBQUl0Q2Usa0JBQVUsY0FBSWYsTUFBSixHQUFhWSxRQUFiO0FBSjRCLEtBQWxCLENBQWxCLEVBS0ZSLE9BTEUsQ0FLTSxFQUxOO0FBSnVCLENBQWxCLEVBVVpRLFFBVlksRUFBZjs7QUFZQTtBQUNBOztBQUVBOzs7OztBQUtBLElBQU1JLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxNQUFELEVBQVk7QUFDdkIsUUFBTUMsU0FBUyxjQUFJQyxRQUFKLENBQWFGLE1BQWIsRUFBcUJsQixNQUFyQixDQUFmO0FBQ0EsUUFBTXFCLFFBQVFGLE9BQU9FLEtBQXJCOztBQUVBLFdBQU9GLE9BQU9HLEtBQVAsR0FBZTtBQUNsQkEsZUFBTyxFQUFFQyxNQUFNLE1BQVIsRUFBZ0JDLEtBQUtMLE9BQU9HLEtBQTVCO0FBRFcsS0FBZixHQUVILEVBQUVELFlBQUYsRUFGSjtBQUdILENBUEQ7O0FBU0E7Ozs7OztBQU1BLElBQU1JLE1BQU0sU0FBTkEsR0FBTSxDQUFDUCxNQUFELEVBQVk7QUFDcEIsUUFBSSxPQUFPQSxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO0FBQzVCQSxpQkFBUyxxQkFBUyxtQkFBT0EsTUFBUCxDQUFULENBQVQ7QUFDQUEsaUJBQVNRLEtBQUtDLEtBQUwsQ0FBV1QsTUFBWCxDQUFUO0FBQ0g7O0FBRURBLGFBQVNELE9BQU9DLE1BQVAsQ0FBVDs7QUFFQTtBQUNBLFFBQUksQ0FBQ0EsTUFBRCxJQUFXQSxPQUFPSSxLQUF0QixFQUE2QjtBQUN6QixZQUFJSixVQUFVQSxPQUFPSSxLQUFqQixJQUEwQixRQUFPSixPQUFPSSxLQUFkLE1BQXdCLFFBQWxELElBQThESixPQUFPSSxLQUFQLENBQWFFLEdBQS9FLEVBQW9GO0FBQ2hGLGtCQUFNLElBQUlJLEtBQUosQ0FBVVYsT0FBT0ksS0FBUCxDQUFhRSxHQUF2QixDQUFOO0FBQ0g7O0FBRUQsY0FBTSxJQUFJSSxLQUFKLENBQVVWLFVBQVVBLE9BQU9JLEtBQWpCLElBQTBCLG9CQUFwQyxDQUFOO0FBQ0g7O0FBRUQsV0FBT0osT0FBT0csS0FBZDtBQUNILENBbEJEOztBQW9CQTtBQUNBOztRQUVTSSxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyByZWFkRmlsZSwgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmNvbnN0IFNUUlVDVCA9IEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICBwcm9qZWN0SWQ6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdwcm9qZWN0bmFtZScpLFxuICAgIHByb2plY3ROYW1lOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgnUHJvamVjdCBOYW1lJyksXG4gICAgdGhyb3R0bGU6IEpvaS5udW1iZXIoKS5kZWZhdWx0KDEwMDApLFxuICAgIGRhdGE6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgc3JjOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKSxcbiAgICAgICAgbmFtZTogSm9pLnN0cmluZygpLFxuICAgICAgICBtb2RpZmllcnM6IEpvaS5vYmplY3QoKSxcbiAgICAgICAgcmV0cmlldmU6IEpvaS5vYmplY3QoKS5yZXF1aXJlZCgpXG4gICAgfSkpLmRlZmF1bHQoW10pXG59KS5yZXF1aXJlZCgpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIFZlcmlmeSBpZiBjb25maWcgaXMgcmlnaHRcbiAqIEBwYXJhbSAge29iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5jb25zdCB2ZXJpZnkgPSAoY29uZmlnKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gSm9pLnZhbGlkYXRlKGNvbmZpZywgU1RSVUNUKTtcbiAgICBjb25zdCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblxuICAgIHJldHVybiByZXN1bHQuZXJyb3IgPyB7XG4gICAgICAgIGVycm9yOiB7IHR5cGU6ICdyb290JywgZXJyOiByZXN1bHQuZXJyb3IgfVxuICAgIH0gOiB7IHZhbHVlIH07XG59O1xuXG4vKipcbiAqIEdldHMgY29uZmlnXG4gKlxuICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBjb25maWdcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmNvbnN0IGdldCA9IChjb25maWcpID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uZmlnID0gcmVhZEZpbGUoZ2V0UHdkKGNvbmZpZykpO1xuICAgICAgICBjb25maWcgPSBKU09OLnBhcnNlKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgY29uZmlnID0gdmVyaWZ5KGNvbmZpZyk7XG5cbiAgICAvLyBWZXJpZnkgY29uZmlnXG4gICAgaWYgKCFjb25maWcgfHwgY29uZmlnLmVycm9yKSB7XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmVycm9yICYmIHR5cGVvZiBjb25maWcuZXJyb3IgPT09ICdvYmplY3QnICYmIGNvbmZpZy5lcnJvci5lcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcuZXJyb3IuZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25maWcgJiYgY29uZmlnLmVycm9yIHx8ICdDb3VsZG5cXCd0IHZhbGlkYXRlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy52YWx1ZTtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5leHBvcnQgeyBnZXQgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IGdldCB9O1xuIl19