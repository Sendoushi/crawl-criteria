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
        reset();
    });

    // set
    describe('set', () => {
        it('should set a source', () => {
            const result = fns.set(pathTmp);

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['src', 'type', 'force', 'logger']);
            expect(result.src).to.be.a('string');
            expect(result.src).to.contain('tmp.json');
            expect(result.type).to.be.a('string');
            expect(result.type).to.eql('json');
            expect(result.force).to.be.a('boolean');
            expect(result.force).to.eql(false);
        });

        it('should set a source and force', () => {
            const result = fns.set(pathTmp, null, true);

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['src', 'type', 'force', 'logger']);
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
            expect(result).to.have.keys(['src', 'type', 'force', 'logger']);
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

    // save
    describe('save', () => {
        beforeEach(() => {
            if (fs.existsSync(pwdTmp)) {
                fs.unlink(pwdTmp);

                // Delete so that we can require it again
                delete require.cache[require.resolve(pwdTmp)];
            }

            // Reset the set
            fns.set();
        });

        afterEach(() => {
            if (fs.existsSync(pwdTmp)) {
                fs.unlink(pwdTmp);

                // Delete so that we can require it again
                delete require.cache[require.resolve(pwdTmp)];
            }

            // Reset the set
            fns.set();
        });

        it('should save the output', () => {
            fns.save(fns.set(pwdTmp), {
                foo: 'bar'
            });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo']);
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('bar');
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
            expect(result).to.have.keys(['foo', 'stay', 'bar']);
            expect(result.stay).to.be.a('string');
            expect(result.stay).to.eql('foo');
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('foo');
            expect(result.bar).to.be.a('string');
            expect(result.bar).to.eql('bar');
        });

        it('should save force the output', () => {
            fns.save(fns.set(pwdTmp), {
                foo: 'bar',
                stay: 'foo'
            });

            fns.save(fns.set(pwdTmp, null, true), {
                foo: 'foo',
                bar: 'bar'
            });

            const result = require(pwdTmp);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo', 'bar']);
            expect(result.foo).to.be.a('string');
            expect(result.foo).to.eql('foo');
            expect(result.bar).to.be.a('string');
            expect(result.bar).to.eql('bar');
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

    // getFile
    describe('getFile', () => {
        afterEach(() => {
            fs.existsSync(pwdTmp) && fs.unlink(pwdTmp);

            // Delete so that we can require it again
            delete require.cache[require.resolve(pwdTmp)];

            // Reset the set
            fns.set();
        });

        it('should get the output file', () => {
            const output = fns.set(pwdTmp);
            fns.save(output, { foo: 'bar' });

            const result = fns.getFile(output);
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['foo']);
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
});
