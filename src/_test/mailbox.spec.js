'use strict';
/* global describe it beforeEach afterEach before after */

import { expect } from 'chai';
import { __testMethods__ as fns } from '../mailbox.js';

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('mrcrowley.mailbox', () => {
    beforeEach(() => {
        fns.reset();
    });

    // on
    describe('on', () => {
        it('should return an id', () => {
            const id = fns.on('foo', () => {});
            expect(id).to.be.a('string');
            expect(id).to.have.length.above(0);
        });

        it('should return a custom id', () => {
            const id = fns.on('foo', 'bar', () => {});
            expect(id).to.be.a('string');
            expect(id).to.eql('bar');
        });

        it('should listen to events', (done) => {
            fns.on('foo', done);
            fns.send('foo');
        });

        it('should error without a message', (done) => {
            try {
                fns.on(null, () => {});
                done('An error should have happened');
            } catch (err) {
                done();
            }
        });

        it('should error without a listener', (done) => {
            try {
                fns.on('foo');
                done('An error should have happened');
            } catch (err) {
                done();
            }
        });
    });

    // off
    describe('off', () => {
        it('should not listen', (done) => {
            let setDone;
            /* eslint-disable prefer-const */
            let timer;
            /* eslint-enable prefer-const */
            const id = fns.on('foo', () => {
                timer && clearTimeout(timer);

                if (setDone) { return; }
                setDone = true;

                done('It should not listen!');
            });

            fns.off('foo', id);
            fns.send('foo');

            // Now lets wait for nothing to happen
            timer = setTimeout(done, 500);
        });

        it('should not remove all id msg listeners', (done) => {
            /* eslint-disable prefer-const */
            let timer;
            /* eslint-enable prefer-const */
            let otherSet = false;
            const id = fns.on('foo', () => {
                timer && clearTimeout(timer);
                done('It should not listen to the one with id!');
            });

            fns.on('foo', () => { otherSet = true; });
            fns.off('foo', id);
            fns.send('foo');

            // Now lets wait for nothing to happen
            timer = setTimeout(() => {
                done(!otherSet ? 'Other isn\'t set!' : null);
            }, 500);
        });

        it('should remove all id msg listeners', (done) => {
            let setDone = false;
            /* eslint-disable prefer-const */
            let timer;
            /* eslint-enable prefer-const */
            const listener = function (num) {
                timer && clearTimeout(timer);

                if (setDone) { return; }
                setDone = true;

                done(`It should not listen to the ${num}!`);
            };

            fns.on('foo', listener.bind(null, 'first'));
            fns.on('foo', listener.bind(null, 'second'));

            fns.off('foo');
            fns.send('foo');

            // Now lets wait for nothing to happen
            timer = setTimeout(done, 500);
        });
    });

    // send
    describe('send', () => {
        it('should send message', (done) => {
            fns.on('foo', () => done());
            fns.send('foo');
        });

        it('should send message with data', (done) => {
            fns.on('foo', (data) => {
                expect(data).to.be.an('string');
                expect(data).to.eql('bar');

                done();
            });
            fns.send('foo', 'bar');
        });

        it('should send message with data object', (done) => {
            fns.on('foo', (data) => {
                expect(data).to.be.an('object');
                expect(data).to.contain.keys(['foo']);
                expect(data.foo).to.eql('bar');

                done();
            });
            fns.send('foo', { foo: 'bar' });
        });
    });

    // reset
    describe('reset', () => {
        it('should reset', (done) => {
            /* eslint-disable prefer-const */
            let timer;
            /* eslint-enable prefer-const */

            fns.on('foo', () => {
                timer && clearTimeout(timer);
                done('It shouldn\'t happen!');
            });
            fns.reset();
            fns.send('foo');

            // Now lets wait for nothing to happen
            timer = setTimeout(done, 500);
        });
    });
});
