'use strict';
/* global Promise */

import fs from 'fs';
import path from 'path';
import merge from 'lodash/merge.js';
import { getPwd } from './utils.js';
import { on, off } from './mailbox.js';

//-------------------------------------
// Functions

/**
 * Saves data into file
 *
 * @param {*} data
 * @returns
 */
const save = (output, data) => {
    if (!output || typeof output !== 'object') {
        throw new Error('An output object is needed');
    }

    const exists = output.src ? fs.existsSync(output.src) : false;
    // TODO: What if it is a csv? It needs conversion
    const fileData = exists ? JSON.parse(fs.readFileSync(output.src, 'utf-8')) : {};
    const finalData = output.force ? data : merge(fileData, data);

    // TODO: Lets log now

    if (output.type === 'csv') {
        // TODO: We may need to parse it to CSV for example
        return;
    }

    // Save the file
    output.src && fs.writeFileSync(output.src, JSON.stringify(finalData, null, 4), { encoding: 'utf-8' });
};

/**
 * Gets actual output from file
 *
 * @param {object} output
 */
const getFile = (output) => {
    if (!output || typeof output !== 'object') {
        throw new Error('An output object is needed');
    }

    const exists = output.src ? fs.existsSync(output.src) : false;
    // TODO: What if it is a csv? It needs conversion
    return exists ? JSON.parse(fs.readFileSync(output.src, 'utf-8')) : {};
};

/**
 * Sets
 *
 * @param {string} src
 * @param {boolean} force
 * @param {boolean} isPromise
 * @returns {object}
 */
const set = (src, type, force = false) => {
    const mbId = 'output';

    // Remove old events
    off('output.save', mbId);
    off('output.type', mbId);
    off('output.getFile', mbId);

    if (src && typeof src !== 'string') {
        throw new Error('Source needs to be a string');
    }

    // Set output
    const actualType = (src && !type) ? path.extname(src).replace('.', '').toLowerCase() : 'promise';
    const output = {
        src: src ? getPwd(src) : undefined,
        type: actualType,
        logger: actualType !== 'promise' ? console : { log: () => {}, warn: () => {}, error: () => {} },
        force
    };

    // Set events
    on('output.save', mbId, data => save(output, data));
    on('output.type', mbId, (cb) => cb(actualType));
    on('output.getFile', mbId, (cb) => cb(getFile(output)));

    return output;
};

// --------------------------------
// Export

export { set };
export { save };
export { getFile };

// Essentially for testing purposes
export const __testMethods__ = { set, save, getFile };
