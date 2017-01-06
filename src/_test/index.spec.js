'use strict';
/* global describe it before after beforeEach afterEach Promise */

import fs from 'fs';
import { expect } from 'chai';
import { __testMethods__ as fns } from '../index.js';

// --------------------------------
// Variables

const testPath = './src/_test/data/tmp.json';

// --------------------------------
// Functions

// --------------------------------
// Suite of tests

describe('scraper.index', () => {
    // run
    describe('run', () => {
        it('should error without a valid config', (done) => {
            try {
                fns.run(false).then(() => done('It should\'ve errored'));
            } catch (err) {
                done();
            }
        });

        it('should run with a config source', function (done) {
            const configSrc = './src/_test/data/config.json';

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configSrc)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'throttle', 'data', 'result']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.throttle).to.be.a('number');
                expect(data.data).to.be.an('array');
                expect(data.data.length).to.eql(3);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                });

                expect(data.result).to.be.a('array');
                expect(data.result.length).to.eql(3);

                data.result.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve', 'name', 'result']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.name).to.be.a('string');
                    expect(val.result).to.be.an('array');

                    val.result.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.contain.keys(['src', 'result']);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should run with a config object', function (done) {
            const configObj = require('./data/config.json');

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configObj)
            .then(data => {
                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'throttle', 'data', 'result']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.throttle).to.be.a('number');
                expect(data.data).to.be.an('array');
                expect(data.data.length).to.eql(3);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                });

                expect(data.result).to.be.a('array');
                expect(data.result.length).to.eql(3);

                data.result.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve', 'name', 'result']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.name).to.be.a('string');
                    expect(val.result).to.be.an('array');

                    val.result.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.contain.keys(['src', 'result']);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should save to a file', function (done) {
            const configObj = require('./data/config.json');

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.run(configObj, testPath)
            .then(() => {
                const data = require(testPath.replace('src/_test/', ''));

                expect(data).to.be.an('object');
                expect(data).to.have.keys(['projectId', 'projectName', 'throttle', 'data', 'result']);
                expect(data.projectId).to.be.a('string');
                expect(data.projectName).to.be.a('string');
                expect(data.throttle).to.be.a('number');
                expect(data.data).to.be.an('array');
                expect(data.data.length).to.eql(3);

                data.data.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                });

                expect(data.result).to.be.a('array');
                expect(data.result.length).to.eql(3);

                data.result.forEach(val => {
                    expect(val).to.be.an('object');
                    expect(val).to.contain.keys(['src', 'retrieve', 'name', 'result']);
                    expect(val.src).to.be.a('string');
                    expect(val.retrieve).to.be.an('object');
                    expect(val.name).to.be.a('string');
                    expect(val.result).to.be.an('array');

                    val.result.forEach(res => {
                        expect(res).to.be.an('object');
                        expect(res).to.contain.keys(['src', 'result']);
                        expect(res.src).to.be.a('string');
                        expect(res.result).to.be.an('object');
                    });
                });

                done();
            })
            .catch(done);
        });

        after(() => {
            fs.existsSync(testPath) && fs.unlink(testPath);
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
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['content']);
                    expect(result.retrieve.content).to.be.an('object');
                    expect(result.retrieve.content).to.have.keys(['selector']);
                    expect(result.retrieve.content.selector).to.be.a('string');
                    expect(result.result).to.be.an('array');
                    expect(result.result.length).to.eql(1);

                    result.result.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['content']);
                        expect(val.result.content).to.be.an('array');

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
                src: 'http://www.brainjar.com/java/host/test.html',
                name: 'Simple test html',
                retrieve: {
                    content: {
                        selector: 'meta',
                        attribute: 'content'
                    }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(20000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(2);

                data.forEach(result => {
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.name).to.be.a('string');
                    expect(result.retrieve).to.be.an('object');
                    expect(result.retrieve).to.have.keys(['content']);
                    expect(result.retrieve.content).to.be.an('object');
                    expect(result.retrieve.content.selector).to.be.a('string');
                    expect(result.result).to.be.an('array');
                    expect(result.result.length).to.eql(1);

                    result.result.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['content']);
                        expect(val.result.content).to.be.an('array');

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
                modifiers: {
                    query: ['foo', 'bar']
                },
                retrieve: {
                    title: {
                        selector: 'h3 a'
                    }
                }
            }];

            // We need some time for this one to be well tested...
            this.timeout(60000);

            fns.gatherData(config)
            .then((data) => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'result', 'modifiers']);
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

                    expect(result.result).to.be.an('array');
                    expect(result.result.length).to.eql(2);

                    result.result.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['title']);
                        expect(val.result.title).to.be.an('array');

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
                src: 'https://www.npmjs.com/search?q=foo',
                retrieve: {
                    title: {
                        selector: 'h3 a',
                        ignore: ['foo']
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
                    expect(result).to.have.keys(['src', 'name', 'retrieve', 'result']);
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

                    expect(result.result).to.be.an('array');
                    expect(result.result.length).to.eql(1);

                    result.result.forEach(val => {
                        expect(val).to.be.an('object');
                        expect(val).to.have.keys(['src', 'result']);
                        expect(val.src).to.be.a('string');
                        expect(val.result).to.be.an('object');
                        expect(val.result).to.have.keys(['title']);
                        expect(val.result.title).to.be.an('array');

                        val.result.title.forEach(valResult => {
                            expect(valResult).to.be.a('string');
                            expect(valResult).to.not.contain('foo');
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

    // getSingle
    describe('getSingle', () => {
        it('should get single data', function (done) {
            this.timeout(60000);

            fns.getSingle([
                {
                    src: 'http://www.brainjar.com/java/host/test.html',
                    retrieve: {
                        content: {
                            selector: 'body p'
                        }
                    }
                }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('brainjar.com/java/host/test');
                    expect(result.result).to.be.an('object');
                    expect(result.result).to.have.keys(['content']);
                    expect(result.result.content).to.be.an('array');

                    result.result.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should get multiple data', function (done) {
            this.timeout(60000);

            fns.getSingle([
                {
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
                }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('brainjar.com/java/host/test');
                    expect(result.result).to.be.an('object');
                    expect(result.result).to.have.keys(['content', 'meta']);
                    expect(result.result.content).to.be.an('array');
                    expect(result.result.meta).to.be.an('array');

                    result.result.content.forEach(content => {
                        expect(content).to.be.a('string');
                    });

                    result.result.meta.forEach(meta => {
                        expect(meta).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should get multiple urls', function (done) {
            this.timeout(60000);

            fns.getSingle([
                {
                    src: 'http://www.brainjar.com/java/host/test.html',
                    retrieve: {
                        content: {
                            selector: 'body p'
                        }
                    }
                }, {
                    src: 'http://www.brainjar.com/java/host/test.html',
                    retrieve: {
                        meta: {
                            selector: 'meta',
                            attribute: 'content'
                        }
                    }
                }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(2);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('brainjar.com/java/host/test');
                    expect(result.result).to.be.an('object');
                });

                expect(data[0].result).to.have.keys(['content']);
                expect(data[0].result.content).to.be.an('array');
                data[0].result.content.forEach(content => {
                    expect(content).to.be.a('string');
                });

                expect(data[1].result).to.have.keys(['meta']);
                expect(data[1].result.meta).to.be.an('array');
                data[1].result.meta.forEach(meta => {
                    expect(meta).to.be.a('string');
                });

                done();
            })
            .catch(done);
        });

        it('should get attribute data', function (done) {
            this.timeout(60000);

            fns.getSingle([
                {
                    src: 'http://www.brainjar.com/java/host/test.html',
                    retrieve: {
                        meta: {
                            selector: 'meta',
                            attribute: 'content'
                        }
                    }
                }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('brainjar.com/java/host/test');
                    expect(result.result).to.be.an('object');
                    expect(result.result).to.have.keys(['meta']);
                    expect(result.result.meta).to.be.an('array');

                    result.result.meta.forEach(meta => {
                        expect(meta).to.be.a('string');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should ignore results', function (done) {
            this.timeout(60000);

            fns.getSingle([
                {
                    src: 'https://www.npmjs.com/search?q=foo',
                    retrieve: {
                        title: {
                            selector: 'h3 a',
                            ignore: ['foo']
                        }
                    }
                }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('npmjs.com/search');
                    expect(result.result).to.be.an('object');
                    expect(result.result).to.have.keys(['title']);
                    expect(result.result.title).to.be.an('array');

                    result.result.title.forEach(title => {
                        expect(title).to.be.a('string');
                        expect(title).to.not.contain('foo');
                    });
                });

                done();
            })
            .catch(done);
        });

        it('should return empty without retrieves', function (done) {
            this.timeout(60000);

            fns.getSingle([
                { src: 'http://www.brainjar.com/java/host/test.html' }
            ])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(1);

                data.forEach(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.keys(['src', 'result']);
                    expect(result.src).to.be.a('string');
                    expect(result.src).to.contain('brainjar.com/java/host/test');
                    expect(result.result).to.be.an('object');
                    expect(Object.keys(result.result).length).to.eql(0);
                });

                done();
            })
            .catch(done);
        });

        it('should succeed with an empty data', (done) => {
            fns.getSingle([])
            .then(data => {
                expect(data).to.be.an('array');
                expect(data.length).to.eql(0);

                done();
            })
            .catch(done);
        });

        it('should error without a compliant data', (done) => {
            fns.getSingle({})
            .then(() => done('It should\'ve errored'))
            .catch(() => done());
        });
    });

    // getUrl
    describe('getUrl', () => {
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

    // getDom
    describe('getDom', () => {
        it('should get a window with DOM using url', function (done) {
            this.timeout(60000);

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
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
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it.skip('should throttle the request', function (done) {
            this.timeout(10000);

            // TODO: Need to test this out

            fns.getDom('http://www.brainjar.com/java/host/test.html', 'url', 500)
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it('should get a window with javacript processed', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>document.getElementById(\'headline\').textContent=\'Foo\';</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
                expect(domObj.window.document.getElementById('headline').textContent).to.eql('Foo');
                expect(domObj.window).to.contain.keys(['$', 'document']);
                expect(domObj.errors).to.be.an('array');
                expect(domObj.logs).to.be.an('array');
                expect(domObj.warns).to.be.an('array');
                done();
            })
            .catch(done);
        });

        it('should return javascript errors', function (done) {
            this.timeout(10000);

            let tmpl = '<html><body><h1 id="headline">Headline</h1>';
            tmpl += '<script>console.error(\'BarFoo\');throw new Error(\'FooBar\');</script>';
            tmpl += '</body></html>';

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
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

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
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

            fns.getDom(tmpl, 'content')
            .then(domObj => {
                expect(domObj).to.be.an('object');
                expect(domObj).to.have.keys(['window', 'errors', 'logs', 'warns']);
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
    });
});
