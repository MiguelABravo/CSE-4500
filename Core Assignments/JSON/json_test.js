var string = '{"Name": "Miguel Bravo", "Attending": "CSUSB", "Result": "yes"}';
var obj = JSON.parse(string);

console.log("Is", obj.Name, "attending", obj.Attending, "?", obj.Result);
