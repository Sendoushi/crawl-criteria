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
            const result = fns.verify(configObj);

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['value']);
            expect(result.value).to.be.an('object');
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
            expect(result).to.contain.all.keys(['projectId', 'projectName', 'data']);
            expect(result.projectId).to.be.a('string');
            expect(result.projectId).to.have.length.above(1);
            expect(result.projectName).to.be.a('string');
            expect(result.projectName).to.have.length.above(1);
            expect(result.data).to.be.a('array');

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.contain.all.keys([
                    'src', 'retrieve', 'name', 'throttle', 'results', 'modifiers', 'enableJs', 'wait'
                ]);

                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
                expect(val.name).to.be.an('string');
                expect(val.name).to.have.length.above(1);
                expect(val.throttle).to.be.a('number');
                expect(val.results).to.be.an('array');
                expect(val.modifiers).to.be.an('object');
                expect(val.enableJs).to.be.a('boolean');
                expect(val.wait).to.be.an('object');
                expect(val.wait).to.contain.all.keys(['for']);
                expect(val.wait).to.contain.any.keys(['selector', 'for']);
                expect(val.wait.for).to.be.a('number');
            });
        });

        it('should return a valid config', () => {
            const configObj = require(pwdConfig);
            const result = fns.get(configObj);

            expect(result).to.be.an('object');
            expect(result).to.contain.all.keys(['projectId', 'projectName', 'data']);
            expect(result.projectId).to.be.a('string');
            expect(result.projectId).to.have.length.above(1);
            expect(result.projectName).to.be.a('string');
            expect(result.projectName).to.have.length.above(1);
            expect(result.data).to.be.a('array');

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.contain.all.keys([
                    'src', 'retrieve', 'name', 'throttle', 'results', 'modifiers', 'enableJs', 'wait'
                ]);

                expect(val.src).to.be.an('string');
                expect(val.src).to.have.length.above(1);
                expect(val.retrieve).to.be.an('object');
                expect(val.name).to.be.an('string');
                expect(val.name).to.have.length.above(1);
                expect(val.throttle).to.be.a('number');
                expect(val.results).to.be.an('array');
                expect(val.modifiers).to.be.an('object');
                expect(val.enableJs).to.be.a('boolean');
                expect(val.wait).to.be.an('object');
                expect(val.wait).to.contain.all.keys(['for']);
                expect(val.wait).to.contain.any.keys(['selector', 'for']);
                expect(val.wait.for).to.be.a('number');
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
