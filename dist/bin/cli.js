#!/usr/bin/env node


'use strict';
/* global Promise */

var _yargs = require('yargs');

var _output = require('../output.js');

var _index = require('../index.js');

//-------------------------------------
// Functions

/**
 * Helper for the cli
 */
var help = function help() {
    var tmpl = '';

    tmpl += 'Usage: mrcrowley [options]\n\n';
    tmpl += 'Options:\n\n';
    tmpl += '  --config=<path>        Config file. Required\n';
    tmpl += '  --output=<path>        File where you want to save the results. Only `json` is supported. Required\n';
    tmpl += '  --force=<false|true>   Forces to create a new output. When false and the output exists, it will update\n';

    /* eslint-disable no-console */
    console.log(tmpl);
    /* eslint-enable no-console */
};

//-------------------------------------
// Runtime

if (_yargs.argv && _yargs.argv.config && _yargs.argv.output) {
    (0, _output.set)(_yargs.argv.output, null, null, _yargs.argv.force);
    (0, _index.run)(_yargs.argv.config);
} else {
    help();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vY2xpLmpzIl0sIm5hbWVzIjpbImhlbHAiLCJ0bXBsIiwiY29uc29sZSIsImxvZyIsImNvbmZpZyIsIm91dHB1dCIsImZvcmNlIl0sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7O0FBR0EsSUFBTUEsT0FBTyxTQUFQQSxJQUFPLEdBQU07QUFDZixRQUFJQyxPQUFPLEVBQVg7O0FBRUFBLFlBQVEsZ0NBQVI7QUFDQUEsWUFBUSxjQUFSO0FBQ0FBLFlBQVEsa0RBQVI7QUFDQUEsWUFBUSx3R0FBUjtBQUNBQSxZQUFRLDRHQUFSOztBQUVBO0FBQ0FDLFlBQVFDLEdBQVIsQ0FBWUYsSUFBWjtBQUNBO0FBQ0gsQ0FaRDs7QUFjQTtBQUNBOztBQUVBLElBQUksZUFBUSxZQUFLRyxNQUFiLElBQXVCLFlBQUtDLE1BQWhDLEVBQXdDO0FBQ3BDLHFCQUFJLFlBQUtBLE1BQVQsRUFBaUIsSUFBakIsRUFBdUIsSUFBdkIsRUFBNkIsWUFBS0MsS0FBbEM7QUFDQSxvQkFBSSxZQUFLRixNQUFUO0FBQ0gsQ0FIRCxNQUdPO0FBQ0hKO0FBQ0giLCJmaWxlIjoiY2xpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuLi9vdXRwdXQuanMnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vaW5kZXguanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEhlbHBlciBmb3IgdGhlIGNsaVxuICovXG5jb25zdCBoZWxwID0gKCkgPT4ge1xuICAgIGxldCB0bXBsID0gJyc7XG5cbiAgICB0bXBsICs9ICdVc2FnZTogbXJjcm93bGV5IFtvcHRpb25zXVxcblxcbic7XG4gICAgdG1wbCArPSAnT3B0aW9uczpcXG5cXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1jb25maWc9PHBhdGg+ICAgICAgICBDb25maWcgZmlsZS4gUmVxdWlyZWRcXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1vdXRwdXQ9PHBhdGg+ICAgICAgICBGaWxlIHdoZXJlIHlvdSB3YW50IHRvIHNhdmUgdGhlIHJlc3VsdHMuIE9ubHkgYGpzb25gIGlzIHN1cHBvcnRlZC4gUmVxdWlyZWRcXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1mb3JjZT08ZmFsc2V8dHJ1ZT4gICBGb3JjZXMgdG8gY3JlYXRlIGEgbmV3IG91dHB1dC4gV2hlbiBmYWxzZSBhbmQgdGhlIG91dHB1dCBleGlzdHMsIGl0IHdpbGwgdXBkYXRlXFxuJztcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICBjb25zb2xlLmxvZyh0bXBsKTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5pZiAoYXJndiAmJiBhcmd2LmNvbmZpZyAmJiBhcmd2Lm91dHB1dCkge1xuICAgIHNldChhcmd2Lm91dHB1dCwgbnVsbCwgbnVsbCwgYXJndi5mb3JjZSk7XG4gICAgcnVuKGFyZ3YuY29uZmlnKTtcbn0gZWxzZSB7XG4gICAgaGVscCgpO1xufVxuIl19