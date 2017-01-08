#!/usr/bin/env node

'use strict';
/* global Promise */

import { argv } from 'yargs';
import { set } from '../output.js';
import { run } from '../index.js';

//-------------------------------------
// Functions

/**
 * Helper for the cli
 */
const help = () => {
    let tmpl = '';

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

if (argv && argv.config && argv.output) {
    set(argv.output, argv.force);
    run(argv.config);
} else {
    help();
}
