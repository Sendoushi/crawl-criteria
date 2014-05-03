/*jslint nomen: true, node: true*/

'use strict';

var config,
    HouseSearch = require('../HouseSearch'),
    house = new HouseSearch();

config = {
    'search-criteria': {
        'timer': 1000,

        'min-price': 300,
        'max-price': 450,

        'type': 'flat',
        'min-rooms': 't1',
        'max-rooms': 't2',

        'state': 'porto',
        'city': null,
        'location': null,

        'keywords': ['garagem'],
        'not-keywords': ['paranhos', 'gondomar', 'valongo', 'maia', 'gondomar', 'mamede infesta', 'pedroso', 'voa de varzim', 'matosinhos', 'campanh', 'vila do conde', 'arcozelo'],

        'min-date': null,
        'max-date': null,

        'aim': 'rent'
    },
    'databases': [
        {
            'name': 'BPIExpressoImobiliario',
            'url': 'http://bpiexpressoimobiliario.pt/{{aim}}/{{type}}/{{min-rooms}}-{{max-rooms}}/{{state}}?pricemax={{max-price}}&num=50&image=0&orderby=rel&pricemin={{min-price}}&page={{page}}',
            'page-start': '1',
            'page-max': 10,
            'type': {
                'flat': 'apartamentos',
                'house': ''
            },
            'aim': {
                'rent': 'arrendamento',
                'buy': ''
            },
            'list': {
                'pages-list': '#navigation_links #nvgl_pages a.page_number',
                'element': '#resIni .ohidden.w100percent.cboth.mbot25.mleft10 .fleft.ohidden',
                'title-el': 'h2 .adLink',
                'base-url': 'http://bpiexpressoimobiliario.pt',
                'url-el': 'h2 .adLink',
                'area-el': '.bbotlgray.ptop5.pbot7.mh65 .pleft5 .f9.pbot2',
                'date-el': '.bbotlgray.ptop5.pbot7.mh65 .pleft5 .f9.pbot2',
                'description-el': '.bbotlgray.ptop5.pbot7.mh65 .pleft5',
                'price-el': '.fright.ohidden.mright10 .fright.bold.f12.mtop2',
                'inside-item': {
                    'element': '',
                    'title-el': '',
                    'url-el': '',
                    'description-el': '',
                    'price-el': '',
                    'phone-el': '',
                    'email-el': ''
                }
            }
        }
    ]
};

// Returns the data
house.search(config, function (err, list) {
    // In case there was an error requesting the data
    if (err) {
        return console.log(err);
    }

    // Logs the list object
    var fs = require('fs');
    return fs.writeFile('./data-rent-porto', JSON.stringify(list, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
    });
});