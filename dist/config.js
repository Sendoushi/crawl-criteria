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
        retrieve: _joi2.default.object().required(),
        enableJs: _joi2.default.boolean().default(false),
        wait: {
            selector: _joi2.default.string(),
            for: _joi2.default.number().default(5000)
        },
        results: _joi2.default.array().items(_joi2.default.object().keys({
            src: _joi2.default.string().required(),
            result: _joi2.default.array().items(_joi2.default.string()).required(),
            updatedAt: _joi2.default.number(),
            skip: _joi2.default.boolean().default(false)
        }))
    })).required()
}).required();

// TODO: Retries, skip, json schema

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

    // We need to set defaults
    var value = config.value;
    value.projectId = value.projectId || 'projectname';
    value.projectName = value.projectName || 'Project Name';
    value.data = (value.data || []).map(function (val) {
        val.name = val.name || val.src;
        val.throttle = val.throttle || 2000;
        val.results = val.results || [];
        val.modifiers = val.modifiers || {};
        val.enableJs = val.enableJs || false;
        val.wait = val.wait || {};
        val.wait.for = val.wait.for || (val.wait.selector ? 5000 : 1);

        return val;
    });

    return value;
};

//-------------------------------------
// Runtime

exports.get = get;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJuYW1lIiwidGhyb3R0bGUiLCJudW1iZXIiLCJtb2RpZmllcnMiLCJyZXRyaWV2ZSIsImVuYWJsZUpzIiwiYm9vbGVhbiIsIndhaXQiLCJzZWxlY3RvciIsImZvciIsInJlc3VsdHMiLCJyZXN1bHQiLCJ1cGRhdGVkQXQiLCJza2lwIiwidmVyaWZ5IiwiY29uZmlnIiwidmFsaWRhdGUiLCJ2YWx1ZSIsImVycm9yIiwidHlwZSIsImVyciIsImdldCIsIkpTT04iLCJwYXJzZSIsIkVycm9yIiwibWFwIiwidmFsIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFNBQVMsY0FBSUMsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQzdCQyxlQUFXLGNBQUlDLE1BQUosR0FBYUMsT0FBYixDQUFxQixhQUFyQixDQURrQjtBQUU3QkMsaUJBQWEsY0FBSUYsTUFBSixHQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBRmdCO0FBRzdCRSxVQUFNLGNBQUlDLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJUixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDdENRLGFBQUssY0FBSU4sTUFBSixHQUFhTyxRQUFiLEVBRGlDO0FBRXRDQyxjQUFNLGNBQUlSLE1BQUosRUFGZ0M7QUFHdENTLGtCQUFVLGNBQUlDLE1BQUosR0FBYVQsT0FBYixDQUFxQixJQUFyQixDQUg0QjtBQUl0Q1UsbUJBQVcsY0FBSWQsTUFBSixFQUoyQjtBQUt0Q2Usa0JBQVUsY0FBSWYsTUFBSixHQUFhVSxRQUFiLEVBTDRCO0FBTXRDTSxrQkFBVSxjQUFJQyxPQUFKLEdBQWNiLE9BQWQsQ0FBc0IsS0FBdEIsQ0FONEI7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aUJpQixJQUFJbkIsSUFBSixDQUFTQyxRQUFULEdBQW9CLElBQXBCLEdBQTJCLENBQTVDLENBQWY7O0FBRUEsZUFBT2tCLEdBQVA7QUFDSCxLQVZZLENBQWI7O0FBWUEsV0FBT1QsS0FBUDtBQUNILENBbENEOztBQW9DQTtBQUNBOztRQUVTSSxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyByZWFkRmlsZSwgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmNvbnN0IFNUUlVDVCA9IEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICBwcm9qZWN0SWQ6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdwcm9qZWN0bmFtZScpLFxuICAgIHByb2plY3ROYW1lOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgnUHJvamVjdCBOYW1lJyksXG4gICAgZGF0YTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLm9iamVjdCgpLmtleXMoe1xuICAgICAgICBzcmM6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICBuYW1lOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIHRocm90dGxlOiBKb2kubnVtYmVyKCkuZGVmYXVsdCgyMDAwKSxcbiAgICAgICAgbW9kaWZpZXJzOiBKb2kub2JqZWN0KCksXG4gICAgICAgIHJldHJpZXZlOiBKb2kub2JqZWN0KCkucmVxdWlyZWQoKSxcbiAgICAgICAgZW5hYmxlSnM6IEpvaS5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgIHdhaXQ6IHtcbiAgICAgICAgICAgIHNlbGVjdG9yOiBKb2kuc3RyaW5nKCksXG4gICAgICAgICAgICBmb3I6IEpvaS5udW1iZXIoKS5kZWZhdWx0KDUwMDApXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdHM6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICAgICAgICAgIHNyYzogSm9pLnN0cmluZygpLnJlcXVpcmVkKCksXG4gICAgICAgICAgICByZXN1bHQ6IEpvaS5hcnJheSgpLml0ZW1zKEpvaS5zdHJpbmcoKSkucmVxdWlyZWQoKSxcbiAgICAgICAgICAgIHVwZGF0ZWRBdDogSm9pLm51bWJlcigpLFxuICAgICAgICAgICAgc2tpcDogSm9pLmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKVxuICAgICAgICB9KSlcbiAgICB9KSkucmVxdWlyZWQoKVxufSkucmVxdWlyZWQoKTtcblxuLy8gVE9ETzogUmV0cmllcywgc2tpcCwganNvbiBzY2hlbWFcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBWZXJpZnkgaWYgY29uZmlnIGlzIHJpZ2h0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgdmVyaWZ5ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IEpvaS52YWxpZGF0ZShjb25maWcsIFNUUlVDVCk7XG4gICAgY29uc3QgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICByZXR1cm4gcmVzdWx0LmVycm9yID8ge1xuICAgICAgICBlcnJvcjogeyB0eXBlOiAncm9vdCcsIGVycjogcmVzdWx0LmVycm9yIH1cbiAgICB9IDogeyB2YWx1ZSB9O1xufTtcblxuLyoqXG4gKiBHZXRzIGNvbmZpZ1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXQgPSAoY29uZmlnKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZyA9IHJlYWRGaWxlKGdldFB3ZChjb25maWcpKTtcbiAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cblxuICAgIGNvbmZpZyA9IHZlcmlmeShjb25maWcpO1xuXG4gICAgLy8gVmVyaWZ5IGNvbmZpZ1xuICAgIGlmICghY29uZmlnIHx8IGNvbmZpZy5lcnJvcikge1xuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5lcnJvciAmJiB0eXBlb2YgY29uZmlnLmVycm9yID09PSAnb2JqZWN0JyAmJiBjb25maWcuZXJyb3IuZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnLmVycm9yLmVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnICYmIGNvbmZpZy5lcnJvciB8fCAnQ291bGRuXFwndCB2YWxpZGF0ZScpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IGRlZmF1bHRzXG4gICAgY29uc3QgdmFsdWUgPSBjb25maWcudmFsdWU7XG4gICAgdmFsdWUucHJvamVjdElkID0gdmFsdWUucHJvamVjdElkIHx8ICdwcm9qZWN0bmFtZSc7XG4gICAgdmFsdWUucHJvamVjdE5hbWUgPSB2YWx1ZS5wcm9qZWN0TmFtZSB8fCAnUHJvamVjdCBOYW1lJztcbiAgICB2YWx1ZS5kYXRhID0gKHZhbHVlLmRhdGEgfHwgW10pLm1hcCh2YWwgPT4ge1xuICAgICAgICB2YWwubmFtZSA9IHZhbC5uYW1lIHx8IHZhbC5zcmM7XG4gICAgICAgIHZhbC50aHJvdHRsZSA9IHZhbC50aHJvdHRsZSB8fCAyMDAwO1xuICAgICAgICB2YWwucmVzdWx0cyA9IHZhbC5yZXN1bHRzIHx8IFtdO1xuICAgICAgICB2YWwubW9kaWZpZXJzID0gdmFsLm1vZGlmaWVycyB8fCB7fTtcbiAgICAgICAgdmFsLmVuYWJsZUpzID0gdmFsLmVuYWJsZUpzIHx8IGZhbHNlO1xuICAgICAgICB2YWwud2FpdCA9IHZhbC53YWl0IHx8IHt9O1xuICAgICAgICB2YWwud2FpdC5mb3IgPSB2YWwud2FpdC5mb3IgfHwgKHZhbC53YWl0LnNlbGVjdG9yID8gNTAwMCA6IDEpO1xuXG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdmFsdWU7XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuZXhwb3J0IHsgZ2V0IH07XG5cbi8vIEVzc2VudGlhbGx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5leHBvcnQgY29uc3QgX190ZXN0TWV0aG9kc19fID0geyBnZXQsIHZlcmlmeSB9O1xuIl19