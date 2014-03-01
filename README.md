
# pick(path, matcher)(data) : query values from JSON

    var person = {
      "name" : "John",
      "age" : 32,
      "relationships" : [
        { "status" : "ongoing", with" : { "name" : "Susan" } },
        { "status" : "ended", "with" : { "name" : "Katie" } }
      ]
    };
    
    // simple & safe path extraction
    pick("/")(person)                              === person
    pick("/name")(person)                          === "John"
    pick("/missing/path").defaultTo("n/a")(person) === "n/a"
    
    // selections inside arrays
    pick("/relationships[0]/with/name")(person)    === "Susan"  
    pick("/relationships[]/with/name")(person)     === ["Susan", "Katie"]
    
    // filtering with matchers
    pick("/relationships[*]/with/name", { "/../../status" : "ongoing" })(person) === "Susan"
    pick("/relationships[*]/status", { "/../with/name" : "Katie" })(person)      === "ended"   
 

## Paths

Paths consist of one or more mappers, separated by "/". Simply put, a mapper specifies how the current value should be transformed in order to proceed getting value at end of the path.

| Mapper       | Maps to                                                |
| ------------ | ------------------------------------------------------ |
| (empty)      | `self`                                                 |
| `..`         | `parent`                                               |
| `field`      | `self.field`                                           |
| `[idx]`      | `self[idx]`                                            | 
| `[]`         | all `self[idx]` that pass the matcher                  |
| `[*]`        | first `self[idx]` that passes the matcher              | 

## Matchers

Matchers filter values selected by path. The default matcher gives a pass for all defined values (i.e., the ones that exist).

If you want something fancier, you can give a custom function `(value) => boolean` as the matcher.

You can also use a simple property equality matcher by passing an object with one or more of (`path`, `expectedValue`) pairs. Remember, you can use the `..` parent selector.
	
    var currentlyDating = pick("/relationships[]:first/with/name", { "/../../status" : "ongoing" })(person);
    console.log(currentlyDating) // => Susan
