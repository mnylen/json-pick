function q(path) {
    var fn = selectPath(path);

    if (arguments.length > 1) {
        return fn(arguments[1]);
    } else {
        return fn;
    }
}

function nonEmpty(selector) {
    return selector.length > 0;
}

function identity(fieldSelector) {
    return fieldSelector;
}

function selectPath(path) {
    path = (typeof path === 'string') ? path.split("/").filter(nonEmpty) : path;

    var selectors    = asSelectors(path);
    var defaultValue = undefined;

    function selectNext(item) {
        if (typeof item === 'undefined') {
            return defaultValue;
        }

        var selector = selectors.shift();
        if (selector) {
            return selectNext(selector(item));
        } else {
            return item;
        }
    }

    return function(item) {
        return selectNext(item);
    };
}

function asSelectors(path) {
    if (path.length === 0) {
        return [];
    }

    var spec          = parseComponents(path[0]);
    var remainingPath = path.slice(1);
    var selectors     = [];

    if (spec.field.length > 0) {
        selectors.push(fieldSelector(spec.field));
    }

    if (spec.index) {
        if (spec.index === '*') {
            selectors.push(anyIndexSelector(remainingPath));
            remainingPath = []; // omit the remaining path
        } else {
            selectors.push(numericIndexSelector(spec.index));
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

function fieldSelector(fieldName) {
    return function(object) {
        return object[fieldName];
    };
}

function numericIndexSelector(index) {
    index = (typeof index === 'string') ? parseInt(index, 10) : index;
    return function(array) {
        return array[index];
    }
}

function anyIndexSelector(path) {
    return function(array) {
        var len = array.length;
        var match;

        for (var idx = 0; idx < len; idx++) {
            match = selectPath(path)(array[idx]);
            if (typeof match !== 'undefined') {
                break;
            }
        }

        return match;
    }
}

module.exports = q;
