# Crawler

Retrieve data from different databases using html elements to gather the information you need.
It iterates navigation pages and inside pages. (check the examples)

This module is still a little bit buggy. In part because of Phantomjs.

### Install
```
sudo npm install jsdom
npm install
```

### Usage
```js
var Crawler = require('./Crawler'),
    crawler = new Crawler();

// Returns the data
crawler.search(searchCriteria, databases, function (err, list) {
    // In case there was an error requesting the data
    if (err) {
        throw err;
    }

    // Logs the list object
    console.log(list);
});
```

### Examples
Check the folder examples for examples on how to use.

##### Rent porto example
```
node examples/rent-porto/rent-porto.js
```
