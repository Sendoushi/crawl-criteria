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

        'aim': 'rent',
        'type': 'flat',
        'min-rooms': '1',
        'max-rooms': '2',

        'city': 'porto',

        'keywords': ['garagem'],
        'not-keywords': ['t0', 't3', 't4', 't5', 'moradia', 'paranhos', 'gondomar', 'valongo', 'maia', 'gondomar', 'mamede infesta', 'pedroso', 'voa de varzim', 'matosinhos', 'campanh', 'vila do conde', 'arcozelo']
    },
    'databases': [
        {
            'name': 'BPIExpressoImobiliario',
            'url': 'http://bpiexpressoimobiliario.pt/{{aim}}/{{type}}/t{{min-rooms}}-t{{max-rooms}}/{{city}}?pricemax={{max-price}}&num=50&image=0&orderby=rel&pricemin={{min-price}}&page={{page}}',
            'page-start': 1,
            'page-max': 20,
            'page-gap': 1,
            'type': { 'flat': 'apartamentos', 'house': '' },
            'aim': { 'rent': 'arrendamento', 'buy': '' },
            'list': {
                'pages-list': '#navigation_links #nvgl_pages a.page_number',
                'element': '#resIni .ohidden.w100percent.cboth.mbot25.mleft10 .fleft.ohidden',
                'title-el': 'h2 .adLink',
                'base-url': 'http://bpiexpressoimobiliario.pt',
                'url-el': 'h2 .adLink',
                'description-el': '.bbotlgray.ptop5.pbot7.mh65 .pleft5',
                'price-el': '.fright.ohidden.mright10 .fright.bold.f12.mtop2',
                'inside-item': {
                    'element': '#imo_detail #imo_description #imo_description_border',
                    'description-el': '.bottom_dotted_border h4'
                }
            }
        },
        {
            'name': 'Trovit',
            'url': 'http://casa.trovit.pt/index.php/cod.search_homes/type.{{aim}}/what_d.{{city}}/page.{{page}}',
            'page-start': 1,
            'page-max': 20,
            'page-gap': 1,
            'type': { 'flat': '', 'house': '' },
            'aim': { 'rent': '2', 'buy': '1' },
            'list': {
                'pages-list': '#wrapper_pager #paginate a',
                'element': '#wrapper_listing .listing .info',
                'title-el': '.leftInfo h4 a',
                'url-el': '.leftInfo h4 a',
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
            'url': 'http://{{city}}.olx.pt/nf/{{type}}-p-{{page}}/type,{{aim}}',
            'page-start': 1,
            'page-max': 20,
            'page-gap': 1,
            'type': { 'flat': 'apartamento-casa-a-venda-cat-367', 'house': 'casas-moradias-para-arrendar-vender-cat-363' },
            'aim': { 'rent': '2', 'buy': '0' },
            'list': {
                'pages-list': '#div_pagination .page_number a',
                'element': '#resultlist #page.results',
                'title-el': '.ti a',
                'url-el': '.ti a',
                'price-el': '.price',
                'inside-item': {
                    'element': '#offer-content',
                    'description-el': '#description'
                }
            }
        },
        {
            'name': 'Sapo',
            'url': 'http://casa.sapo.pt/{{aim}}/{{type}}/t{{min-rooms}}-ate-t{{max-rooms}}/?sa=13&lp={{min-price}}&gp={{max-price}}&AOP=1',
            'page-start': 1,
            'page-max': 20,
            'page-gap': 1,
            'type': { 'flat': 'Apartamentos', 'house': 'Moradias' },
            'aim': { 'rent': 'Alugar', 'buy': 'Venda' },
            'list': {
                'pages-list': '.paginador p a',
                'element': '.mainContentBg .propertyList.hlisting',
                'title-el': 'a:first-child .propertyNatLoc h2',
                'url-el': 'a:first-child',
                'price-el': '.propertyDetails span[itemprop="price"]',
                'description-el': '.propertyDetails .propertyDescription',
                'inside-item': {
                    'element': '.mainContentBg',
                    'description-el': '.detailDescription h2'
                }
            }
        },
        {
            'name': 'Imovirtual',
            'url': 'http://www.imovirtual.com/imoveis/{{type}}/{{aim}}/-/{{city}}/{{city}}/size_from,{{min-rooms}},size_to,{{max-rooms}},price_from,{{min-price}},price_to,{{max-price}},search_page,{{page}}',
            'page-start': 0,
            'page-max': 1000,
            'page-gap': 14,
            'type': { 'flat': 'apartamentos', 'house': '' },
            'aim': { 'rent': 'arrendar', 'buy': '' },
            'list': {
                'pages-list': '.paginate .navmenu a',
                'element': '#content_results #resultlist .new_offer',
                'title-el': '.new_offertitle a',
                'base-url': 'http://www.imovirtual.com/',
                'url-el': '.new_offertitle a',
                'description-el': '.new_offerlocation',
                'price-el': '.new_details .details_container .new_price .new_value',
                'inside-item': {
                    'element': '#offer',
                    'description-el': '#content-narrow #attributes_visual + div'
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