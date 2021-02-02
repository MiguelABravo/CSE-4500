var string = '{ "Name": "Miguel Bravo", "Attending": "CSUSB", "Result": "yes" }'; // string used to test JSON.parse
var gaming_consoles = { Microsoft: 'Xbox', Sony: 'Playstation' } // object used to test JSON.stringify
var obj = JSON.parse(string);

// string output
console.log(string);
// objects converted from string output
console.log("Is", obj.Name, "attending", obj.Attending, "?", obj.Result, '\n');

//gaming_consoles output
console.log(gaming_consoles);
// string converted from object output
console.log(JSON.stringify(gaming_consoles));
