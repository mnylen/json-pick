# pick(path, matcher)(data) : pick values from JSON

```javascript
var person = {
  "name" : "John",
  "age" : 32,
  "kids" : [
    { "name" : "Adam", "age" : 10 },
    { "name" : "Emily", "age" : 7 }
  ],
  "relationships" : [
    { "status" : "ongoing", "with" : { "name" : "Susan" } },
    { "status" : "ended", "with" : { "name" : "Katie" } }
  ]
};

// ----- path extraction

pick("/")(person)              // => person
pick("/name")(person)          // => "John"
pick("/kids[0]/name")(person)  // => "Adam"
pick("/kids[]/name")(person)   // => ["Adam", "Emily"]

// ----- matching

pick("/relationships[*]/with/name", { "/../../status" : "ongoing" })(person)
// => "Susan"

pick("/kids[*]", { "/name" : "Adam" })(person)
// => { "name" : "Adam", "age" : 10 }

```

## Idea 

* `pick(path, matcher)(value)` maps `value` to `path` and returns the result if `matcher` accepts it 

* `path` can be thought of as a mapper that maps `value` as another value `selection`

* `matcher` can be thought of as a filter that filters the `selection`

### Paths

Paths are defined as `/`-separated selectors, where each selector maps the current selection
to another value:

| Selector             | Maps to               | Example 
| -------------------- | --------------------- | ----------------------------
| (empty)              | `current`             | 
| `field`              | `current[field]`      | `/name` for John maps to `"John"`
| `[idx]`              | `current[idx]`        | `/kids[0]/name` for John maps to John's first kid's name, `"Adam"`
| `..`                 | `parent`              | `/../../status` (relative to strings `"Susan"` and `"Katie"` in the example)

For convenience, field and index-style selectors can be combined in single path segment (i.e. `/array[0]` instead of `/array/[0]`. 

### Wildcard matching

When using `[idx]` selector, instead of using an numerical index, you can specify a wildcard index using `[\*]`.

This will select the first such value in current selection where the rest of the path can be selected.
I.e. `/kids[\*]/name` would select `"Adam"` because `"Adam"` is the first kid object with a `name` attribute.

Wildcard matching can be used together with custom matchers to create `find`-style queries.

### Any matching

You can also omit the index altogether and use `[]` matcher to filter values in current selection down to those
for which the rest of the path can be selected.

`/kids[]/name` will thus return an array of `["Adam", "Emily"]` because both kid objects contain a `name` attribute.

Any matching can also be used with custom matchers to create `filter`-style queries.
