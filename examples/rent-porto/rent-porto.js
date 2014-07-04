(function () {
    'use strict';

    var fs = require('fs'),
        Crawler = require('../../Crawler'),
        crawler = new Crawler(),

        hasKey = ['garagem'],
        hasNotKey = ['sem garagem', 't0', 't1', 't4', 't5', 'moradia', 'ismai', 'valbom', 'trofa', 'canaveses', 'areosa', 'gulpilhares', 'ermesinde', 'paranhos', 'avintes', 'espinho', 'antas', 'perosinho', 'canelas', 'santo tirso', 'paredes', 'os de ferreira', 'serezedo', 'carvalhos', 'a da palmeira', 'lix da marinha', 'oliveira do douro', 'vilar do para', 'canelas', 'valadares', 'gondomar', 'valongo', 'maia', 'gondomar', 'mamede infesta', 'mamede de infesta', 'pedroso', 'voa de varzim', 'matosinhos', 'campanh', 'senhora da hora', 'vermoim', 'aldoar', 'rechousa', 'rio tinto', 'vila do conde', 'arcozelo', 'lavra', 'pedrou', 'fanzeres'],
        minPrice = 400,
        maxPrice = 700,

        searchCriteria,
        databases;

    searchCriteria = {
        timer: 500, // Time between each page request

        searchModifiers: { // Used in db url
            minPrice: minPrice,
            maxPrice: maxPrice,

            aim: 'rent',
            type: 'flat',
            minRooms: '2',
            maxRooms: '3',

            city: 'porto'
        },

        filters: { // Filters a database element with a 'has' or 'hasNot' array and a range
            'price-el': {
                range: {
                    min: minPrice,
                    max: maxPrice
                }
            },
            'description-inside-el': {
                has: hasKey,
                hasNot: hasNotKey
            },
            'price-inside-el': {
                range: {
                    min: minPrice,
                    max: maxPrice
                }
            }
        }
    };

    databases = [{
        name: 'Olx', // Db name
        page: {
            db: 'http://{{city}}.olx.pt/nf/{{type}}-p-{{page}}/type,{{aim}}', // {{}} are values from search-modifiers
            readyTime: 500, // Time to wait before retrieving the DOM
            navIterate: { // Used in the 'db' {{page}} to iterate the pages
                start: 1,
                max: 15,
                gap: 1
            },
            pageModifiers: { // Some modifiers need better specificity
                type: { 'flat': 'apartamento-casa-a-venda-cat-367', 'house': 'casas-moradias-para-arrendar-vender-cat-363' },
                aim: { 'rent': '2', 'buy': '0' }
            }
        },
        elements: { // Elements from the DOM
            navLinks: '#div_pagination .page_number a', // Navigation links so it knows how many pages there are still
            listElements: { // Elements from the list view
                'el': '#resultlist #page.results', // Main element
                'title-el': '.ti a',
                'url-el': '.ti a',
                'price-el': '.price',
                'description-el': '.ti a'
            },
            insideElements: { // Elements in the inside urls
                'el': '#offer-content', // Main element
                'description-inside-el': '#description',
                'img-inside-el': '#offer_galery p #objpic',
                'price-inside-el': '#offer_price'
            }
        }
    },
    {
        name: 'BPIExpressoImobiliario', // Db name
        page: {
            db: 'http://bpiexpressoimobiliario.pt/{{aim}}/{{type}}/t{{min-rooms}}-t{{max-rooms}}/{{city}}?pricemax={{max-price}}&num=50&image=0&orderby=rel&pricemin={{min-price}}&page={{page}}', // {{}} are values from search-modifiers
            baseHref: 'http://bpiexpressoimobiliario.pt', // Used in case of relative href
            readyTime: 500, // Time to wait before retrieving the DOM
            navIterate: { // Used in the 'db' {{page}} to iterate the pages
                start: 1,
                max: 15,
                gap: 1
            },
            pageModifiers: { // Some modifiers need better specificity
                type: { 'flat': 'apartamentos', 'house': '' },
                aim: { 'rent': 'arrendamento', 'buy': '' }
            }
        },
        elements: { // Elements from the DOM
            navLinks: '#navigation_links #nvgl_pages a.page_number', // Navigation links so it knows how many pages there are still
            listElements: { // Elements from the list view
                'el': '#resIni .ohidden.w100percent.cboth.mbot25.mleft10 .fleft.ohidden',
                'title-el': 'h2 .adLink',
                'url-el': 'h2 .adLink',
                'description-el': '.bbotlgray.ptop5.pbot7.mh65 .pleft5',
                'price-el': '.fright.ohidden.mright10 .fright.bold.f12.mtop2'
            },
            insideElements: { // Elements in the inside urls
                'el': '#imo_detail #imo_description #imo_description_border',
                'description-inside-el': '.bottom_dotted_border h4',
                'img-inside-el': '#big_img'
            }
        }
    },
    {
        name: 'Trovit', // Db name
        page: {
            db: 'http://casa.trovit.pt/index.php/cod.search_homes/type.{{aim}}/what_d.{{city}}/page.{{page}}',
            readyTime: 500, // Time to wait before retrieving the DOM
            navIterate: { // Used in the 'db' {{page}} to iterate the pages
                start: 1,
                max: 15,
                gap: 1
            },
            pageModifiers: { // Some modifiers need better specificity
                type: { 'flat': '', 'house': '' },
                aim: { 'rent': '2', 'buy': '1' }
            }
        },
        elements: { // Elements from the DOM
            navLinks: '#wrapper_pager #paginate a', // Navigation links so it knows how many pages there are still
            listElements: { // Elements from the list view
                'el': '#wrapper_listing .listing .info',
                'title-el': '.leftInfo h4 a',
                'url-el': '.leftInfo h4 a',
                'description-el': '.leftInfo p.description',
                'price-el': '.rightInfo .price'
            },
            insideElements: { // Elements in the inside urls
                'el': '#show_imovel .show_main_holder',
                'description-inside-el': '#detalhes .textos .descricao',
                'img-inside-el': '#ImgSlide2'
            }
        }
    },
    {
        name: 'Sapo', // Db name
        page: {
            db: 'http://casa.sapo.pt/{{aim}}/{{type}}/t{{min-rooms}}-ate-t{{max-rooms}}/?sa=13&lp={{min-price}}&gp={{max-price}}&AOP=1',
            readyTime: 500, // Time to wait before retrieving the DOM
            navIterate: { // Used in the 'db' {{page}} to iterate the pages
                start: 1,
                max: 15,
                gap: 1
            },
            pageModifiers: { // Some modifiers need better specificity
                type: { 'flat': 'Apartamentos', 'house': 'Moradias' },
                aim: { 'rent': 'Alugar', 'buy': 'Venda' }
            }
        },
        elements: { // Elements from the DOM
            navLinks: '.paginador p a', // Navigation links so it knows how many pages there are still
            listElements: { // Elements from the list view
                'el': '.mainContentBg .propertyList.hlisting',
                'title-el': 'a:first-child .propertyNatLoc h2',
                'url-el': 'a:first-child',
                'price-el': '.propertyDetails span[itemprop=\'price\']',
                'description-el': '.propertyDetails .propertyDescription'
            },
            insideElements: { // Elements in the inside urls
                'el': '.mainContentBg',
                'description-inside-el': '.detailDescription h2',
                'img-inside-el': '#divPhotos .detailMediaDisplay #ImgSlide2'
            }
        }
    },
    {
        name: 'Imovirtual', // Db name
        page: {
            db: 'http://www.imovirtual.com/imoveis/{{type}}/{{aim}}/-/{{city}}/{{city}}/size_from,{{min-rooms}},size_to,{{max-rooms}},price_from,{{min-price}},price_to,{{max-price}},search_page,{{page}}',
            readyTime: 500, // Time to wait before retrieving the DOM
            navIterate: { // Used in the 'db' {{page}} to iterate the pages
                start: 0,
                max: 750,
                gap: 14
            },
            pageModifiers: { // Some modifiers need better specificity
                type: { 'flat': 'apartamentos', 'house': '' },
                aim: { 'rent': 'arrendar', 'buy': '' }
            }
        },
        elements: { // Elements from the DOM
            navLinks: '.paginate .navmenu a', // Navigation links so it knows how many pages there are still
            listElements: { // Elements from the list view
                'el': '#content_results #resultlist .new_offer',
                'title-el': '.new_offertitle a',
                'url-el': '.new_offertitle a',
                'description-el': '.new_offerlocation',
                'price-el': '.new_details .details_container .new_price .new_value'
            },
            insideElements: { // Elements in the inside urls
                'el': '#offer',
                'description-inside-el': '#content-narrow #attributes_visual + div',
                'img-inside-el': '#offer_galery #objpic',
                'price-inside-el': '.list-specs span b'
            }
        }
    }];

    // Returns the data
    crawler.iterate({
        searchCriteria: searchCriteria,
        databases: databases
    }, function (err, list) {
        // In case there was an error requesting the data
        if (err) {
            return console.log(err);
        }

        // Logs the list object
        fs.writeFile('./data-rent-porto.json', JSON.stringify(list, null, 4), function (err) {
            if (err) {
                console.log(err);
            }
        });

        fs.writeFile('./data-rent-porto.js', 'var jsonObject = ' + JSON.stringify(list, null, 4) + ';', function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}());
