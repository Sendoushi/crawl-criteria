'use strict';
/* global Promise */

import fs from 'fs';
import path from 'path';
import uniqWith from 'lodash/uniqWith.js';
import isArray from 'lodash/isArray.js';
import merge from 'lodash/merge.js';
import { getPwd } from './utils.js';
import { on, off } from './mailbox.js';

//-------------------------------------
// Functions

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

    // Now for the save
    switch (output.type) {
    case 'promise':
    case 'middleware':
        return output.data;
    case 'csv':
        // TODO: We need to parse it
        break;
    case 'json':
    default:
        return exists ? JSON.parse(fs.readFileSync(output.src, 'utf-8')) : {};
    }
};

/**
 * Saves data into file
 *
 * @param {obejct} output
 * @param {object} data
 * @param {boolean} fromFile
 * @returns
 */
const save = (output, data, fromFile) => {
    if (!output || typeof output !== 'object') {
        throw new Error('An output object is needed');
    }

    let finalObj = data;
    data.data = data.data || [];

    if (!output.force) {
        const fileData = getFile(output) || {};
        const actualData = (fileData.data || []).concat(data.data);

        // Delete so it doesn't merge
        delete data.data;
        delete fileData.data;

        // Lets merge the data
        finalObj = merge(fileData, data);
        finalObj.data = uniqWith(actualData.reverse(),
            (a, b) => a && b && a.src === b.src && a.name === b.name
        ).filter(val => !!val);
    }

    // Now for the save
    switch (output.type) {
    case 'middleware':
        output.data = finalObj;
        !fromFile && output.fn(finalObj);
        break;
    case 'promise':
        output.data = finalObj;
        break;
    case 'csv':
        // TODO: We may need to parse it to CSV for example
        break;
    case 'json':
    default:
        if (!output.src) {
            return;
        }

        // Save the file
        fs.writeFileSync(output.src, JSON.stringify(finalObj, null, 4), { encoding: 'utf-8' });
        /* eslint-disable no-console */
        !fromFile && typeof describe === 'undefined' && console.log('File saved:', output.src);
        /* eslint-enable no-console */
    }
};

/**
 * Saves item in data
 *
 * @param {object} output
 * @param {array} data
 */
const saveItem = (output, data) => {
    if (!output || typeof output !== 'object') {
        throw new Error('An output object is needed');
    }

    const finalObj = { data: !isArray(data) ? [data] : data };

    // Type specifics
    switch (output.type) {
    case 'middleware':
        output.fn(finalObj, true);
        break;
    case 'promise':
        break;
    case 'csv':
    case 'json':
    default:
        /* eslint-disable no-console */
        typeof describe === 'undefined' && console.log('Saved item');
        /* eslint-enable no-console */
    }

    // Finally lets go for the save
    save(output, finalObj, true);
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
    off('output.saveItem', mbId);
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
    on('output.saveItem', mbId, data => saveItem(output, data));
    on('output.type', mbId, (cb) => cb(actualType));
    on('output.getFile', mbId, (cb) => cb(getFile(output)));

    return output;
};

// --------------------------------
// Export

export { set };
export { save };
export { saveItem };
export { getFile };

// Essentially for testing purposes
export const __testMethods__ = { set, save, saveItem, getFile };
