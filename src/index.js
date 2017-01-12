'use strict';
/* global Promise */

import jsdom from 'jsdom';
import resourceLoader from 'jsdom/lib/jsdom/browser/resource-loader';
import toughCookie from 'tough-cookie';
import uniq from 'lodash/uniq.js';
import isArray from 'lodash/isArray.js';
import merge from 'lodash/merge.js';
import cloneDeep from 'lodash/cloneDeep.js';
import flattenDeep from 'lodash/flattenDeep.js';
import { send } from './mailbox.js';
import { isUrl, contains } from './utils.js';
import { get as configGet } from './config.js';

const MIN_UPDATE_DIFF = 518400000; // 7 days
const cache = {};

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

    const keyModifiers = Object.keys(data.modifiers || []);
    if (!keyModifiers || !keyModifiers.length) {
        return [data.src];
    }

    // Lets cache the first one
    let srcs;

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
    });

    return uniq(srcs);
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
 * @param {boolean} enableJs
 * @param {object} wait
 * @returns {promise}
 */
const getDom = (src, type = 'url', throttle = 2000, enableJs = false, wait = {}) => new Promise((resolve, reject) => {
    if (typeof src !== 'string') {
        throw new Error('A source needs to be provided');
    }

    // Need to check if url is ok
    if (type === 'url' && !isUrl(src)) {
        throw new Error('Source not valid');
    }

    // Random throttle exists to avoid time patterns which may lead to some crawler issues
    throttle = type === 'url' ? Math.round(throttle + Math.random() * throttle * 2) : 1;

    // First the throttle so it doesn't make the request before
    setTimeout(() => {
        const time = (wait.selector || enableJs) ? (wait.for || 60000) : 1;
        // Prepare for possible errors
        const virtualConsole = enableJs ? jsdom.createVirtualConsole() : undefined;
        const errors = [];
        const logs = [];
        const warns = [];

        // Set the timer to wait for and evaluate evaluation
        const waitForTimer = (window, i = 0) => setTimeout(() => {
            if (wait.selector && window.$.find(wait.selector).length === 0 && i < 10) {
                return waitForTimer(window, i + 1);
            }

            const docHtml = window.document.documentElement.innerHTML;
            const toCache = { window, docHtml, errors, logs, warns };

            // Save it
            cache[src] = toCache;

            // And resolve it
            resolve(toCache);
        }, time / 10);

        if (enableJs) {
            virtualConsole.on('jsdomError', error => { errors.push(error); });
            virtualConsole.on('error', error => { errors.push(error); });
            virtualConsole.on('log', log => { logs.push(log); });
            virtualConsole.on('warn', warn => { warns.push(warn); });
        }

        // Lets check if it exists in cache...
        if (cache[src]) {
            return waitForTimer(cache[src].window);
        }

        // If not... lets just get it
        const config = merge(getUrlConfig(), {
            virtualConsole,
            scripts: ['http://code.jquery.com/jquery.min.js'],
            features: {
                FetchExternalResources: enableJs ? ['script'] : [],
                ProcessExternalResources: enableJs ? ['script'] : [],
                SkipExternalResources: !enableJs
            }
        });

        // Now for the actual getting
        jsdom.env(src, config, (err, window) => {
            if (err) { return reject(err); }

            // Wait for selector to be available
            waitForTimer(window);
        });
    }, throttle);
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
        const els = parentEl.find(`${req.selector}`);
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

                // Ignore if the element has some "nofollow"
                if (el.getAttribute('rel') === 'nofollow') {
                    continue;
                }

                // No need to go for the content if it gots nested
                // Lets get the nested then
                single = getScrap($, $(el), req);

                // Don't add if there is no data
                if (Object.keys(single).length) {
                    result.push(single);
                }
            } else {
                // Ignore if the element has some "nofollow"
                if (el.getAttribute('rel') === 'nofollow') {
                    continue;
                }

                // No nested, get content!
                single = !!attr ? el.getAttribute(attr) : el.textContent;
                !contains(ignore, single) && result.push(single);
            }
        }

        // Lets take care of ignore and finally cache it...
        if (result.length) {
            results[key] = result;
        }
    }

    return results;
};

