function pick(path, matcher) {
    var wrappedPick = pickWrapped(path, matcher);

    return function(data) {
        return unwrap(wrappedPick(data));
    };
}

function pickWrapped(path, matcher) {
    path    = (typeof path === 'string') ? path.split("/").filter(nonEmpty) : path;
    matcher = asMatcher(matcher || valueDefined);

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

    return function(data, parent) {
        data = (data instanceof WrappedValue) ? data : wrap(data, parent); 

        var value = select(data, 0);
        if (typeof value !== 'undefined' && (value.valid || matcher(value))) {
            value.valid = true;
            return value;
        } else {
            return defaultValue;
        }
    };
}

function wrap(value, parent, valid) {
    if (typeof value === 'undefined') {
        return value;
    } else {
        return new WrappedValue(value, parent, valid);
    }
}

function unwrap(wrappedValue) {
    if (typeof wrappedValue !== 'undefined') {
        return wrappedValue.value; 
    } else {
        return undefined;
    }
}

function WrappedValue(value, parent, valid) {
    this.value = value;
    this.parent = parent;
    this.valid = valid;
}

function asMatcher(spec) {
    if (typeof spec === 'function') {
        return spec;
    }

    var compiled = [];
    for (var path in spec) {
        if (!spec.hasOwnProperty(path)) {
            continue;
        }

        var expectedValue = spec[path];
        compiled.push([pick(path), expectedValue]);
    }

    var len = compiled.length;

    return function(data) {
        var idx;
        var fail = false;

        for(idx = 0; idx < len; idx++) {
            var test = compiled[idx];
            var extractValue = test[0];
            var expectedValue = test[1];

            if (extractValue(data) !== expectedValue) {
                fail = true;
                break;
            }
        }

        return !fail;
    };
}

function valueDefined(wrappedValue) {
    return typeof wrappedValue !== 'undefined';
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
        if (spec.field === '..') {
            selectors.push(selectParent);
        } else {
            selectors.push(selectField(spec.field));
        }
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

function selectParent(wrappedObject) {
    return wrappedObject.parent;
}

function selectField(fieldName) {
    return function(wrappedObject) {
        var object = wrappedObject.value;
        return wrap(object[fieldName], wrappedObject);
    };
}

function selectIndex(index) {
    index = (typeof index === 'string') ? parseInt(index, 10) : index;
    return function(wrappedArray) {
        var array = wrappedArray.value;
        return wrap(array[index], wrappedArray);
    }
}

function selectFirstMatchingIndex(path, matcher) {
    return function(wrappedArray) {
        var array = wrappedArray.value;
        var len   = array.length;
        var match = undefined;

        for (var idx = 0; idx < len; idx++) {
            match = pickWrapped(path, matcher)(array[idx], wrappedArray);
            if (typeof match !== 'undefined') {
                return match; 
            }
        }

        return undefined;
    }
}

function selectAllMatchingIndexes(path, matcher) {
    return function(wrappedArray) {
        var array  = wrappedArray.value;
        var result = [];
        var len    = array.length;

        for (var idx = 0; idx < len; idx++) {
            var match = pickWrapped(path, matcher)(array[idx]);
            if (typeof match !== 'undefined') {
                result.push(match.value);
            }
        }

        return wrap(result, wrappedArray, true);
    };
}

module.exports = pick; 
