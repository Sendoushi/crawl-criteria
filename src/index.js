'use strict';
/* global Promise */

import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';
import resourceLoader from 'jsdom/lib/jsdom/browser/resource-loader';
import toughCookie from 'tough-cookie';
import isArray from 'lodash/isArray.js';
import merge from 'lodash/merge.js';
import flattenDeep from 'lodash/flattenDeep.js';
import { isUrl, contains, getPwd } from './utils.js';
import { get as configGet } from './config.js';

//-------------------------------------
// Functions

/**
 * Get a random user agent
 * Used to avoid some crawling issues
 *
 * @returns {string}
 */
const getUserAgent = () => {
    const list = [
        // Chrome
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.149 Safari/537.36',
        // Edge
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
        // Firefox
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
        'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0',
        'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0',
        'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
        // IE
        'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
        'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 7.0; InfoPath.3; .NET CLR 3.1.40767; Trident/6.0; en-IN)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/4.0; InfoPath.2; SV1; .NET CLR 2.0.50727; WOW64)',
        'Mozilla/5.0 (compatible; MSIE 10.0; Macintosh; Intel Mac OS X 10_7_3; Trident/6.0)',
        'Mozilla/4.0 (Compatible; MSIE 8.0; Windows NT 5.2; Trident/6.0)',
        'Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)',
        'Mozilla/1.22 (compatible; MSIE 10.0; Windows 3.1)',
        // Safari
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
        'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'
    ];

    return list[Math.floor(Math.random() * list.length)];
};

/**
 * Get url config
 *
 * @returns {object}
 */
const getUrlConfig = () => ({
    // defaultEncoding: 'windows-1252',
    defaultEncoding: 'utf-8',
    detectMetaCharset: true,
    // headers: config.headers,
    pool: {
        maxSockets: 6
    },
    strictSSL: true,
    // TODO: What about rotating ips?
    // proxy: config.proxy,
    cookieJar: new toughCookie.CookieJar(null, { looseMode: true }),
    userAgent: getUserAgent(),
    // userAgent: `Node.js (${process.platform}; U; rv:${process.version}) AppleWebKit/537.36 (KHTML, like Gecko)`,
    // agent: config.agent,
    // agentClass: config.agentClass,
    agentOptions: {
        keepAlive: true,
        keepAliveMsecs: 115 * 1000
    }
});

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

    // TODO: What about modifiers combinations?

    const keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    // Lets cache the first one
    let srcs;

    // Lets get the first keyModifier
        // Lets get each value modifier
            // Use the original src and query it
            // Cache it
    // Lets get the second keyModifier
        // Lets get through all already set values

    // Modifiers are the keys to check
    // Its array are the value

    // Now lets go per modifier
    keyModifiers.forEach(key => {
        const modifiersSet = data.modifiers[key];
        const srcsToSet = srcs || [data.src];

        // Per each url, set each modifier
        const newSrcs = srcsToSet.map(src => modifiersSet.map(modifier => {
            const actualSrcs = [];

            if (typeof modifier === 'object') {
                const min = modifier.min || 0;
                const max = modifier.max || 10;

                for (let i = min; i < max + 1; i += 1) {
                    actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i));
                }
            } else {
                // Now for the general rule string
                actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), modifier));
            }

            return actualSrcs;
        }));

        // Lets cache it now
        srcs = flattenDeep(newSrcs).filter(val => !!val);

        // data.modifiers[key].map(modifier => {
        // // Lets go per source and set the modifier
        // urls = urls.concat([data.src]).map(src => {
        //     const actualSrcs = [];

        //     if (typeof modifier === 'object') {
        //         const min = modifier.min || 0;
        //         const max = modifier.max || 10;

        //         for (let i = min; i < max + 1; i += 1) {
        //             actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), i));
        //         }
        //     } else {
        //         // Now for the general rule string
        //         actualSrcs.push(src.replace(new RegExp(`\{\{${key}\}\}`, 'g'), modifier));
        //     }

        //     return actualSrcs;
        // });

        // // Lets flatten for the next iteration
        // urls = flattenDeep(urls).filter(val => !!val);
    });

    return srcs;
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

    // Finally download it!
    resourceLoader.download(url, getUrlConfig(), (err, responseText) => {
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
const getDom = (src, type = 'url', throttle = 2000) => new Promise((resolve, reject) => {
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

        const config = merge(getUrlConfig(), {
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
        });

        // Now for the actual getting
        jsdom.env(src, config);
    }, type === 'url' ? Math.round(throttle + Math.random() * throttle * 2) : 1);
    // Random throttle exists to avoid time patterns which may lead to some crawler issues
});

/**
 * Gets scrap from element
 *
 * @param {element} parentEl
 * @param {object} data
 * @returns {object}
 */
const getScrap = ($, parentEl, data = {}) => {
    if (!parentEl || !parentEl.find) {
        throw new Error('A compliant parent element is needed to get the scrap');
    }

    const retrieve = data.retrieve || {};
    const retrieveKeys = Object.keys(retrieve);
    const results = {};

    // Lets iterate the retrieve requests
    for (let c = 0; c < retrieveKeys.length; c += 1) {
        const key = retrieveKeys[c];
        const req = retrieve[key];
        // So that we avoid possible crawling issues
        const els = parentEl.find(`${req.selector}:not([rel="nofollow"])`);
        const nested = req.retrieve;
        const attr = req.attribute;
        const ignore = req.ignore;
        const result = [];

        // Lets go per element...
        for (let d = 0; d < els.length; d += 1) {
            const el = els[d];
            let single;

            if (nested) {
                if (!$ || !$.find) {
                    throw new Error('A compliant $ is needed to get the scrap of nested');
                }

                // No need to go for the content if it gots nested
                // Lets get the nested then
                single = getScrap($, $(el), req);
                result.push(single);
            } else {
                // No nested, get content!
                single = !!attr ? el.getAttribute(attr) : el.textContent;
                !contains(ignore, single) && result.push(single);
            }
        }

        // Lets take care of ignore and finallycache it...
        results[key] = result;
    }

    return results;
};

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
        const el = singleDom.window.$;

        // Cache url data
        dataArr.push({
            src: data[i].src,
            result: getScrap(el, el, data[i])
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
const run = (config, file) => {
    config = configGet(config);

    // Lets gather data from the src
    return gatherData(config.data, config.throttle)
    .then(data => new Promise((resolve) => {
        // Cache the result
        config.result = data;

        // Save the file
        file && fs.writeFileSync(getPwd(file), JSON.stringify(config, null, 4), { encoding: 'utf-8' });

        resolve(config);
    }));
};

//-------------------------------------
// Runtime

export { run, getUrl, getDom };

// Essentially for testing purposes
export const __testMethods__ = { run, gatherData, getSingle, getDom, getScrap, getUrl, getQueriedUrls, getUrlConfig, getUserAgent };
