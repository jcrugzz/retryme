# retryme

[![Build
Status](https://travis-ci.org/jcrugzz/retryme.svg?branch=master)](https://travis-ci.org/jcrugzz/retryme)

A more intuitive [`node-retry`][node-retry] which behaves more like [`async.retry`][async-retry]. Utilizes [`Backo`][backo] under the hood for backoff.

Retryme also supports `async/await` now with wrapping up the `retryme` within thenable wrappers.

## Usage

### Regular usage

Here's the example of how to use `retryme` in normal ways.

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
    return next(err || new Error(`Invalid status code ${res.statusCode}`));
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
    return next(err || new Error(`Invalid status code ${res.statusCode}`));
  }
  next(null, body);
  });
}, (err, body) => {
  if (err) return /* handle me */
  console.dir(body);
});

```

### `Async/await` Support

Retryme now supports `async/await`. It accepts three arguments:

- `retry`: The configuration for create a new [retryme instance][retryme-instance].
- `attempt`: The real `async` function which will be retried with `await`.
- `ignore`: The `ignore` function also for setup [retryme instance][retryme-instance] to terminate retries.

A simple example of how to use it is as follows:

```js
const awaitRetryme = require('retryme/await');

function some_async_func(val) {
  return then: (resolve, reject) => {
    if (some_condition) return reject(some_error);
    resolve(val);
  }
}

// example of pass-in params.
async function top-caller() {
  await awaitRetryme({
    retries: 3,
    min: 5,
    max: 10
  }, some_async_func(some_value), some_ignore_function_if_exists);
}
```

## test

`npm test`

[node-retry]: https://github.com/tim-kos/node-retry
[async-retry]: https://caolan.github.io/async/docs.html#retry
[backo]: https://github.com/segmentio/backo
[retryme-instance]: https://github.com/jcrugzz/retryme#regular-usage 
