'use strict';
/* global describe it before after beforeEach afterEach Promise */

import fs from 'fs';
import { expect } from 'chai';
import { reset } from '../mailbox.js';
import { getPwd } from '../utils.js';
import { __testMethods__ as fns } from '../output.js';

// --------------------------------
// Variables

const pathConfig = './src/_test/data/config.json';
const pwdConfig = getPwd(pathConfig);
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
            const output = fns.set(pwdConfig);
            const result = fns.getFile(output);

            expect(result).to.be.an('object');
            expect(result).to.have.keys(['projectId', 'projectName', 'data']);
            expect(result.projectId).to.be.a('string');
            expect(result.projectId).to.eql('test');
            expect(result.projectName).to.be.a('string');
            expect(result.projectName).to.eql('Test');
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(4);
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
            fns.save(fns.set(pwdTmp), require(pwdConfig));

            const result = JSON.parse(fs.readFileSync(pwdTmp, 'utf-8'));
            expect(result).to.be.an('object');
            expect(result).to.have.keys(['projectId', 'projectName', 'data']);
            expect(result.projectId).to.be.a('string');
            expect(result.projectId).to.eql('test');
            expect(result.projectName).to.be.a('string');
            expect(result.projectName).to.eql('Test');
            expect(result.data).to.be.an('array');
            expect(result.data.length).to.eql(4);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.contain.any.keys([
                    'src', 'retrieve', 'name', 'throttle', 'results', 'modifiers', 'enableJs', 'wait'
                ]);
            });
        });

        it('should update the output', () => {
            const output = fns.set(pwdTmp);
            fns.save(output, {
                projectId: 'foo',
                projectName: 'bar',
                data: [
                    { src: 'has/no/result', retrieve: {}, results: [] },
                    {
                        src: 'has/no/update',
                        retrieve: {},
                        results: [{ src: '2', result: ['result'], skip: true }]
                    }, {
                        src: 'has/result',
                        retrieve: {},
                        results: [{ src: '3', result: ['result-1'] }]
                    }
                ]
            });

            fns.save(output, {
                projectId: 'foo',
                projectName: 'bar',
                data: [
                    {
                        src: 'has/no/result',
                        retrieve: {},
                        results: [{ src: '1', result: ['result'], skip: false }]
                    }, {
                        src: 'has/result',
                        retrieve: {},
                        results: [{ src: '3', result: ['result-1', 'result-2'], skip: true }]
                    }
                ]
            });

            const result = JSON.parse(fs.readFileSync(pwdTmp, 'utf-8'));
            expect(result.data.length).to.eql(3);

            result.data.forEach(val => {
                expect(val).to.be.an('object');
                expect(val).to.contain.keys(['src', 'retrieve', 'results']);
                expect(val.src).to.be.a('string');
                expect(val.retrieve).to.be.an('object');
                expect(val.results).to.be.an('array');

                if (val.src === 'has/no/result') {
                    expect(val.results.length).to.eql(1);

                    val.results.forEach(valRes => {
                        expect(valRes).to.be.an('object');
                        expect(valRes).to.contain.keys(['src', 'result', 'skip']);
                        expect(valRes.src).to.be.a('string');
                        expect(valRes.src).to.eql('1');
                        expect(valRes.result).to.be.an('array');
                        expect(valRes.result.length).to.eql(1);
                        expect(valRes.skip).to.be.a('boolean');

                        valRes.result.forEach(actRes => {
                            expect(actRes).to.be.a('string');
                            expect(actRes).to.eql('result');
                        });
                    });
                } else if (val.src === 'has/no/update') {
                    expect(val.results.length).to.eql(1);

                    val.results.forEach(valRes => {
                        expect(valRes).to.be.an('object');
                        expect(valRes).to.contain.keys(['src', 'result', 'skip']);
                        expect(valRes.src).to.be.a('string');
                        expect(valRes.src).to.eql('2');
                        expect(valRes.result).to.be.an('array');
                        expect(valRes.result.length).to.eql(1);
                        expect(valRes.skip).to.be.a('boolean');

                        valRes.result.forEach(actRes => {
                            expect(actRes).to.be.a('string');
                            expect(actRes).to.eql('result');
                        });
                    });
                } else if (val.src === 'has/result') {
                    expect(val.results.length).to.eql(1);

                    val.results.forEach(valRes => {
                        expect(valRes).to.be.an('object');
                        expect(valRes).to.contain.keys(['src', 'result', 'skip']);
                        expect(valRes.src).to.be.a('string');
                        expect(valRes.src).to.eql('3');
                        expect(valRes.result).to.be.an('array');
                        expect(valRes.result.length).to.eql(2);
                        expect(valRes.skip).to.be.a('boolean');

                        valRes.result.forEach(actRes => {
                            expect(actRes).to.be.a('string');

                            if (actRes !== 'result-1' && actRes !== 'result-2') {
                                throw new Error(`${actRes} is the wrong result`);
                            }
                        });
                    });
                } else {
                    throw new Error(`${val.src} shouldn't exist`);
                }
            });
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
