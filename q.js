function q(path) {
    var fn = selectPath(path);

    if (arguments.length > 1) {
        return fn(arguments[1]);
    } else {
        return fn;
    }
}

function selectPath(path) {
    function nonEmpty(part) {
        return part.length > 0;
    }

    var parts        = path.split("/").filter(nonEmpty);
    var partsLength  = parts.length;
    var defaultValue = undefined;
    
    return function(item) {
        var branch = item;

        for (var idx = 0; idx < partsLength; idx++) {
            var key = parts[idx];
            branch  = branch[key];

            if (typeof branch === 'undefined') {
                // return default
                return defaultValue;
            }
        }

        return branch;
    };
}

module.exports = q;
