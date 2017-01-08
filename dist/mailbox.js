'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var handlers = {};

// --------------------------------
// Functions

/**
 * Listens and waits for messages
 * @param  {string} msg
 * @param  {string} id
 * @param  {function} cb
 * @return {string}
 */
// { title: 'msg', type: 'string', required: true },
// { title: 'id', type: 'string', required: false },
// { title: 'cb', type: 'function' }
var on = function on(msg, id, cb) {
    if (typeof id === 'function') {
        cb = id;
        id = '' + Math.random() * 100000;
    }

    if (!msg && typeof msg !== 'function') {
        throw new Error('A message handler is needed!');
    }

    if (!cb && typeof cb !== 'function') {
        throw new Error('A listener function is needed!');
    }

    // Lets see if the message is already defined and cache it
    var msgHandler = handlers[msg] || [];

    // Now lets cache it
    msgHandler.push({ id: id, listener: cb });
    handlers[msg] = msgHandler;

    return id;
};

/**
 * Removes listener
 * @param  {string} msg
 * @param  {string} id
 */
// { title: 'msg', type: 'string', required: true },
// { title: 'id', type: 'string', required: false }
var off = function off(msg, id) {
    if (!msg || !handlers[msg]) {
        return;
    }

    if (!id) {
        // Lets remove all messages
        handlers[msg] = undefined;
        return;
    }

    handlers[msg] = handlers[msg].filter(function (val) {
        return val.id !== id;
    });
};

/**
 * Sends message
 * @param  {string} msg
 * @param  {object} data
 */
// { title: 'msg', type: 'string', required: true }
// { title: 'data' }
var send = function send(msg, data) {
    var handler = handlers[msg];

    if (!handler) {
        return;
    }

    for (var i = 0; i < handler.length; i += 1) {
        handler[i].listener(data);
    }
};

/**
 * Resets all listeners
 */
var reset = function reset() {
    handlers = {};
};

// --------------------------------
// Export

exports.on = on;
exports.off = off;
exports.send = send;
exports.reset = reset;

