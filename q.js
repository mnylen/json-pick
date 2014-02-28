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

    var defaultValue = undefined;

    path = path.split("/").filter(nonEmpty);

    function selectLeaf(path, branch) {
        if (path[path.length-1] === "]") {
            var field = path.substring(0, path.lastIndexOf('['));
            var index = path.substring(path.lastIndexOf('[')+1, path.lastIndexOf(']'));

            if (nonEmpty(field)) {
                return branch[field][index];
            } else { // self index selector
                return branch[index];
            }
        } else {
            return branch[path];
        }
    }

    return function(item) {
        var branch = item;
        var field  = path.shift();

        while (typeof field !== 'undefined') {
            branch = selectLeaf(field, branch);
            field  = path.shift();

            if (typeof branch === 'undefined') {
                return defaultValue;
            }
        }

        return branch;
    };
}

module.exports = q;
