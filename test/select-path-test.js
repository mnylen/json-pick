var q = require('../q');
var expect = require('chai').expect;

describe('q: selecting path', function() {
    var fixture = {
        "a" : {
            "b" : {
                "c" : "c in path /a/b"
            }
        }
    };

    forEachKeyValue({
        "/"      : fixture,
        "/a"     : fixture.a,
        "/a/b"   : fixture.a.b,
        "/a/b/c" : fixture.a.b.c
    }, function(path, expected) {
        it("should return " + path + " correctly from the fixture", function() {
            expect(q(path, fixture)).to.eql(expected);
            expect(q(path)(fixture)).to.eql(expected);
        });
    });
});

function forEachKeyValue(object, fn) {
    var key;

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            fn(key, object[key]);
        }
    }
}