// Essentially for testing purposes
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWlsYm94LmpzIl0sIm5hbWVzIjpbImhhbmRsZXJzIiwib24iLCJtc2ciLCJpZCIsImNiIiwiTWF0aCIsInJhbmRvbSIsIkVycm9yIiwibXNnSGFuZGxlciIsInB1c2giLCJsaXN0ZW5lciIsIm9mZiIsInVuZGVmaW5lZCIsImZpbHRlciIsInZhbCIsInNlbmQiLCJkYXRhIiwiaGFuZGxlciIsImkiLCJsZW5ndGgiLCJyZXNldCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FBRUEsSUFBSUEsV0FBVyxFQUFmOztBQUVBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxLQUFLLFNBQUxBLEVBQUssQ0FBQ0MsR0FBRCxFQUFNQyxFQUFOLEVBQVVDLEVBQVYsRUFBaUI7QUFDeEIsUUFBSSxPQUFPRCxFQUFQLEtBQWMsVUFBbEIsRUFBOEI7QUFDMUJDLGFBQUtELEVBQUw7QUFDQUEsa0JBQVFFLEtBQUtDLE1BQUwsS0FBZ0IsTUFBeEI7QUFDSDs7QUFFRCxRQUFJLENBQUNKLEdBQUQsSUFBUSxPQUFPQSxHQUFQLEtBQWUsVUFBM0IsRUFBdUM7QUFDbkMsY0FBTSxJQUFJSyxLQUFKLENBQVUsOEJBQVYsQ0FBTjtBQUNIOztBQUVELFFBQUksQ0FBQ0gsRUFBRCxJQUFPLE9BQU9BLEVBQVAsS0FBYyxVQUF6QixFQUFxQztBQUNqQyxjQUFNLElBQUlHLEtBQUosQ0FBVSxnQ0FBVixDQUFOO0FBQ0g7O0FBRUQ7QUFDQSxRQUFNQyxhQUFhUixTQUFTRSxHQUFULEtBQWlCLEVBQXBDOztBQUVBO0FBQ0FNLGVBQVdDLElBQVgsQ0FBZ0IsRUFBRU4sTUFBRixFQUFNTyxVQUFVTixFQUFoQixFQUFoQjtBQUNBSixhQUFTRSxHQUFULElBQWdCTSxVQUFoQjs7QUFFQSxXQUFPTCxFQUFQO0FBQ0gsQ0F0QkQ7O0FBd0JBOzs7OztBQUtBO0FBQ0E7QUFDQSxJQUFNUSxNQUFNLFNBQU5BLEdBQU0sQ0FBQ1QsR0FBRCxFQUFNQyxFQUFOLEVBQWE7QUFDckIsUUFBSSxDQUFDRCxHQUFELElBQVEsQ0FBQ0YsU0FBU0UsR0FBVCxDQUFiLEVBQTRCO0FBQ3hCO0FBQ0g7O0FBRUQsUUFBSSxDQUFDQyxFQUFMLEVBQVM7QUFDTDtBQUNBSCxpQkFBU0UsR0FBVCxJQUFnQlUsU0FBaEI7QUFDQTtBQUNIOztBQUVEWixhQUFTRSxHQUFULElBQWdCRixTQUFTRSxHQUFULEVBQWNXLE1BQWQsQ0FBcUIsVUFBQ0MsR0FBRDtBQUFBLGVBQVNBLElBQUlYLEVBQUosS0FBV0EsRUFBcEI7QUFBQSxLQUFyQixDQUFoQjtBQUNILENBWkQ7O0FBY0E7Ozs7O0FBS0E7QUFDQTtBQUNBLElBQU1ZLE9BQU8sU0FBUEEsSUFBTyxDQUFDYixHQUFELEVBQU1jLElBQU4sRUFBZTtBQUN4QixRQUFNQyxVQUFVakIsU0FBU0UsR0FBVCxDQUFoQjs7QUFFQSxRQUFJLENBQUNlLE9BQUwsRUFBYztBQUNWO0FBQ0g7O0FBRUQsU0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlELFFBQVFFLE1BQTVCLEVBQW9DRCxLQUFLLENBQXpDLEVBQTRDO0FBQ3hDRCxnQkFBUUMsQ0FBUixFQUFXUixRQUFYLENBQW9CTSxJQUFwQjtBQUNIO0FBQ0osQ0FWRDs7QUFZQTs7O0FBR0EsSUFBTUksUUFBUSxTQUFSQSxLQUFRLEdBQU07QUFBRXBCLGVBQVcsRUFBWDtBQUFnQixDQUF0Qzs7QUFFQTtBQUNBOztRQUVTQyxFLEdBQUFBLEU7UUFDQVUsRyxHQUFBQSxHO1FBQ0FJLEksR0FBQUEsSTtRQUNBSyxLLEdBQUFBLEs7O0FBRVQiLCJmaWxlIjoibWFpbGJveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxubGV0IGhhbmRsZXJzID0ge307XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGdW5jdGlvbnNcblxuLyoqXG4gKiBMaXN0ZW5zIGFuZCB3YWl0cyBmb3IgbWVzc2FnZXNcbiAqIEBwYXJhbSAge3N0cmluZ30gbXNnXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGlkXG4gKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2JcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuLy8geyB0aXRsZTogJ21zZycsIHR5cGU6ICdzdHJpbmcnLCByZXF1aXJlZDogdHJ1ZSB9LFxuLy8geyB0aXRsZTogJ2lkJywgdHlwZTogJ3N0cmluZycsIHJlcXVpcmVkOiBmYWxzZSB9LFxuLy8geyB0aXRsZTogJ2NiJywgdHlwZTogJ2Z1bmN0aW9uJyB9XG5jb25zdCBvbiA9IChtc2csIGlkLCBjYikgPT4ge1xuICAgIGlmICh0eXBlb2YgaWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2IgPSBpZDtcbiAgICAgICAgaWQgPSBgJHtNYXRoLnJhbmRvbSgpICogMTAwMDAwfWA7XG4gICAgfVxuXG4gICAgaWYgKCFtc2cgJiYgdHlwZW9mIG1zZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgbWVzc2FnZSBoYW5kbGVyIGlzIG5lZWRlZCEnKTtcbiAgICB9XG5cbiAgICBpZiAoIWNiICYmIHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgbGlzdGVuZXIgZnVuY3Rpb24gaXMgbmVlZGVkIScpO1xuICAgIH1cblxuICAgIC8vIExldHMgc2VlIGlmIHRoZSBtZXNzYWdlIGlzIGFscmVhZHkgZGVmaW5lZCBhbmQgY2FjaGUgaXRcbiAgICBjb25zdCBtc2dIYW5kbGVyID0gaGFuZGxlcnNbbXNnXSB8fCBbXTtcblxuICAgIC8vIE5vdyBsZXRzIGNhY2hlIGl0XG4gICAgbXNnSGFuZGxlci5wdXNoKHsgaWQsIGxpc3RlbmVyOiBjYiB9KTtcbiAgICBoYW5kbGVyc1ttc2ddID0gbXNnSGFuZGxlcjtcblxuICAgIHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsaXN0ZW5lclxuICogQHBhcmFtICB7c3RyaW5nfSBtc2dcbiAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAqL1xuLy8geyB0aXRsZTogJ21zZycsIHR5cGU6ICdzdHJpbmcnLCByZXF1aXJlZDogdHJ1ZSB9LFxuLy8geyB0aXRsZTogJ2lkJywgdHlwZTogJ3N0cmluZycsIHJlcXVpcmVkOiBmYWxzZSB9XG5jb25zdCBvZmYgPSAobXNnLCBpZCkgPT4ge1xuICAgIGlmICghbXNnIHx8ICFoYW5kbGVyc1ttc2ddKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIC8vIExldHMgcmVtb3ZlIGFsbCBtZXNzYWdlc1xuICAgICAgICBoYW5kbGVyc1ttc2ddID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaGFuZGxlcnNbbXNnXSA9IGhhbmRsZXJzW21zZ10uZmlsdGVyKCh2YWwpID0+IHZhbC5pZCAhPT0gaWQpO1xufTtcblxuLyoqXG4gKiBTZW5kcyBtZXNzYWdlXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG1zZ1xuICogQHBhcmFtICB7b2JqZWN0fSBkYXRhXG4gKi9cbi8vIHsgdGl0bGU6ICdtc2cnLCB0eXBlOiAnc3RyaW5nJywgcmVxdWlyZWQ6IHRydWUgfVxuLy8geyB0aXRsZTogJ2RhdGEnIH1cbmNvbnN0IHNlbmQgPSAobXNnLCBkYXRhKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzW21zZ107XG5cbiAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBoYW5kbGVyW2ldLmxpc3RlbmVyKGRhdGEpO1xuICAgIH1cbn07XG5cbi8qKlxuICogUmVzZXRzIGFsbCBsaXN0ZW5lcnNcbiAqL1xuY29uc3QgcmVzZXQgPSAoKSA9PiB7IGhhbmRsZXJzID0ge307IH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcblxuZXhwb3J0IHsgb24gfTtcbmV4cG9ydCB7IG9mZiB9O1xuZXhwb3J0IHsgc2VuZCB9O1xuZXhwb3J0IHsgcmVzZXQgfTtcblxuLy8gRXNzZW50aWFsbHkgZm9yIHRlc3RpbmcgcHVycG9zZXNcbmV4cG9ydCBjb25zdCBfX3Rlc3RNZXRob2RzX18gPSB7IG9uLCBvZmYsIHNlbmQsIHJlc2V0IH07XG4iXX0=