
# q() : field selector for JavaScript

	// Simple path parsing
	
    var person = {
      "name" : "John",
      "age" : 32,
      "bestFriend" : { "name" : "Adam" },
      "relationships" : [
        { "with" : { "name" : "Susan" } },
        { "with" : { "name" : "Katie" } }
      ]
    };
    
    q("/")(person)                           === person
    q("/name")(person)                       === "John"
    q("/age")(person)                        === 32
    q("/bestFriend/name")(person)            === "Adam"
    q("/relationships[0]/with/name")(person) === "Susan"
    