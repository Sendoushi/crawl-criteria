'use strict';

var search = require('./modules/search'),
    iterate = require('./modules/iterate');

function Crawler() {}

Crawler.prototype.search = search;
Crawler.prototype.iterate = iterate;

module.exports = Crawler;
