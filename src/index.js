#!/usr/bin/env node

'use strict';
/* global Promise */

import path from 'path';
import { argv } from 'yargs';
import jsdom from 'jsdom';
import resourceLoader from 'jsdom/lib/jsdom/browser/resource-loader';
import toughCookie from 'tough-cookie';
import isArray from 'lodash/isArray.js';
import { isUrl, contains } from './utils.js';
import { get as configGet } from './config.js';

//-------------------------------------
// Functions

/**
 * Gets queried urls
 *
 * @param {object} data
 * @returns {array}
 */
const getQueriedUrls = (data) => {
    if (!data || !data.src) {
        throw new Error('A source is needed to query url');
    }

    if (typeof data.src !== 'string') {
        throw new Error('A source string is needed to query url');
    }

    const keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    const urls = keyModifiers.map(key => data.modifiers[key].map(modifier => {
        const actualSrc = data.src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), modifier);
        return actualSrc;
    })).reduce((a, b) => a.concat(b)).filter(val => !!val);

    return urls;
};

/**
 * Gets url markup
 *
 * @param {string} url
 * @returns {promise}
 */
const getUrl = (url) => new Promise((resolve, reject) => {
    if (typeof url !== 'string') {
        throw new Error('Url needs to be a string');
    }

    const options = {
        defaultEncoding: 'windows-1252',
        detectMetaCharset: true,
        // headers: config.headers,
        pool: {
            maxSockets: 6
        },
        strictSSL: true,
        // proxy: config.proxy,
        cookieJar: new toughCookie.CookieJar(null, { looseMode: true }),
        userAgent: `Node.js (${process.platform}; U; rv:${process.version}) AppleWebKit/537.36 (KHTML, like Gecko)`,
        // agent: config.agent,
        // agentClass: config.agentClass,
        agentOptions: {
            keepAlive: true,
            keepAliveMsecs: 115 * 1000
        }
    };

    // Finally download it!
    resourceLoader.download(url, options, (err, responseText) => {
        if (err) {
            return reject(err);
        }

        resolve(responseText);
    });
});

/**
 * Gets DOM from url
 *
 * @param {string} src
 * @param {string} type
 * @param {int} throttle
 * @returns {promise}
 */
const getDom = (src, type = 'url', throttle = 1000) => new Promise((resolve, reject) => {
    if (typeof src !== 'string') {
        throw new Error('A source needs to be provided');
    }

    // Need to check if url is ok
    if (type === 'url' && !isUrl(src)) {
        throw new Error('Source not valid');
    }

    // First the throttle so it doesn't make the request before
    setTimeout(() => {
        // Prepare for possible errors
        const virtualConsole = jsdom.createVirtualConsole();
        const errors = [];
        const logs = [];
        const warns = [];

        virtualConsole.on('jsdomError', error => { errors.push(error); });
        virtualConsole.on('error', error => { errors.push(error); });
        virtualConsole.on('log', log => { logs.push(log); });
        virtualConsole.on('warn', warn => { warns.push(warn); });

        const config = {
            virtualConsole,
            scripts: ['http://code.jquery.com/jquery.min.js'],
            features: {
                FetchExternalResources: ['script', 'link'],
                ProcessExternalResources: ['script'],
                SkipExternalResources: false
            },
            done: (err, window) => {
                if (err) { return reject(err); }
                resolve({ window, errors, logs, warns });
            }
        };

        // Now for the actual getting
        jsdom.env(src, config);
    }, type === 'url' ? throttle : 1);
});

/**
 * Gets single data
 *
 * @param {object} data
 * @param {object} retrieve
 * @param {int} throttle
 * @param {int} i
 * @param {array} dataArr
 * @return {promise}
 */
const getSingle = (data = [], throttle, i = 0, dataArr = []) => {
    if (!isArray(data)) {
        return new Promise(() => {
            throw new Error('Data needs to exist and be an array');
        });
    }

    // Maybe there is no more data so... lets inform
    if (!data[i] || !data[i].src) {
        return new Promise(resolve => resolve(dataArr));
    }

    // Make the request and get back
    return getDom(data[i].src, 'url', throttle).then(singleDom => {
        const $ = singleDom.window.$;
        const retrieve = data[i].retrieve || {};
        const retrieveKeys = Object.keys(retrieve);
        const results = {};

        // Lets iterate the retrieve requests
        for (let c = 0; c < retrieveKeys.length; c += 1) {
            const key = retrieveKeys[c];
            const attr = retrieve[key].attribute;
            const result = [];
            const els = $.find(retrieve[key].selector);
            const ignore = retrieve[key].ignore;

            // Lets go per element...
            for (let d = 0; d < els.length; d += 1) {
                const el = els[d];
                const single = !!attr ? el.getAttribute(attr) : el.textContent;

                !contains(ignore, single) && result.push(single);
            }

            // Lets take care of ignore and finallycache it...
            results[key] = result;
        }

        // Cache url data
        dataArr.push({
            src: data[i].src,
            result: results
        });

        // Lets get the next one in the promise
        const next = getSingle(data, throttle, i += 1, dataArr);
        return next;
    });
};

/**
 * Gather data
 *
 * @param {array} data
 * @param {number} throttle
 * @param {int} i
 * @param {array} dataResult
 * @returns {promise}
 */
const gatherData = (data = [], throttle, i = 0, dataResult = []) => {
    if (!data[i]) {
        // Maybe there is no more data so... lets inform
        return new Promise(resolve => resolve(dataResult));
    }

    if (!data[i] || typeof data[i] !== 'object') {
        return new Promise(() => {
            throw new Error('A data object is required to get the url');
        });
    }

    if (!data[i].src || typeof data[i].src !== 'string') {
        return new Promise(() => {
            throw new Error('A src is required to get the url');
        });
    }

    // Lets make the name right
    data[i].name = data[i].name || path.basename(data[i].src);

    // Create the expected object
    const urls = getQueriedUrls(data[i]).map(url => ({
        src: url, retrieve: data[i].retrieve
    }));

    // Make the single request
    return getSingle(urls, throttle)
    .then(result => {
        // Cache the result
        data[i].result = result;

        // Cache data
        dataResult.push(data[i]);

        // Lets get the next one in the promise
        const next = gatherData(data, throttle, i += 1, dataResult);
        return next;
    });
};

/**
 * Initialize scraper
 *
 * @param {object|string} config
 * @returns {promise}
 */
const run = (config) => {
    config = configGet(config);

    // Lets gather data from the src
    return gatherData(config.data, config.throttle)
    .then(data => new Promise((resolve) => {
        // Cache the result
        config.result = data;

        resolve(config);
    }));
};

//-------------------------------------
// Runtime

argv && argv.config && run(argv.config);
export { run, getUrl, getDom };

// Essentially for testing purposes
export const __testMethods__ = { run, gatherData, getSingle, getDom, getUrl, getQueriedUrls };
