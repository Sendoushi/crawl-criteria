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
        results: _joi2.default.array()
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

    // We need to set defaults
    var value = config.value;
    value.projectId = value.projectId || 'projectname';
    value.projectName = value.projectName || 'Project Name';
    value.data = value.data.map(function (val) {
        val.name = val.name || val.src;
        val.throttle = val.throttle || 2000;
        val.results = val.results || [];

        return val;
    });

    return value;
};

//-------------------------------------
// Runtime

exports.get = get;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcuanMiXSwibmFtZXMiOlsiU1RSVUNUIiwib2JqZWN0Iiwia2V5cyIsInByb2plY3RJZCIsInN0cmluZyIsImRlZmF1bHQiLCJwcm9qZWN0TmFtZSIsImRhdGEiLCJhcnJheSIsIml0ZW1zIiwic3JjIiwicmVxdWlyZWQiLCJuYW1lIiwidGhyb3R0bGUiLCJudW1iZXIiLCJtb2RpZmllcnMiLCJlbmFibGVKcyIsImJvb2xlYW4iLCJ3YWl0Rm9yIiwicmV0cmlldmUiLCJyZXN1bHRzIiwidmVyaWZ5IiwiY29uZmlnIiwicmVzdWx0IiwidmFsaWRhdGUiLCJ2YWx1ZSIsImVycm9yIiwidHlwZSIsImVyciIsImdldCIsIkpTT04iLCJwYXJzZSIsIkVycm9yIiwibWFwIiwidmFsIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FBRUE7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFNBQVMsY0FBSUMsTUFBSixHQUFhQyxJQUFiLENBQWtCO0FBQzdCQyxlQUFXLGNBQUlDLE1BQUosR0FBYUMsT0FBYixDQUFxQixhQUFyQixDQURrQjtBQUU3QkMsaUJBQWEsY0FBSUYsTUFBSixHQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBRmdCO0FBRzdCRSxVQUFNLGNBQUlDLEtBQUosR0FBWUMsS0FBWixDQUFrQixjQUFJUixNQUFKLEdBQWFDLElBQWIsQ0FBa0I7QUFDdENRLGFBQUssY0FBSU4sTUFBSixHQUFhTyxRQUFiLEVBRGlDO0FBRXRDQyxjQUFNLGNBQUlSLE1BQUosRUFGZ0M7QUFHdENTLGtCQUFVLGNBQUlDLE1BQUosR0FBYVQsT0FBYixDQUFxQixJQUFyQixDQUg0QjtBQUl0Q1UsbUJBQVcsY0FBSWQsTUFBSixFQUoyQjtBQUt0Q2Usa0JBQVUsY0FBSUMsT0FBSixHQUFjWixPQUFkLENBQXNCLEtBQXRCLENBTDRCO0FBTXRDYSxpQkFBUyxjQUFJZCxNQUFKLEVBTjZCO0FBT3RDZSxrQkFBVSxjQUFJbEIsTUFBSixHQUFhVSxRQUFiLEVBUDRCO0FBUXRDUyxpQkFBUyxjQUFJWixLQUFKO0FBUjZCLEtBQWxCLENBQWxCLEVBU0ZHLFFBVEU7QUFIdUIsQ0FBbEIsRUFhWkEsUUFiWSxFQUFmOztBQWVBO0FBQ0E7O0FBRUE7Ozs7O0FBS0EsSUFBTVUsU0FBUyxTQUFUQSxNQUFTLENBQUNDLE1BQUQsRUFBWTtBQUN2QixRQUFNQyxTQUFTLGNBQUlDLFFBQUosQ0FBYUYsTUFBYixFQUFxQnRCLE1BQXJCLENBQWY7QUFDQSxRQUFNeUIsUUFBUUYsT0FBT0UsS0FBckI7O0FBRUEsV0FBT0YsT0FBT0csS0FBUCxHQUFlO0FBQ2xCQSxlQUFPLEVBQUVDLE1BQU0sTUFBUixFQUFnQkMsS0FBS0wsT0FBT0csS0FBNUI7QUFEVyxLQUFmLEdBRUgsRUFBRUQsWUFBRixFQUZKO0FBR0gsQ0FQRDs7QUFTQTs7Ozs7O0FBTUEsSUFBTUksTUFBTSxTQUFOQSxHQUFNLENBQUNQLE1BQUQsRUFBWTtBQUNwQixRQUFJLE9BQU9BLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUJBLGlCQUFTLHFCQUFTLG1CQUFPQSxNQUFQLENBQVQsQ0FBVDtBQUNBQSxpQkFBU1EsS0FBS0MsS0FBTCxDQUFXVCxNQUFYLENBQVQ7QUFDSDs7QUFFREEsYUFBU0QsT0FBT0MsTUFBUCxDQUFUOztBQUVBO0FBQ0EsUUFBSSxDQUFDQSxNQUFELElBQVdBLE9BQU9JLEtBQXRCLEVBQTZCO0FBQ3pCLFlBQUlKLFVBQVVBLE9BQU9JLEtBQWpCLElBQTBCLFFBQU9KLE9BQU9JLEtBQWQsTUFBd0IsUUFBbEQsSUFBOERKLE9BQU9JLEtBQVAsQ0FBYUUsR0FBL0UsRUFBb0Y7QUFDaEYsa0JBQU0sSUFBSUksS0FBSixDQUFVVixPQUFPSSxLQUFQLENBQWFFLEdBQXZCLENBQU47QUFDSDs7QUFFRCxjQUFNLElBQUlJLEtBQUosQ0FBVVYsVUFBVUEsT0FBT0ksS0FBakIsSUFBMEIsb0JBQXBDLENBQU47QUFDSDs7QUFFRDtBQUNBLFFBQU1ELFFBQVFILE9BQU9HLEtBQXJCO0FBQ0FBLFVBQU10QixTQUFOLEdBQWtCc0IsTUFBTXRCLFNBQU4sSUFBbUIsYUFBckM7QUFDQXNCLFVBQU1uQixXQUFOLEdBQW9CbUIsTUFBTW5CLFdBQU4sSUFBcUIsY0FBekM7QUFDQW1CLFVBQU1sQixJQUFOLEdBQWFrQixNQUFNbEIsSUFBTixDQUFXMEIsR0FBWCxDQUFlLGVBQU87QUFDL0JDLFlBQUl0QixJQUFKLEdBQVdzQixJQUFJdEIsSUFBSixJQUFZc0IsSUFBSXhCLEdBQTNCO0FBQ0F3QixZQUFJckIsUUFBSixHQUFlcUIsSUFBSXJCLFFBQUosSUFBZ0IsSUFBL0I7QUFDQXFCLFlBQUlkLE9BQUosR0FBY2MsSUFBSWQsT0FBSixJQUFlLEVBQTdCOztBQUVBLGVBQU9jLEdBQVA7QUFDSCxLQU5ZLENBQWI7O0FBUUEsV0FBT1QsS0FBUDtBQUNILENBOUJEOztBQWdDQTtBQUNBOztRQUVTSSxHLEdBQUFBLEc7O0FBRVQiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgSm9pIGZyb20gJ2pvaSc7XG5pbXBvcnQgeyByZWFkRmlsZSwgZ2V0UHdkIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmNvbnN0IFNUUlVDVCA9IEpvaS5vYmplY3QoKS5rZXlzKHtcbiAgICBwcm9qZWN0SWQ6IEpvaS5zdHJpbmcoKS5kZWZhdWx0KCdwcm9qZWN0bmFtZScpLFxuICAgIHByb2plY3ROYW1lOiBKb2kuc3RyaW5nKCkuZGVmYXVsdCgnUHJvamVjdCBOYW1lJyksXG4gICAgZGF0YTogSm9pLmFycmF5KCkuaXRlbXMoSm9pLm9iamVjdCgpLmtleXMoe1xuICAgICAgICBzcmM6IEpvaS5zdHJpbmcoKS5yZXF1aXJlZCgpLFxuICAgICAgICBuYW1lOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIHRocm90dGxlOiBKb2kubnVtYmVyKCkuZGVmYXVsdCgyMDAwKSxcbiAgICAgICAgbW9kaWZpZXJzOiBKb2kub2JqZWN0KCksXG4gICAgICAgIGVuYWJsZUpzOiBKb2kuYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICB3YWl0Rm9yOiBKb2kuc3RyaW5nKCksXG4gICAgICAgIHJldHJpZXZlOiBKb2kub2JqZWN0KCkucmVxdWlyZWQoKSxcbiAgICAgICAgcmVzdWx0czogSm9pLmFycmF5KClcbiAgICB9KSkucmVxdWlyZWQoKVxufSkucmVxdWlyZWQoKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBWZXJpZnkgaWYgY29uZmlnIGlzIHJpZ2h0XG4gKiBAcGFyYW0gIHtvYmplY3R9IGNvbmZpZ1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgdmVyaWZ5ID0gKGNvbmZpZykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IEpvaS52YWxpZGF0ZShjb25maWcsIFNUUlVDVCk7XG4gICAgY29uc3QgdmFsdWUgPSByZXN1bHQudmFsdWU7XG5cbiAgICByZXR1cm4gcmVzdWx0LmVycm9yID8ge1xuICAgICAgICBlcnJvcjogeyB0eXBlOiAncm9vdCcsIGVycjogcmVzdWx0LmVycm9yIH1cbiAgICB9IDogeyB2YWx1ZSB9O1xufTtcblxuLyoqXG4gKiBHZXRzIGNvbmZpZ1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fHN0cmluZ30gY29uZmlnXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBnZXQgPSAoY29uZmlnKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbmZpZyA9IHJlYWRGaWxlKGdldFB3ZChjb25maWcpKTtcbiAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuICAgIH1cblxuICAgIGNvbmZpZyA9IHZlcmlmeShjb25maWcpO1xuXG4gICAgLy8gVmVyaWZ5IGNvbmZpZ1xuICAgIGlmICghY29uZmlnIHx8IGNvbmZpZy5lcnJvcikge1xuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5lcnJvciAmJiB0eXBlb2YgY29uZmlnLmVycm9yID09PSAnb2JqZWN0JyAmJiBjb25maWcuZXJyb3IuZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnLmVycm9yLmVycik7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uZmlnICYmIGNvbmZpZy5lcnJvciB8fCAnQ291bGRuXFwndCB2YWxpZGF0ZScpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IGRlZmF1bHRzXG4gICAgY29uc3QgdmFsdWUgPSBjb25maWcudmFsdWU7XG4gICAgdmFsdWUucHJvamVjdElkID0gdmFsdWUucHJvamVjdElkIHx8ICdwcm9qZWN0bmFtZSc7XG4gICAgdmFsdWUucHJvamVjdE5hbWUgPSB2YWx1ZS5wcm9qZWN0TmFtZSB8fCAnUHJvamVjdCBOYW1lJztcbiAgICB2YWx1ZS5kYXRhID0gdmFsdWUuZGF0YS5tYXAodmFsID0+IHtcbiAgICAgICAgdmFsLm5hbWUgPSB2YWwubmFtZSB8fCB2YWwuc3JjO1xuICAgICAgICB2YWwudGhyb3R0bGUgPSB2YWwudGhyb3R0bGUgfHwgMjAwMDtcbiAgICAgICAgdmFsLnJlc3VsdHMgPSB2YWwucmVzdWx0cyB8fCBbXTtcblxuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdW50aW1lXG5cbmV4cG9ydCB7IGdldCB9O1xuXG4vLyBFc3NlbnRpYWxseSBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuZXhwb3J0IGNvbnN0IF9fdGVzdE1ldGhvZHNfXyA9IHsgZ2V0LCB2ZXJpZnkgfTtcbiJdfQ==