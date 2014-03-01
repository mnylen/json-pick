var pick = require('../pick');
var expect = require('chai').expect;

describe('pick: selecting paths', function() {
    var fixture = {
        "a" : {
            "b" : {
                "c" : "c in path /a/b"
            }
        },
        "b" : [
            { "c" : "c in path /b[0]/c" },
            { "c" : "c in path /b[1]/c" },
            { "d" : "d in path /b[2]/d" }
        ]
    };

    forEachKeyValue({
        "/"       : fixture,
        "/a"      : fixture.a,
        "/a/b"    : fixture.a.b,
        "/a/b/c"  : fixture.a.b.c,
        "/b/[0]"  : fixture.b[0],
        "/b[0]"   : fixture.b[0],
        "/b[0]/c" : fixture.b[0].c,
        "/b[1]"   : fixture.b[1],
        "/b[*]/c"  : "c in path /b[0]/c",
        "/b[*]/d"  : "d in path /b[2]/d", 
    }, function(path, expected) {
        it("should return " + path + " correctly from the fixture", function() {
            expect(pick(path)(fixture)).to.eql(expected);
        });
    });
});

describe('pick: selecting path with custom matcher', function() {
    var fixture = {
        "a" : 1,
        "b" : 2,
        "c" : [
            1,
            2,
            3,
            4
        ]
    };

    var evenMatcher = function(number) {
        return number % 2 === 0;
    };

    forEachKeyValue({
        "/a"    : undefined,
        "/b"    : 2,
        "/c"    : undefined,
        "/c[0]" : undefined,
        "/c[1]" : 2,
        "/c[*]" : 2
    }, function(path, expected) {
        it("should return " + path + " correctly from fixture", function() {
            expect(pick(path, evenMatcher)(fixture)).to.eql(expected);
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
