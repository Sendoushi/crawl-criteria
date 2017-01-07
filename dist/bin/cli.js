#!/usr/bin/env node


'use strict';
/* global Promise */

var _yargs = require('yargs');

var _index = require('../index.js');

//-------------------------------------
// Functions

/**
 * Helper for the cli
 */
var help = function help() {
    // TODO: What about the help? Use commander and maybe get rid of yargs
};

//-------------------------------------
// Runtime

if (_yargs.argv && _yargs.argv.config) {
    (0, _index.run)(_yargs.argv.config, _yargs.argv.save);
} else {
    help();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vY2xpLmpzIl0sIm5hbWVzIjpbImhlbHAiLCJjb25maWciLCJzYXZlIl0sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7O0FBR0EsSUFBTUEsT0FBTyxTQUFQQSxJQUFPLEdBQU07QUFDZjtBQUNILENBRkQ7O0FBSUE7QUFDQTs7QUFFQSxJQUFJLGVBQVEsWUFBS0MsTUFBakIsRUFBeUI7QUFDckIsb0JBQUksWUFBS0EsTUFBVCxFQUFpQixZQUFLQyxJQUF0QjtBQUNILENBRkQsTUFFTztBQUNIRjtBQUNIIiwiZmlsZSI6ImNsaS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgUHJvbWlzZSAqL1xuXG5pbXBvcnQgeyBhcmd2IH0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vaW5kZXguanMnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZ1bmN0aW9uc1xuXG4vKipcbiAqIEhlbHBlciBmb3IgdGhlIGNsaVxuICovXG5jb25zdCBoZWxwID0gKCkgPT4ge1xuICAgIC8vIFRPRE86IFdoYXQgYWJvdXQgdGhlIGhlbHA/IFVzZSBjb21tYW5kZXIgYW5kIG1heWJlIGdldCByaWQgb2YgeWFyZ3Ncbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVudGltZVxuXG5pZiAoYXJndiAmJiBhcmd2LmNvbmZpZykge1xuICAgIHJ1bihhcmd2LmNvbmZpZywgYXJndi5zYXZlKTtcbn0gZWxzZSB7XG4gICAgaGVscCgpO1xufVxuIl19