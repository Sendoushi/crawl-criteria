'use strict';
module.exports = (function () {
    var filtersKeys,
        result,
        filter,
        filterObj;

    function filterFn(list, filters) {
        filtersKeys = Object.keys(filters);

        var newList = [],
            mayEnter,
            filterKey,
            i,
            c;

        for (i = 0; i < list.length; i += 1) {
            result = list[i];
            mayEnter = true;

            for (c = 0; c < filtersKeys.length; c += 1) {
                filter = filtersKeys[c].replace('-el', '');

                if (result.hasOwnProperty(filter)) {
                    filterObj = filters[filtersKeys[c]];

                    // Filter
                    filterKey = Object.keys(filterObj)[0];

                    if (filterKey === 'range' && !range() ||
                        filterKey === 'has' && !has() ||
                        filterKey === 'hasNot' && !hasNot()) {
                        mayEnter = false;
                    }
                }
            }

            if (mayEnter) {
                newList.push(result);
            }
        }

        return newList;
    }

    function range() {
        if (!filterObj.range.min || !filterObj.range.max) {
            return true;
        }

        var val = String(result[filter]),
            min = Number(filterObj.range.min),
            max = Number(filterObj.range.max);

        if (!min || !max) {
            return true;
        }

        // Remove decimals
        // TODO: this should be improved. There shouldn't be a need to remove decimals
        if (val[val.length - 3] === ',' || val[val.length - 3] === '.') {
            val = val.slice(0, val.length - 3);
        }

        // Remove symbols
        // TODO: Shouldn't be needed also
        val = val.replace('.' , '').replace(',' , '');

        val = val.match(/\d+\.?\d*/)[0];
        val = Number(val);

        if (val > min && val < max || val === 1) {
            result[filter] = val;
            return true;
        }
    }

    function has() {
        if (!filterObj.has.length) {
            return true;
        }

        var val = result[filter].toLowerCase(),
            hasKeywords = 0,
            keyword,
            alreadyTrue,
            d,
            e;

        for (d = 0; d < filterObj.has.length; d += 1) {
            keyword = filterObj.has[d].toLowerCase();
            keyword = keyword.split('||');
            alreadyTrue = false;

            for (e = 0; e < keyword.length; e += 1) {
                if (val.replace(keyword[e]) !== val && !alreadyTrue) {
                    hasKeywords += 1;
                    alreadyTrue = true;
                }
            }

        }

        if (filterObj.has.length === hasKeywords) {
            return true;
        }
    }

    function hasNot() {
        if (!filterObj.hasNot.length) {
            return true;
        }

        var val = result[filter].toLowerCase(),
            keyword,
            d;

        for (d = 0; d < filterObj.hasNot.length; d += 1) {
            keyword = filterObj.hasNot[d].toLowerCase();

            if (val.replace(keyword) !== val) {
                return false;
            }
        }

        return true;
    }

    return filterFn;
}());
