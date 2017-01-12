'use strict';
/* global Promise */

import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import isArray from 'lodash/isArray.js';
import merge from 'lodash/merge.js';
import { getPwd } from './utils.js';
import { on, off } from './mailbox.js';

//-------------------------------------
// Functions

/**
 * Merge arrays with objects
 *
 * @param {array} a
 * @param {array} b
 * @returns
 */
const mergeArr = (a = [], b = []) => {
    const newArr = a;

    // Update old ones
    newArr.forEach((val1, i) => b.forEach(val2 => {
        if (val1.src !== val2.src || val1.name !== val2.name) { return val2; }
        newArr[i] = merge({}, val1, val2);
    }));

    // Add those that didn't make the cut
    b.forEach(val1 => {
        const found = newArr.map(val2 => val1.src === val2.src && val1.name === val2.name)
        .filter(val => !!val)[0];

        !found && newArr.push(val1);
    });

    return newArr;
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
        const actualData = mergeArr(fileData.data, data.data);

        // Delete so it doesn't merge
        delete data.data;
        delete fileData.data;

        // Lets merge the data
        finalObj = merge(fileData, data);
        finalObj.data = actualData;
    }

    // Save the file
    output.data = finalObj;
    !fromFile && output.fn(finalObj);

    if (output.src) {
        mkdirp.sync(path.dirname(output.src));
        fs.writeFileSync(output.src, JSON.stringify(finalObj, null, 4), { encoding: 'utf-8' });
    }

    output.logger.log('[MrCrowley]', 'File saved');
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

    output.count += 1;

    const finalObj = { data: !isArray(data) ? [data] : data };

    output.fn(finalObj, true);
    output.logger.log('[MrCrowley]', 'Saving item', `[${output.count}/${output.allSrcs}]`);

    // Finally lets go for the save
    save(output, finalObj, true);
};

/**
 * Sets
 *
 * @param {string} src
 * @param {string} type
 * @param {function} fn
 * @param {boolean} force
 * @returns {object}
 */
const set = (src, type, fn, force = false) => {
    const mbId = 'output';

    // Remove old events
    off('output.save', mbId);
    off('output.saveItem', mbId);
    off('output.type', mbId);
    off('output.getFile', mbId);

    off('output.onStart', mbId);
    off('output.onEnd', mbId);

    if (src && typeof src !== 'string') {
        throw new Error('Source needs to be a string');
    }

    // Set output
    const actualType = (src && !type ? path.extname(src).replace('.', '').toLowerCase() : type) || 'promise';
    const hasConsole = actualType !== 'promise' && typeof describe === 'undefined';
    const output = {
        src: src ? getPwd(src) : undefined,
        type: actualType,
        logger: hasConsole ? console : { log: () => {}, warn: () => {}, error: () => {} },
        fn: fn || (() => {}),
        force,
        allSrcs: 0,
        count: 0
    };

    // Set events
    on('output.save', mbId, data => save(output, data));
    on('output.saveItem', mbId, data => saveItem(output, data));
    on('output.type', mbId, (cb) => cb(actualType));
    on('output.getFile', mbId, (cb) => cb(getFile(output)));

    on('output.onStart', mbId, () => output.logger.log('[MrCrowley]', 'Started...'));
    on('output.onUpdate', mbId, (allSrcs) => {
        output.allSrcs = allSrcs || output.allSrcs;
    });
    on('output.onEnd', mbId, () => output.logger.log('[MrCrowley]', 'Ended'));

    return output;
};

// --------------------------------
// Export

export { set };
export { save };
export { saveItem };
export { getFile };

// Essentially for testing purposes
export const __testMethods__ = { set, save, saveItem, getFile, mergeArr };
