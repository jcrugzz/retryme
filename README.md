# retryme

A more intuitive [`node-retry`] which behaves more like [`async.retry`]

## Usage


```js
var Retryme = require('retryme');

//
// This function will have the same arguments as the function being attempted
// `opts` here include `min` `max` for Backo configuration as well as `retries`.
//
var operation = new Retryme({
  retries: 2,
  min: 50,
  max: 10000
});

operation.attempt((next) => {
  request('https://whatever.com', (err, res, body) => {
  if (err || res.statusCode !== 200) {
    return next(err || new Error(`Invalid status code ${res.statusCode}));
  }
  next(null, body);
}, (err, body) => {
  if (err) return /* handle me */
  console.dir(body);
});

```

*Now if we want to ignore certain types of errors, we pass a function for configuring those cases*

```js

var retry = require('retryme');

const op = retry.op(err => err.message.includes('404'));

op.attempt(next => {
  request('https://whatever.com', (err, res, body) => {
    if (err || res.statusCode !== 200) {
    // any 404 error here will no longer be retried due to the function above
    return next(err || new Error(`Invalid status code ${res.statusCode}));
  }
  next(null, body);
  });
}, (err, body) => {
  if (err) return /* handle me */
  console.dir(body);
});

```


