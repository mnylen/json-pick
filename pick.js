function pick(path, matchObject, defaultValue) {
    var matcher  = compileMatcher(matchObject);
    var selector = compileSelector(path, matcher);

    function applyMatcher(selection) {
        if (!selection.matched) {
            selection.matched = matcher(selection.value, selection.parent);
        }

        return selection.matched;
    }

    return function(data, parent) {
        var wasWrapped = (data instanceof Selection);
        data = (data instanceof Selection) ? data : createSelection(data, parent); 

        var selection = selector(data);
        if (typeof selection !== 'undefined' && applyMatcher(selection)) {
            return wasWrapped ? selection : selection.value;
        }

        return defaultValue;
    };
}


function compileMatcher(matchObject) {
    if (typeof matchObject === 'undefined') {
        return function(candidate) {
            return typeof candidate !== 'undefined';
        };
    }

    if (typeof matchObject === 'function') {
        return matchObject;
    }

    var matchers = [];
    for (var path in matchObject) {
        if (matchObject.hasOwnProperty(path)) {
            var expected = matchObject[path];
            var selector = pick(path);
            matchers.push({selector : selector, expected : expected });
        }
    }

    return function(candidate, candidateParent) {
        for(var idx = 0; idx < matchers.length; idx++) {
            var test      = matchers[idx];
            var selection = test.selector(candidate, candidateParent);

            if (selection !== test.expected) {
                return false;
            }
        }

        return true; 
    };
}

function compileSelector(path, matcher) {
    var selectors = selectorsForPath(path, matcher);
    return function(currentSelection) {
        for (var idx = 0; idx < selectors.length; idx++) {
            var selector     = selectors[idx];
            currentSelection = selector(currentSelection);

            if (typeof currentSelection === 'undefined') {
                break;
            }
        }

        return currentSelection;
    }
}

function selectorsForPath(path, matcher) {
    var segments  = toSegments(path); 
    var selectors = [];

    function nonEmpty(selector) {
        return selector.length > 0;
    }

    function toSegments(path) {
        if (typeof path === 'string') {
            return path.split("/").filter(nonEmpty);
        } else { // already segmented
            return path.slice(0);
        }
    }

    while (segments.length > 0) {
        var segment = segments.shift();
        var field  = parseField(segment);
        var index  = parseIndex(segment);

        if (typeof field === 'string') {
            if (field === '..') {
                selectors.push(selectParent);
            } else {
                selectors.push(selectField(field));
            }
        }

        if (typeof index === 'string') {
            if (index === '*') {
                selectors.push(selectAny(segments, matcher));
                segments = [];
            } else if (index === '') {
                selectors.push(selectAll(segments, matcher));
                segments = [];
            } else {
                selectors.push(selectField(parseInt(index)));
            }
        }
    }

    return selectors;
}

function parseField(segment) {
    var indexStart = segment.lastIndexOf('[');
    var length     = (indexStart !== -1) ? indexStart : segment.length;
    var field      = segment.substring(0, length); 
    return field.length > 0 ? field : undefined;
}

function parseIndex(segment) {
    var openingBracket = segment.lastIndexOf('[');
    var closingBracket = segment.lastIndexOf(']');

    if (openingBracket !== -1 && closingBracket !== -1) {
        return segment.substring(openingBracket+1, closingBracket);
    } else {
        return undefined;
    }
}

function selectParent(wrappedObject) {
    return wrappedObject.parent;
}

function selectField(fieldName) {
    return function fieldSelector(wrappedObject) {
        var object = wrappedObject.value;
        return createSelection(object[fieldName], wrappedObject);
    };
}

function selectAny(remainingSegments, matcher) {
    return function anySelector(currentSelection) {
        var array = currentSelection.value;

        for (var idx = 0; idx < array.length; idx++) {
            var nextRoot  = createSelection(array[idx], currentSelection);
            var selection = pick(remainingSegments, matcher)(nextRoot);

            if (typeof selection !== 'undefined') {
                return selection; 
            }
        }

        return undefined;
    }
}

function selectAll(path, matcher) {
    return function allSelector(currentSelection) {
        var result = [];
        var array  = currentSelection.value;

        for (var idx = 0; idx < array.length; idx++) {
            var nextValue = pick(path, matcher)(array[idx]);

            if (typeof nextValue !== 'undefined') {
                result.push(nextValue);
            }
        }

        return createSelection(result, currentSelection, true);
    };
}

function Selection(value, parent, matched) {
    this.value = value;
    this.parent = parent;
    this.matched = matched;
}

function createSelection(value, parent, matched) {
    if (typeof value === 'undefined') {
        return value;
    } else {
        return new Selection(value, parent, matched);
    }
}

module.exports = pick; 
