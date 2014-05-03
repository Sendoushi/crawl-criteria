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

        // 'keywords': [],
        // 'not-keywords': [],

        'keywords': ['garagem'],
        'not-keywords': ['t0', 't3', 't4', 't5', 'moradia', 'paranhos', 'gondomar', 'valongo', 'maia', 'gondomar', 'mamede infesta', 'pedroso', 'voa de varzim', 'matosinhos', 'campanh', 'vila do conde', 'arcozelo'],

        'min-date': null,
        'max-date': null,

        'aim': 'rent'
    },
    'databases': [
        {
            'name': 'BPIExpressoImobiliario',
            'url': 'http://bpiexpressoimobiliario.pt/{{aim}}/{{type}}/{{min-rooms}}-{{max-rooms}}/{{state}}?pricemax={{max-price}}&num=50&image=0&orderby=rel&pricemin={{min-price}}&page={{page}}',
            'page-start': 1,
            'page-max': 2,
            'type': { 'flat': 'apartamentos', 'house': '' },
            'aim': { 'rent': 'arrendamento', 'buy': '' },
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
                    'element': '#imo_detail #imo_description #imo_description_border',
                    'area-el': '.bottom_dotted_border p + br + p + p',
                    'date-el': '.bottom_dotted_border p + br + p + p + p + p + p + p + p',
                    'description-el': '.bottom_dotted_border h4',
                    'phone-el': '',
                    'email-el': ''
                }
            }
        },
        {
            'name': 'Trovit',
            'url': 'http://casa.trovit.pt/index.php/cod.search_homes/type.{{aim}}/what_d.{{state}}/page.{{page}}',
            'page-start': 1,
            'page-max': 2,
            'type': { 'flat': '', 'house': '' },
            'aim': { 'rent': '2', 'buy': '1' },
            'list': {
                'pages-list': '#wrapper_pager #paginate a',
                'element': '#wrapper_listing .listing .info',
                'title-el': '.leftInfo h4 a',
                'url-el': '.leftInfo h4 a',
                'area-el': '.rightInfo .floorArea',
                'description-el': '.leftInfo p.description',
                'price-el': '.rightInfo .price',
                'inside-item': {
                    'element': '#show_imovel .show_main_holder',
                    'description-el': '#detalhes .textos .descricao'
                }
            }
        },
        {
            'name': 'Olx',
            'url': 'http://{{state}}.olx.pt/nf/{{type}}-p-{{page}}/type,{{aim}}',
            'page-start': 1,
            'page-max': 2,
            'type': { 'flat': 'apartamento-casa-a-venda-cat-367', 'house': 'casas-moradias-para-arrendar-vender-cat-363' },
            'aim': { 'rent': '2', 'buy': '0' },
            'list': {
                'pages-list': '#div_pagination .page_number a',
                'element': '#resultlist #page.results',
                'title-el': '.ti a',
                'url-el': '.ti a',
                'date-el': '.time .date',
                'price-el': '.price',
                'inside-item': {
                    'element': '#offer-content',
                    'description-el': '#description',
                    'phone-el': '#phone_nr span.nr'
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