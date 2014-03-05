var pick = require('../pick');
var expect = require('chai').expect;

var john, katie, susan, hugh, lisa;

hugh = {
    "name" : "Hugh",
    "age"  : 58
};

lisa = {
    "name" : "Lisa",
    "age"  : 60
};

susan = {
    "name" : "Susan",
    "age" : 28,
    "parents" : {
        "mother" : lisa,
        "father" : hugh
    }
};

katie = {
    "name" : "Katie",
    "age" : 32
};

john = {
    "name" : "John",
    "age"  : 32,
    "relationships" : [
        { "status" : "ongoing", "with" : susan },
        { "status" : "ended", "with" : katie }
    ]
};

var persons = [john, susan, katie, hugh, lisa];

function testPick(path, matcher, defaultValue) {
    return function(data) {
        return function(expected) {
            var actual = pick(path, matcher, defaultValue)(data);
            expect(actual).to.eql(expected);
        };
    };
};

testSuite("basic path selection", {
    "select self":
        [testPick("/")(susan), susan],

    "select field from self":
        [testPick("/name")(susan), "Susan"],

    "select field from depth of one":
        [testPick("/parents/father")(susan), hugh],

    "select field from depth of two":
        [testPick("/parents/father/name")(susan), "Hugh"],

    "handle incomplete paths":
        [testPick("/parents/mother/spouse")(susan), undefined],

    "handle missing paths in middle":
        [testPick("/bestFriend/name")(susan), undefined]
});

testSuite("array selection", {
    "select self":
        [testPick("/")(persons), persons],

    "select all elements from self":
        [testPick("/[]")(persons), persons],

    "select index from self":
        [testPick("/[0]")(persons), john],

    "select index from self and subpath from that index":
        [testPick("/[0]/name")(persons), "John"],

    "handle missing indexes":
        [testPick("/[10]")(persons), undefined],

    "handle missing subpaths after indexed selection":
        [testPick("/[0]/bestFriend/name")(persons), undefined],

    "select first index for which the full path can be resolved using [*]":
        [testPick("/[*]/parents/father")(persons), hugh],

    "map self elements to the remaining path":
        [testPick("/[]/name")(persons), persons.map(pick("/name"))],

    "omit indexes that don't match subpath when using []":
        [testPick("/[]/parents/father"), persons, [hugh]],

    "can handle undefined values in array when using []":
        [testPick("/[]/name")([undefined, john]), ["John"]],

    "can handle undefined values in array when using [*]":
        [testPick("/[*]/name")([undefined, john]), "John"],

    "can handle null values in array when using []":
        [testPick("/[]/name")([null, john]), ["John"]],

    "can handle null values in array when using [*]":
        [testPick("/[*]/name")([null, john]), "John"],
});

var numbers = [1,2,3,4,5,6,7,8,9,10];
function isOdd(value)   { return value % 2 !== 0; } 
function greaterThan(min) { return function(value) { return value > min; } }

testSuite("user-provided matcher function", {
    "selects value when it returns true":
        [testPick("/", isOdd)(1), 1],

    "discards value when it returns false":
        [testPick("/", isOdd)(2), undefined],

    "can be used to find first matching item":
        [testPick("/[*]", greaterThan(5))(numbers), 6],

    "can be used to filter arrays":
        [testPick("/[]", isOdd)(numbers), [1,3,5,7,9]]
});

testSuite("matchers", {
    "can validate for property equality":
        [testPick("/relationships[*]",  { "/status" : "ongoing" })(john), { "status" : "ongoing", "with" : susan }],

    "can filter down the path": 
        [testPick("/relationships[*]", { "/with/name" : "Katie" })(john), { "status" : "ended", "with" : katie }],

    "can use parent selector":
        [testPick("/relationships[*]/with/name", { "/../../status" : "ongoing" })(john), "Susan"],

    "can use parent selector (#2)":
        [testPick("/relationships[]/with/name", { "/../../status" : "ended" })(john), ["Katie"]]
});

testSuite("default value", {
    "reverts to provided default when value is not found":
        [testPick("/foo", undefined, "n/a")(john), "n/a"],

    "still returns empty array when /[]/foo does not match anything":
        [testPick("/[]/foo", undefined, "n/a")(persons), []],

    "reverts to provided default when using /[*]/foo selector":
        [testPick("/[*]/foo", undefined, "n/a")(persons), "n/a"]
});

function forEachKeyValue(object, fn) {
    var key;

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            fn(key, object[key]);
        }
    }
}

function testSuite(description, tests) {
    describe(description, function() {
        forEachKeyValue(tests, function(testDescription, data) {
            var test = data[0];
            var expected = data[1];

            it("can " + testDescription, function() {
                test(expected);
            });
        });
    });
}

