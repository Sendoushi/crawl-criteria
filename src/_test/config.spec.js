'use strict';
/* global describe it */

import { expect } from 'chai';
import { readFile } from '../utils.js';
import { __testMethods__ as fns } from '../config.js';

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('scraper.config', () => {
    // get
    describe('get', () => {
        it('should load config', () => {
            const result = fns.get('./src/_test/data/config.json');
            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['data']);
            expect(result).to.contain.any.keys(['projectId', 'projectName', 'data', 'throttle']);
            expect(result.data).to.be.a('array');
            expect(result.data).to.have.length.above(1);

            result.data.forEach(val => {
                expect(val).to.contain.all.keys(['src', 'retrieve']);
                expect(val).to.contain.any.keys(['src', 'name', 'retrieve', 'modifiers']);
                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
            });
        });

        it('should return a valid config', () => {
            const configObj = JSON.parse(readFile('./src/_test/data/config.json'));
            const result = fns.get(configObj);

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['data']);
            expect(result).to.contain.any.keys(['projectId', 'projectName', 'data', 'throttle']);
            expect(result.data).to.be.a('array');
            expect(result.data).to.have.length.above(1);

            result.data.forEach(val => {
                expect(val).to.contain.all.keys(['src', 'retrieve']);
                expect(val).to.contain.any.keys(['src', 'name', 'retrieve', 'modifiers']);
                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
            });
        });

        it('should fail on an invalid config', (done) => {
            try {
                fns.get({ foo: 'bar' });
                done('It should error!');
            } catch (err) {
                done();
            }
        });
    });
});
