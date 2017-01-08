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
    (0, _output.set)(_yargs.argv.output, _yargs.argv.force);
    (0, _index.run)(_yargs.argv.config);
} else {
    help();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vY2xpLmpzIl0sIm5hbWVzIjpbImhlbHAiLCJ0bXBsIiwiY29uc29sZSIsImxvZyIsImNvbmZpZyIsIm91dHB1dCIsImZvcmNlIl0sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7O0FBR0EsSUFBTUEsT0FBTyxTQUFQQSxJQUFPLEdBQU07QUFDZixRQUFJQyxPQUFPLEVBQVg7O0FBRUFBLFlBQVEsZ0NBQVI7QUFDQUEsWUFBUSxjQUFSO0FBQ0FBLFlBQVEsb0RBQVI7QUFDQUEsWUFBUSxtSEFBUjtBQUNBQSxZQUFRLGdKQUFSOztBQUVBO0FBQ0FDLFlBQVFDLEdBQVIsQ0FBWUYsSUFBWjtBQUNBO0FBQ0gsQ0FaRDs7QUFjQTtBQUNBOztBQUVBLElBQUksZUFBUSxZQUFLRyxNQUFiLElBQXVCLFlBQUtDLE1BQWhDLEVBQXdDO0FBQ3BDLHFCQUFJLFlBQUtBLE1BQVQsRUFBaUIsWUFBS0MsS0FBdEI7QUFDQSxvQkFBSSxZQUFLRixNQUFUO0FBQ0gsQ0FIRCxNQUdPO0FBQ0hKO0FBQ0giLCJmaWxlIjoiY2xpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBQcm9taXNlICovXG5cbmltcG9ydCB7IGFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuLi9vdXRwdXQuanMnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vaW5kZXguanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEhlbHBlciBmb3IgdGhlIGNsaVxuICovXG5jb25zdCBoZWxwID0gKCkgPT4ge1xuICAgIGxldCB0bXBsID0gJyc7XG5cbiAgICB0bXBsICs9ICdVc2FnZTogbXJjcm93bGV5IFtvcHRpb25zXVxcblxcbic7XG4gICAgdG1wbCArPSAnT3B0aW9uczpcXG5cXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1jb25maWc9PHBhdGg+ICAgICAgICBDb25maWcgZmlsZS4gUmVxdWlyZWRcXG5cXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1vdXRwdXQ9PHBhdGg+ICAgICAgICBGaWxlIHdoZXJlIHlvdSB3YW50IHRvIHNhdmUgdGhlIHJlc3VsdHMuIEZvciBub3csIG9ubHkgYGpzb25gIGlzIHN1cHBvcnRlZC4gUmVxdWlyZWRcXG5cXG4nO1xuICAgIHRtcGwgKz0gJyAgLS1mb3JjZT08ZmFsc2V8dHJ1ZT4gICBJdCBmb3JjZXMgdG8gY3JlYXRlIGEgbmV3IG91dHB1dCBmaWxlLiBJZiBmYWxzZSBhbmQgdGhlIG91dHB1dCBmaWxlIGV4aXN0cywgaXQgd2lsbCBqdXN0IHVwZGF0ZS4gRGVmYXVsdDogYGZhbHNlYFxcblxcbic7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgY29uc29sZS5sb2codG1wbCk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bnRpbWVcblxuaWYgKGFyZ3YgJiYgYXJndi5jb25maWcgJiYgYXJndi5vdXRwdXQpIHtcbiAgICBzZXQoYXJndi5vdXRwdXQsIGFyZ3YuZm9yY2UpO1xuICAgIHJ1bihhcmd2LmNvbmZpZyk7XG59IGVsc2Uge1xuICAgIGhlbHAoKTtcbn1cbiJdfQ==
