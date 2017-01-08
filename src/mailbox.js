'use strict';

let handlers = {};

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
const on = (msg, id, cb) => {
    if (typeof id === 'function') {
        cb = id;
        id = `${Math.random() * 100000}`;
    }

    if (!msg && typeof msg !== 'function') {
        throw new Error('A message handler is needed!');
    }

    if (!cb && typeof cb !== 'function') {
        throw new Error('A listener function is needed!');
    }

    // Lets see if the message is already defined and cache it
    const msgHandler = handlers[msg] || [];

    // Now lets cache it
    msgHandler.push({ id, listener: cb });
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
const off = (msg, id) => {
    if (!msg || !handlers[msg]) {
        return;
    }

    if (!id) {
        // Lets remove all messages
        handlers[msg] = undefined;
        return;
    }

    handlers[msg] = handlers[msg].filter((val) => val.id !== id);
};

/**
 * Sends message
 * @param  {string} msg
 * @param  {object} data
 */
// { title: 'msg', type: 'string', required: true }
// { title: 'data' }
const send = (msg, data) => {
    const handler = handlers[msg];

    if (!handler) {
        return;
    }

    for (let i = 0; i < handler.length; i += 1) {
        handler[i].listener(data);
    }
};

/**
 * Resets all listeners
 */
const reset = () => { handlers = {}; };

// --------------------------------
// Export

export { on };
export { off };
export { send };
export { reset };

// Essentially for testing purposes
export const __testMethods__ = { on, off, send, reset };
