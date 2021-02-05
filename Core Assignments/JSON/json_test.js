var string = '{ "Name": "Miguel Bravo", "Attending": "CSUSB", "Result": "yes" }'; // string used to test JSON.parse
var gaming_consoles = { Microsoft: 'Xbox', Sony: 'Playstation' } // object used to test JSON.stringify
var obj = JSON.parse(string);// converting string to object

// string output
console.log(string);
// output of objects converted from string
console.log("Is", obj.Name, "attending", obj.Attending, "?", obj.Result, '\n');

// gaming_consoles output
console.log(gaming_consoles);
// output of string converted from object
console.log(JSON.stringify(gaming_consoles));
