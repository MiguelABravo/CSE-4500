const fetch = require('node-fetch');

fetch('https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400')
    .then(res => res.text())
    .then(res => {
       console.log(res, '\n'); // outputs the string data
       const obj = JSON.parse(res); // converts string into an object
       console.log(obj.results.sunrise, obj.results.sunset, obj.results.astronomical_twilight_begin, obj.status, '\n'); // using object to output some of the data
       console.log(obj); // outputs all the data from the object
    })