/**
 * Gets single data
 *
 * @param {object} srcItem
 * @param {object} originalItem
 * @return {promise}
 */
const getSingle = (srcItem, originalItem = {}) => {
    if (!srcItem || typeof srcItem !== 'object') {
        return new Promise(() => {
            throw new Error('Src item needs to exist and be a compliant object');
        });
    }

    // Lets check if we are still in the diff time
    if (
        !srcItem.src ||
        srcItem.updatedAt && (Date.now() - srcItem.updatedAt < MIN_UPDATE_DIFF) &&
        Object.keys(srcItem.result || {}).length ||
        srcItem.skip || originalItem.skip
    ) {
        return new Promise(resolve => resolve());
    }

    // Make the request and get back
    return getDom(srcItem.src, 'url', originalItem.throttle, originalItem.enableJs, originalItem.wait).then(singleDom => {
        const el = singleDom.window.$;

        // Cache data
        srcItem.result = getScrap(el, el, originalItem);
        srcItem.updatedAt = (new Date()).getTime();

        return srcItem;
    });
};

/**
 * Gather data
 *
 * @param {array} data
 * @returns {promise}
 */
const gatherData = (data = []) => {
    if (!isArray(data)) {
        return new Promise(() => {
            throw new Error('Data needs to exist and be an array');
        });
    }

    // There is no data
    if (!data.length) {
        return new Promise(resolve => resolve());
    }

    // Inform that all started
    send('output.onUpdate', data.length);

    // Lets first check if we have all data or something failed
    const failed = data.map(item => {
        if (!item || typeof item !== 'object') {
            return new Promise(() => {
                throw new Error('A data object is required to get the url');
            });
        }

        if (!item.src || typeof item.src !== 'string') {
            return new Promise(() => {
                throw new Error('A src is required to get the url');
            });
        }
    }).filter(val => val)[0];
    if (failed) { return failed; }

    // Lets go per each data member
    const promises = [];
    data.forEach((item) => {
        // Lets set the basics
        const oldResults = item.results || [];
        item.results = getQueriedUrls(item).map(url => {
            let newItem = { src: url };

            // Lets check if this exists in the old results already
            oldResults.forEach(val => {
                newItem = val.src === url ? merge(oldResults, newItem) : newItem;
            });

            return newItem;
        });

        // Now for the actual promises
        item.results.forEach(queryItem => promises.push(() =>
            getSingle(queryItem, item)
            .then(newItem => {
                send('output.saveItem', item);
                return newItem;
            })
        ));
    });

    // Lets run promises in sync
    return new Promise(resolve => resolve(promises || []))
    .then(promisesArr => {
        // Loop the promises
        const next = i => {
            const promise = promisesArr[i];
            if (!promise) { return; }

            return promise().then(() => next(i + 1));
        };

        // Lets get the first
        return next(0);
    })
    .then(() => data);
};

/**
 * Initialize scraper
 *
 * @param {object|string} baseConfig
 * @returns {promise}
 */
const run = (baseConfig) => {
    // Inform that all started
    send('output.onStart');

    const promise = new Promise((resolve) => {
        // Save the config data in case it isn't already...
        send('output.save', configGet(baseConfig));

        // Now get the full file
        send('output.getFile', (fileData) => resolve(fileData));
    })
    .then(config => {
        const gatherPromise = gatherData(config.data)
        .then(() => new Promise((resolve) => {
            // Results are already cached since the project
            // is using object/array references

            // Save the output
            send('output.save', config);

            // Inform that all ended
            send('output.onEnd');

            resolve(config);
        }));

        return gatherPromise;
    });

    return promise;
};

//-------------------------------------
// Runtime

export { run, getUrl, getDom };

// Essentially for testing purposes
export const __testMethods__ = { run, gatherData, getSingle, getDom, getScrap, getUrl, getQueriedUrls, getUrlConfig, getUserAgent };
