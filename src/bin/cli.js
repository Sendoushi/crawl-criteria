#!/usr/bin/env node

'use strict';
/* global Promise */

import { argv } from 'yargs';
import { run } from '../index.js';

//-------------------------------------
// Functions

/**
 * Helper for the cli
 */
const help = () => {
    // TODO: What about the help? Use commander and maybe get rid of yargs
};

//-------------------------------------
// Runtime

if (argv && argv.config) {
    run(argv.config, argv.save);
} else {
    help();
}
