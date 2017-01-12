'use strict';
/* global describe it before after beforeEach afterEach Promise */

import fs from 'fs';
import { expect } from 'chai';
import { getPwd } from '../utils.js';
import { set } from '../output.js';
import { __testMethods__ as fns } from '../index.js';

// --------------------------------
// Variables

const pathTmp = './src/_test/data/tmp.json';
const pathConfig = './src/_test/data/config.json';
const pwdTmp = getPwd(pathTmp);
const pwdConfig = getPwd(pathConfig);

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('mrcrowley.index', () => {
    beforeEach(() => {
        set();
    });

    afterEach(() => {
        if (fs.existsSync(pwdTmp)) {
            fs.unlinkSync(pwdTmp);

            // Delete so that we can require it again
            delete require.cache[pwdTmp];
        }

        set();
    });

    // getUserAgent
    describe('getUserAgent', () => {
        it('should get a random userAgent', () => {
            const result = fns.getUserAgent();

            expect(result).to.be.a('string');
        });
    });

    // getUrlConfig
    describe('getUrlConfig', () => {
        it('should return a config', () => {
            const result = fns.getUrlConfig();

            expect(result).to.be.an('object');
            expect(result).to.contain.keys(['userAgent', 'cookieJar', 'agentOptions', 'defaultEncoding']);
        });
    });

    // getQueriedUrls
    describe('getQueriedUrls', () => {
        it('should error without a data object', (done) => {
            try {
                fns.getQueriedUrls();
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a data source', (done) => {
            try {
                fns.getQueriedUrls({});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should error without a compliant data source', (done) => {
            try {
                fns.getQueriedUrls({ src: {} });
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });

        it('should succeed with a simple source', () => {
            const result = fns.getQueriedUrls({ src: 'foo' });
            expect(result).to.be.an('array');
            expect(result.length).to.eql(1);

            result.forEach(url => {
                expect(url).to.be.a('string');
                expect(url).to.eql('foo');
            });
        });

        it('should succeed with a queried source', () => {
            const result = fns.getQueriedUrls({
                src: 'foo/{{query}}',
                modifiers: { query: ['foo', 'bar'] }
            });

            expect(result).to.be.an('array');
            expect(result.length).to.eql(2);

            result.forEach(url => {
                expect(url).to.be.a('string');
            });

            expect(result[0]).to.eql('foo/foo');
            expect(result[1]).to.eql('foo/bar');
        });

        it('should succeed with a queried source with multiple modifiers', () => {
            const result = fns.getQueriedUrls({
                src: 'foo/{{query}}/{{limit}}',
                modifiers: {
                    query: ['foo', 'bar'],
                    limit: [0, 1, 2]
                }
            });

            expect(result).to.be.an('array');
            expect(result.length).to.eql(6);

            result.forEach(url => {
                expect(url).to.be.a('string');
            });

            expect(result).to.have.members([
                'foo/foo/0',
                'foo/foo/1',
                'foo/foo/2',
                'foo/bar/0',
                'foo/bar/1',
                'foo/bar/2'
            ]);
        });

        it('should succeed with a queried source with limiters', () => {
            const result = fns.getQueriedUrls({
                src: 'foo/{{limit}}',
                modifiers: {
                    limit: [{
                        min: 0,
                        max: 10
                    }]
                }
            });
            expect(result).to.be.an('array');
            expect(result.length).to.eql(11);

            // Lets actually check the urls
            for (let i = 0; i < 11; i += 1) {
                expect(result[i]).to.be.a('string');
                expect(result[i]).to.eql(`foo/${i}`);
            }
        });
    });

    // getDom
    describe('getDom', () => {
        it.skip('should check if url is 404 and ignore it', () => {});

        it('should get a window with DOM using url', function (done) {
            this.timeout(60000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it('should get a window with DOM using a string', function (done) {
            this.timeout(10000);

            fns.getDom('<html><body><h1>Headline</h1></body></html>', 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it('should throttle the request', function (done) {
            this.timeout(60000);

            const time = Date.now();

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url', 10000)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(Date.now() - time).to.be.above(9999);

                done();
            })
            .catch(done);
        });

        it('should get a window with javacript processed', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>document.getElementById(\'headline\').textContent=\'Foo\';</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content', null, true)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window.document.getElementById('headline').textContent).to.eql('Foo');
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it('should wait for element to appear on page', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body>';
            tmpl += '<script>var foo = document.createElement("div"); document.body.appendChild(foo);</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content', null, true, 'div')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.window.$.find('div').length).to.eql(1);

                done();
            })
            .catch(done);
        });

        it('shouldn\'t wait more than 5 seconds for an element to be on the page', function (done) {
            this.timeout(10000);

            const tmpl = '<html><body></body></html>';

            fns.getDom(tmpl, 'content', null, true, {
                selector: 'div',
                for: 5000
            })
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                expect(domObj.window.$.find('div').length).to.eql(0);

                done();
            })
            .catch(done);
        });

        it('should return javascript errors', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.error(\'BarFoo\');throw new Error(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content', null, true)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');

                expect(domObj.errors.length).to.eql(2);
                expect(domObj.errors[0]).to.contain('BarFoo');
                expect(domObj.errors[1].message).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should return javascript logs', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.log(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content', null, true)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');

                expect(domObj.logs.length).to.eql(1);
                expect(domObj.logs).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should return javascript warns', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.warn(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content', null, true)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns', 'docHtml']);
                expect(domObj.docHtml).to.be.a('string');
                expect(domObj.docHtml).to.have.length.above(1);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');

                expect(domObj.warns.length).to.eql(1);
                expect(domObj.warns).to.contain('FooBar');

                done();
            })
            .catch(done);
        });

        it('should error without a valid url', (done) => {
            fns.getDom('www.brainjar.com/java/host/test.html', 'url')
            .then(() => done('It should\'ve errored'))
            .catch((err) => !!err ? done() : done('Where is the error?'));
        });

        it('should error without a compliant source', (done) => {
            fns.getDom({})
            .then(() => done('It should\'ve errored'))
            .catch((err) => !!err ? done() : done('Where is the error?'));
        });
    });

    // getUrl
    describe('getUrl', () => {
        it.skip('should check if url is 404 and ignore it', () => {});

        it('should get an url markup', function (done) {
            this.timeout(60000);

            fns.getUrl('http://www.brainjar.com/java/host/test.html')
            .then(markup => {
                expect(markup).to.be.a('string');
                expect(markup).to.have.length.above(100);
                expect(markup).to.match(/<html/);
                expect(markup).to.match(/<body/);

                done();
            })
            .catch(done);
        });

        it('should error without an url', (done) => {
            fns.getUrl()
            .then(() => { done('It shouldn\'t have errored'); })
            .catch(done.bind(null, null));
        });

        it('should error without a string url', (done) => {
            fns.getUrl({})
            .then(() => { done('It shouldn\'t have errored'); })
            .catch(done.bind(null, null));
        });
    });

    // getScrap
    describe('getScrap', () => {
        it('should get simple data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(el, el, {
                    retrieve: {
                        content: {
                            selector: 'body p'
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(result).to.have.keys(['content']);
                expect(result.content).to.be.an('array');
                expect(result.content.length).to.be.above(0);

                result.content.forEach(content => {
                    expect(content).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should not error without $ and without nested data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(null, el, {
                    retrieve: {
                        content: {
                            selector: 'body p'
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(result).to.have.keys(['content']);
                expect(result.content).to.be.an('array');

                result.content.forEach(content => {
                    expect(content).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should get empty without data', () => {
            const result = fns.getScrap(null, { find: () => {} });

            expect(result).to.be.an('object');
            expect(Object.keys(result).length).to.eql(0);
        });

        it('should get nested data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(el, el, {
                    retrieve: {
                        body: {
                            selector: 'body',
                            retrieve: {
                                content: {
                                    selector: 'p'
                                }
                            }
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(result).to.have.keys(['body']);
                expect(result.body).to.be.an('array');
                expect(result.body.length).to.eql(1);

                result.body.forEach(actualResult => {
                    expect(actualResult).to.be.an('object');
                    expect(actualResult).to.have.keys(['content']);
                    expect(actualResult.content).to.be.an('array');
                    expect(actualResult.content.length).to.eql(1);

                    actualResult.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should return empty if there is no data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(el, el, {
                    retrieve: {
                        content: {
                            selector: '.foo'
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(Object.keys(result).length).to.eql(0);

                done();
            })
            .catch(done);
        });

        it('should return empty if there is no nested data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(el, el, {
                    retrieve: {
                        body: {
                            selector: 'body',
                            retrieve: {
                                content: {
                                    selector: '.foo'
                                }
                            }
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(Object.keys(result).length).to.eql(0);

                done();
            })
            .catch(done);
        });

        it('should return nested data even if one retrieve is empty', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                const result = fns.getScrap(el, el, {
                    retrieve: {
                        body: {
                            selector: 'body',
                            retrieve: {
                                content: {
                                    selector: 'p'
                                },
                                foo: {
                                    selector: '.foo'
                                }
                            }
                        }
                    }
                });

                expect(result).to.be.an('object');
                expect(result).to.have.keys(['body']);
                expect(result.body).to.be.an('array');
                expect(result.body.length).to.eql(1);

                result.body.forEach(actualResult => {
                    expect(actualResult).to.be.an('object');
                    expect(actualResult).to.have.keys(['content']);
                    expect(actualResult.content).to.be.an('array');
                    expect(actualResult.content.length).to.eql(1);

                    actualResult.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should error without $ and with nested data', function (done) {
            this.timeout(10000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url').then(singleDom => {
                const el = singleDom.window.$;
                try {
                    fns.getScrap(null, el, {
                        retrieve: {
                            body: {
                                selector: 'body',
                                retrieve: {
                                    content: {
                                        selector: 'p'
                                    }
                                }
                            }
                        }
                    });

                    done('It should\'ve errored');
                } catch (err) {
                    done();
                }
            })
            .catch(() => done());
        });

        it('should error without a compliant parent element', done => {
            try {
                fns.getScrap({});
                done('It should\'ve errored');
            } catch (err) {
                done();
            }
        });
    });

    // getSingle
    describe('getSingle', () => {
        beforeEach(function (done) {
            this.timeout(6000);

            setTimeout(done, 5000);
        });

        it('should get single data', function (done) {
            this.timeout(60000);

            fns.getSingle({ src: 'http://www.brainjar.com/java/host/test.html' }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: { content: { selector: 'body p' } }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['content']);
                expect(result.result.content).to.be.an('array');
                expect(result.updatedAt).to.be.a('number');
                expect(result.result.content).to.have.length.above(0);

                result.result.content.forEach(content => {
                    expect(content).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should get multiple data', function (done) {
            this.timeout(60000);

            fns.getSingle({ src: 'http://www.brainjar.com/java/host/test.html' }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    content: {
                        selector: 'body p'
                    },
                    meta: {
                        selector: 'meta',
                        attribute: 'content'
                    }
                }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['content', 'meta']);
                expect(result.result.content).to.be.an('array');
                expect(result.result.meta).to.be.an('array');
                expect(result.updatedAt).to.be.a('number');
                expect(result.result.content).to.have.length.above(0);
                expect(result.result.meta).to.have.length.above(0);

                result.result.content.forEach(content => {
                    expect(content).to.be.a('string');
                });

                result.result.meta.forEach(meta => {
                    expect(meta).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should get nested data', function (done) {
            this.timeout(60000);

            fns.getSingle({ src: 'http://www.brainjar.com/java/host/test.html' }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    body: {
                        selector: 'body',
                        retrieve: {
                            content: {
                                selector: 'p'
                            }
                        }
                    }
                }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.updatedAt).to.be.a('number');

                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['body']);
                expect(result.result.body).to.be.an('array');
                expect(result.result.body.length).to.eql(1);

                result.result.body.forEach(actualResult => {
                    expect(actualResult).to.be.an('object');
                    expect(actualResult).to.have.keys(['content']);
                    expect(actualResult.content).to.be.an('array');
                    expect(actualResult.content.length).to.eql(1);

                    actualResult.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should get attribute data', function (done) {
            this.timeout(60000);

            fns.getSingle({ src: 'http://www.brainjar.com/java/host/test.html' }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    meta: {
                        selector: 'meta',
                        attribute: 'content'
                    }
                }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['meta']);
                expect(result.result.meta).to.be.an('array');
                expect(result.updatedAt).to.be.a('number');
                expect(result.result.meta).to.have.length.above(0);

                result.result.meta.forEach(meta => {
                    expect(meta).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should ignore results', function (done) {
            // We need some time for this one to be well tested...
            this.timeout(50000);

            fns.getSingle({ src: 'https://www.google.pt/search?q=foo' }, {
                src: 'https://www.google.pt/search?q=foo',
                retrieve: {
                    title: {
                        selector: 'h3 a',
                        ignore: ['Foo Fighters']
                    }
                }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('google.pt');
                expect(result.updatedAt).to.be.a('number');
                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['title']);
                expect(result.result.title).to.be.an('array');
                expect(result.result.title).to.have.length.above(0);

                result.result.title.forEach(title => {
                    expect(title).to.be.a('string');
                    expect(title.toLowerCase()).to.not.contain('foo fighters');
                });

                done();
            })
            .catch(done);
        });

        it('should return empty without retrieves', function (done) {
            this.timeout(60000);

            fns.getSingle({ src: 'http://www.brainjar.com/java/host/test.html' })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.result).to.be.an('object');
                expect(Object.keys(result.result).length).to.eql(0);
                expect(result.updatedAt).to.be.a('number');

                done();
            })
            .catch(done);
        });

        it('should succeed with an empty data', (done) => {
            fns.getSingle({})
            .then(done)
            .catch(done);
        });

        it('should skip if there is such a flag', (done) => {
            fns.getSingle({
                src: 'http://www.brainjar.com/java/host/test.html',
                skip: true
            }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    body: {
                        selector: 'body',
                        retrieve: {
                            content: {
                                selector: 'p'
                            }
                        }
                    }
                }
            })
            .then(done)
            .catch(done);
        });

        it('should skip if it was updated not so long ago and it has results', (done) => {
            fns.getSingle({
                src: 'http://www.brainjar.com/java/host/test.html',
                updatedAt: Date.now(),
                result: { content: ['result'] }
            }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    body: {
                        selector: 'body',
                        retrieve: {
                            content: {
                                selector: 'p'
                            }
                        }
                    }
                }
            })
            .then(done)
            .catch(done);
        });

        it('should skip without a source', (done) => {
            fns.getSingle({}, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    body: {
                        selector: 'body',
                        retrieve: {
                            content: {
                                selector: 'p'
                            }
                        }
                    }
                }
            })
            .then(done)
            .catch(done);
        });

        it('shouldn\'t skip if it was updated not so long ago but without data', function (done) {
            this.timeout(60000);

            fns.getSingle({
                src: 'http://www.brainjar.com/java/host/test.html',
                updatedAt: Date.now()
            }, {
                src: 'http://www.brainjar.com/java/host/test.html',
                retrieve: {
                    body: {
                        selector: 'body',
                        retrieve: {
                            content: {
                                selector: 'p'
                            }
                        }
                    }
                }
            })
            .then(result => {
                expect(result).to.be.an('object');
                expect(result).to.have.keys(['src', 'result', 'updatedAt']);
                expect(result.src).to.be.a('string');
                expect(result.src).to.contain('brainjar.com/java/host/test');
                expect(result.updatedAt).to.be.a('number');

                expect(result.result).to.be.an('object');
                expect(result.result).to.have.keys(['body']);
                expect(result.result.body).to.be.an('array');
                expect(result.result.body.length).to.eql(1);

                result.result.body.forEach(actualResult => {
                    expect(actualResult).to.be.an('object');
                    expect(actualResult).to.have.keys(['content']);
                    expect(actualResult.content).to.be.an('array');
                    expect(actualResult.content.length).to.eql(1);

                    actualResult.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should error without a compliant data', (done) => {
            fns.getSingle('')
            .then(() => done('It should\'ve errored'))
            .catch(() => done());
        });
    });

    // gatherData
    describe('gatherData', () => {
        it('should work with an empty data', (done) => {
            fns.gatherData([])
            .then(done.bind(null, null))
            .catch(done);
        });

        it('should get data', function (done) {
            const config = [{
                src: 'http://www.brainjar.com/java/host/test.html',
                name: 'Simple test html',
                retrieve: {
                    content: {
                        selector: 'body p'
                    }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(20000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'results']);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['content']);
                    expect(result.retrieve.content).to.be.an('object');
                    expect(result.retrieve.content).to.have.keys(['selector']);
                    expect(result.retrieve.content.selector).to.be.a('string');
                    expect(result.results).to.be.an('array');
                    expect(result.results.length).to.eql(1);

                    result.results.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['content']);
                        expect(val.result.content).to.be.an('array');
                        expect(val.updatedAt).to.be.a('number');

                        val.result.content.forEach(valResult => {
                            expect(valResult).to.be.a('string');
                            expect(valResult.length).to.be.above(1);
                        });
                    });
                });

                done();
            }).catch(done);
        });

        it('should get multiple data', function (done) {
            const config = [{
                src: 'http://www.brainjar.com/java/host/test.html',
                name: 'Simple test html',
                retrieve: {
                    content: {
                        selector: 'body p'
                    }
                }
            }, {
                src: 'http://help.websiteos.com/websiteos/example_of_a_simple_html_page.htm',
                name: 'Simple test html 2',
                retrieve: {
                    content: {
                        selector: 'meta[http-equiv="content-type"]',
                        attribute: 'content'
                    }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(2);

                data.forEach(result => {
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'results']);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['content']);
                    expect(result.retrieve.content).to.be.an('object');
                    expect(result.retrieve.content.selector).to.be.a('string');
                    expect(result.results).to.be.an('array');
                    expect(result.results.length).to.eql(1);

                    result.results.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['content']);
                        expect(val.result.content).to.be.an('array');
                        expect(val.updatedAt).to.be.a('number');

                        val.result.content.forEach(valResult => {
                            expect(valResult).to.be.a('string');
                            expect(valResult.length).to.be.above(1);
                        });
                    });
                });

                done();
            }).catch(done);
        });

        it('should get queried data', function (done) {
            const config = [{
                src: 'https://www.npmjs.com/search?q={{query}}',
                name: 'Foo',
                throttle: 5000,
                modifiers: { query: ['foo', 'bar'] },
                retrieve: {
                    title: { selector: 'h3 a' }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.have.keys([
                        'src', 'name', 'retrieve', 'results', 'modifiers', 'throttle'
                    ]);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['title']);
                    expect(result.retrieve.title).to.be.an('object');
                    expect(result.retrieve.title).to.have.keys(['selector']);
                    expect(result.retrieve.title.selector).to.be.a('string');
                    expect(result.modifiers).to.be.an('object');
                    expect(result.modifiers).to.have.keys(['query']);
                    expect(result.modifiers.query).to.be.an('array');

                    result.modifiers.query.forEach(val => {
                        expect(val).to.be.a('string');
                    });

                    expect(result.results).to.be.an('array');
                    expect(result.results.length).to.eql(2);

                    result.results.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['title']);
                        expect(val.result.title).to.be.an('array');
                        expect(val.updatedAt).to.be.a('number');

                        val.result.title.forEach(valResult => {
                            expect(valResult).to.be.a('string');
                            expect(valResult.length).to.be.above(1);
                        });
                    });
                });

                done();
            }).catch(done);
        });

        it('should ignore results', function (done) {
            const config = [{
                src: 'https://www.npmjs.com/search?q={{query}}',
                name: 'Foo',
                throttle: 5000,
                modifiers: { query: ['foo'] },
                retrieve: {
                    title: {
                        selector: 'h3 a',
                        ignore: ['camelcase']
                    }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(50000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'results', 'throttle', 'modifiers']);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['title']);
                    expect(result.retrieve.title).to.be.an('object');
                    expect(result.retrieve.title).to.have.keys(['selector', 'ignore']);
                    expect(result.retrieve.title.selector).to.be.a('string');
                    expect(result.retrieve.title.ignore).to.be.an('array');

                    result.retrieve.title.ignore.forEach(val => {
                        expect(val).to.be.a('string');
                    });

                    expect(result.results).to.be.an('array');
                    expect(result.results.length).to.eql(1);

                    result.results.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['title']);
                        expect(val.result.title).to.be.an('array');
                        expect(val.updatedAt).to.be.a('number');

                        val.result.title.forEach(valResult => {
                            expect(valResult).to.be.a('string');
                            expect(valResult.toLowerCase()).to.not.contain('camelcase');
                        });
                    });
                });

                done();
            }).catch(done);
        });

        it('should error without a compliant data item', (done) => {
            fns.gatherData([true])
            .then(() => done('It should\'ve errored'))
            .catch(() => done());
        });

        it('should error without a compliant data item source', (done) => {
            fns.gatherData([{ src: true }])
            .then(() => done('It should\'ve errored'))
            .catch(() => done());
        });
    });

    // run
    describe('run', () => {
        it('should error without a valid config', (done) => {
            fns.run(false)
            .then(() => done('It should\'ve errored'))
            .catch(() => done());
        });

        it('should run with a config source', function (done) {
            const configSrc = './src/_test/data/config.json';

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configSrc)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'data']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.data).to.be.an('array');
                expect(data.data).to.have.length.above(1);

                expect(data.data).to.be.a('array');
                expect(data.data).to.have.length.above(1);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys([
                        'src', 'name', 'retrieve', 'throttle', 'enableJs', 'results'
                    ]);
                    expect(val.src).to.be.a('string');
                    expect(val.src).to.have.length.above(0);
                    expect(val.name).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.throttle).to.be.a('number');
                    expect(val.enableJs).to.be.a('boolean');

                    expect(val.results).to.be.an('array');
                    val.results.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                        expect(res.updatedAt).to.be.a('number');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should run with a config object', function (done) {
            const configObj = require(pwdConfig);

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configObj)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'data']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.data).to.be.an('array');
                expect(data.data).to.have.length.above(1);

                expect(data.data).to.be.a('array');
                expect(data.data).to.have.length.above(1);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys([
                        'src', 'name', 'retrieve', 'throttle', 'enableJs', 'results'
                    ]);
                    expect(val.src).to.be.a('string');
                    expect(val.src).to.have.length.above(0);
                    expect(val.name).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.throttle).to.be.a('number');
                    expect(val.enableJs).to.be.a('boolean');

                    expect(val.results).to.be.an('array');
                    val.results.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.have.keys(['src', 'result', 'updatedAt']);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                        expect(res.updatedAt).to.be.a('number');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should save to a file', function (done) {
            const configObj = require(pwdConfig);
            set(pwdTmp);

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configObj)
            .then(() => {
                const data = require(pwdTmp);

                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'data']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.data).to.be.an('array');
                expect(data.data).to.have.length.above(1);

                expect(data.data).to.be.a('array');
                expect(data.data).to.have.length.above(1);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys([
                        'src', 'name', 'retrieve', 'throttle', 'enableJs', 'results'
                    ]);
                    expect(val.src).to.be.a('string');
                    expect(val.src).to.have.length.above(0);
                    expect(val.name).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.throttle).to.be.a('number');
                    expect(val.enableJs).to.be.a('boolean');

                    expect(val.results).to.be.an('array');
                    val.results.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.contain.any.keys([
                            'src', 'result', 'updatedAt', 'enableJs', 'name', 'results', 'throttle', 'modifiers', 'wait'
                        ]);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                        expect(res.updatedAt).to.be.a('number');
                    });
                });

                done();
            })
            .catch(done);
        });
    });
});
