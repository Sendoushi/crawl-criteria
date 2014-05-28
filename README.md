Crawler

=============

To install:
npm install

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