function pick(path, matcher) {
    path    = (typeof path === 'string') ? path.split("/").filter(nonEmpty) : path;
    matcher = matcher || valueDefined;

    var selectors    = asSelectors(path, matcher);
    var defaultValue = undefined;

    function select(data, selectorIdx) {
        if (typeof data === 'undefined') {
            return defaultValue;
        }

        var selector = selectors[selectorIdx];
        if (typeof selector !== 'undefined') {
            return select(selector(data), selectorIdx+1);
        } else {
            return data;
        }
    }

    return function(data) {
        var value = select(data, 0);
        if (matcher(value)) {
            return value;
        } else {
            return defaultValue;
        }
    };
}

function valueDefined(selectedValue) {
    return typeof selectedValue !== 'undefined';
}

function nonEmpty(selector) {
    return selector.length > 0;
}

function asSelectors(path, matcher) {
    if (path.length === 0) {
        return [];
    }

    var spec          = parseComponents(path[0]);
    var remainingPath = path.slice(1);
    var selectors     = [];

    if (spec.field.length > 0) {
        selectors.push(selectField(spec.field));
    }

    if (typeof spec.index !== 'undefined') {
        if (spec.index === '*') {
            selectors.push(selectFirstMatchingIndex(remainingPath, matcher));
            remainingPath = []; // omit the remaining path
        } else if (spec.index === '') {
            selectors.push(selectAllMatchingIndexes(remainingPath, matcher));
            remainingPath = [];
        } else {
            selectors.push(selectIndex(spec.index));
        }
    }

    var remainingSelectors = asSelectors(remainingPath);
    return selectors.concat(remainingSelectors);
}

function parseComponents(spec) {
    var indexed = spec[spec.length-1] === ']';

    if (!indexed) {
        return { field : spec }; 
    } else {
        var field = spec.substring(0, spec.lastIndexOf('['));
        var index = spec.substring(spec.lastIndexOf('[')+1, spec.lastIndexOf(']'));

        return { field : field, index : index }; 
    } 
}

function selectField(fieldName) {
    return function(object) {
        return object[fieldName];
    };
}

function selectIndex(index) {
    index = (typeof index === 'string') ? parseInt(index, 10) : index;
    return function(array) {
        return array[index];
    }
}

function selectFirstMatchingIndex(path, matcher) {
    return function(array) {
        var len = array.length;
        var match;

        for (var idx = 0; idx < len; idx++) {
            match = pick(path, matcher)(array[idx]);
            if (typeof match !== 'undefined') {
                break;
            }
        }

        return match;
    }
}

function selectAllMatchingIndexes(path, matcher) {
    return function(array) {
        var result = [];
        var len    = array.length;

        for (var idx = 0; idx < len; idx++) {
            var match = pick(path, matcher)(array[idx]);
            if (typeof match !== 'undefined') {
                result.push(match);
            }
        }

        return result;
    };
}

module.exports = pick; 
