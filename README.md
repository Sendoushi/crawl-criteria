House search

=============

To install:
npm install

```js
var config = require('./config.json'),
    HouseSearch = require('./HouseSearch'),
    house = new HouseSearch();

// Returns the data
house.search(config, function (err, list) {
    // In case there was an error requesting the data
    if (err) {
        throw err;
    }

    // Logs the list object
    console.log(list);
});
```