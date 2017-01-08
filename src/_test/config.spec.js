'use strict';
/* global describe it */

import { expect } from 'chai';
import { getPwd } from '../utils.js';
import { __testMethods__ as fns } from '../config.js';

const pathConfig = './src/_test/data/config.json';
const pwdConfig = getPwd(pathConfig);

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('mrcrowley.config', () => {
    // verify
    describe('verify', () => {
        it('should verify object', () => {
            const configObj = require(pwdConfig);
            let result = fns.verify(configObj);

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['value']);
            expect(result.value).to.be.an('object');

            result = result.value;
            expect(result).to.contain.all.keys(['data']);
            expect(result).to.contain.any.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.a('array');
            expect(result.data).to.have.length.above(1);

            result.data.forEach(val => {
                expect(val).to.contain.all.keys(['src', 'retrieve']);
                expect(val).to.contain.any.keys(['src', 'name', 'retrieve', 'modifiers', 'enableJs', 'throttle']);
                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
            });
        });

        it('should get error with non compliant object', () => {
            const result = fns.verify({
                projectId: 'test',
                projectName: 'Test'
            });

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['error']);
            expect(result.error).to.be.an('object');
            expect(result.error).to.contain.all.keys(['type', 'err']);
        });
    });

    // get
    describe('get', () => {
        it('should load config', () => {
            const result = fns.get(pathConfig);
            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['data']);
            expect(result).to.contain.any.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.a('array');
            expect(result.data).to.have.length.above(1);

            result.data.forEach(val => {
                expect(val).to.contain.all.keys(['src', 'retrieve']);
                expect(val).to.contain.any.keys(['src', 'name', 'retrieve', 'modifiers', 'enableJs', 'throttle']);
                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
            });
        });

        it('should return a valid config', () => {
            const configObj = require(pwdConfig);
            const result = fns.get(configObj);

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['data']);
            expect(result).to.contain.any.keys(['projectId', 'projectName', 'data']);
            expect(result.data).to.be.a('array');
            expect(result.data).to.have.length.above(1);

            result.data.forEach(val => {
                expect(val).to.contain.all.keys(['src', 'retrieve']);
                expect(val).to.contain.any.keys(['src', 'name', 'retrieve', 'modifiers', 'enableJs', 'throttle']);
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
