const fetch = require('node-fetch');

fetch('https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400')
    .then(res => res.json())
    .then(json => console.log(json));

