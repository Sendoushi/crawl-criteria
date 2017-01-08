'use strict';

import Joi from 'joi';
import { readFile, getPwd } from './utils.js';

const STRUCT = Joi.object().keys({
    projectId: Joi.string().default('projectname'),
    projectName: Joi.string().default('Project Name'),
    data: Joi.array().items(Joi.object().keys({
        src: Joi.string().required(),
        name: Joi.string(),
        throttle: Joi.number().default(2000),
        modifiers: Joi.object(),
        enableJs: Joi.boolean().default(false),
        waitFor: Joi.string(),
        retrieve: Joi.object().required(),
        result: Joi.object()
    })).required()
}).required();

//-------------------------------------
// Functions

/**
 * Verify if config is right
 * @param  {object} config
 * @return {boolean}
 */
const verify = (config) => {
    const result = Joi.validate(config, STRUCT);
    const value = result.value;

    return result.error ? {
        error: { type: 'root', err: result.error }
    } : { value };
};

/**
 * Gets config
 *
 * @param {object|string} config
 * @returns {object}
 */
const get = (config) => {
    if (typeof config === 'string') {
        config = readFile(getPwd(config));
        config = JSON.parse(config);
    }

    config = verify(config);

    // Verify config
    if (!config || config.error) {
        if (config && config.error && typeof config.error === 'object' && config.error.err) {
            throw new Error(config.error.err);
        }

        throw new Error(config && config.error || 'Couldn\'t validate');
    }

    return config.value;
};

//-------------------------------------
// Runtime

export { get };

// Essentially for testing purposes
export const __testMethods__ = { get, verify };
