'use strict';
/* global describe it before after beforeEach afterEach Promise */

import fs from 'fs';
import { expect } from 'chai';
import { reset } from '../mailbox.js';
import { getPwd } from '../utils.js';
import { __testMethods__ as fns } from '../output.js';

// --------------------------------
// Variables

const pathTmp = './src/_test/data/tmp.json';
const pwdTmp = getPwd(pathTmp);

// --------------------------------
// Functions

describe('mrcrowley.output', () => {
    afterEach(() => {
        if (fs.existsSync(pwdTmp)) {
            fs.unlinkSync(pwdTmp);

            // Delete so that we can require it again
            delete require.cache[pwdTmp];
        }

        reset();
    });

    // set
    describe('set', () => {
        it('should set a source', () => {
            const result = fns.set(pathTmp);

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['src', 'type', 'force', 'logger', 'fn', 'allSrcs', 'count']);
            expect(result.src).to.be.a('string');
            expect(result.src).to.contain('tmp.json');
            expect(result.type).to.be.a('string');
            expect(result.type).to.eql('json');
            expect(result.force).to.be.a('boolean');
            expect(result.force).to.eql(false);
        });

        it('should set a source and force', () => {
            const result = fns.set(pathTmp, null, null, true);

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['src', 'type', 'force', 'logger', 'fn', 'allSrcs', 'count']);
            expect(result.src).to.be.a('string');
            expect(result.src).to.contain('tmp.json');
            expect(result.type).to.be.a('string');
            expect(result.type).to.eql('json');
            expect(result.force).to.be.a('boolean');
            expect(result.force).to.eql(true);
        });

        it('should remove without a source and default to promise', () => {
            const result = fns.set();

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['src', 'type', 'force', 'logger', 'fn', 'allSrcs', 'count']);
            expect(result.src).to.be.an('undefined');
            expect(result.type).to.be.a('string');
            expect(result.type).to.eql('promise');
            expect(result.force).to.be.a('boolean');
            expect(result.force).to.eql(false);
        });

        it('should error without a compliant source', (done) => {
            try {
                fns.set({});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });
    });

    // getFile
    describe('getFile', () => {
        before(() => { fns.set(); });

        it('should get the output file', () => {
            const output = fns.set(pwdTmp);
            fns.save(output, { foo: 'bar' });

            const result = fns.getFile(output);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo', 'data']);
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('bar');
        });

        it('should error without a compliant output', (done) => {
            try {
                fns.getFile(null, { foo: 'bar' });
                done('It should ve\'errored');
            } catch (err) {
                done();
            }
        });

        it.skip('should get a csv', () => {});
    });

    // save
    describe('save', () => {
        beforeEach(() => { fns.set(); });

        it('should save the output', () => {
            fns.save(fns.set(pwdTmp), {
                foo: 'bar'
            });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo', 'data']);
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('bar');
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(0);
        });

        it('should update the output', () => {
            fns.save(fns.set(pwdTmp), {
                foo: 'bar',
                stay: 'foo'
            });

            fns.save(fns.set(pwdTmp), {
                foo: 'foo',
                bar: 'bar'
            });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo', 'stay', 'bar', 'data']);
            expect(result.stay).to.be.a('string');
            expect(result.stay).to.eql('foo');
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('foo');
            expect(result.bar).to.be.a('string');
            expect(result.bar).to.eql('bar');
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(0);
        });

        it('should save force the output', () => {
            fns.save(fns.set(pwdTmp), { foo: 'bar', stay: 'foo' });
            fns.save(fns.set(pwdTmp, null, null, true), { foo: 'foo', bar: 'bar' });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo', 'bar', 'data']);
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('foo');
            expect(result.bar).to.be.a('string');
            expect(result.bar).to.eql('bar');
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(0);
        });

        it('should merge data to the output', () => {
            const output = fns.set(pwdTmp);

            fns.save(output, { data: [{ src: 'foo', val: 1 }] });
            fns.save(output, { data: [{ src: 'foo', val: 2 }] });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['data']);
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(1);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['src', 'val']);
                expect(val.src).to.be.a('string');
            });

            expect(result.data[0].val).to.be.a('number');
            expect(result.data[0].val).to.eql(2);
        });

        it('shouldn\'t merge data to the output when not the same', () => {
            const output = fns.set(pwdTmp);

            fns.save(output, { data: [{ src: 'foo' }] });
            fns.save(output, { data: [{ src: 'bar' }] });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['data']);
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(2);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['src']);
                expect(val.src).to.be.a('string');
            });
        });

        it('should error without a compliant output', (done) => {
            try {
                fns.save(null, { foo: 'bar' });
                done('It should ve\'errored');
            } catch (err) {
                done();
            }
        });

        it.skip('should save into csv', () => {});
    });

    // saveItem
    describe('saveItem', () => {
        beforeEach(() => { fns.set(); });

        it('should save item in the output', () => {
            const output = fns.set(pwdTmp);
            fns.saveItem(output, [{ src: 'foo', val: 'bar' }]);

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['data']);
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(1);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['src', 'val']);
                expect(val.src).to.be.a('string');
                expect(val.val).to.be.a('string');
                expect(val.val).to.eql('bar');
            });
        });

        it('should update item in the output', () => {
            const output = fns.set(pwdTmp);
            fns.saveItem(output, [{ src: 'foo', val: 'bar' }]);
            fns.saveItem(output, [{ src: 'foo', val: 'foo' }]);

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['data']);
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(1);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.have.keys(['src', 'val']);
                expect(val.src).to.be.a('string');
                expect(val.val).to.be.a('string');
                expect(val.val).to.eql('foo');
            });
        });

        it('should error without a compliant output', (done) => {
            try {
                fns.saveItem(null, [{ src: 'bar' }]);
                done('It should ve\'errored');
            } catch (err) {
                done();
            }
        });
    });
});
