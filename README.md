# retryme

[![Build
Status](https://travis-ci.org/jcrugzz/retryme.svg?branch=master)](https://travis-ci.org/jcrugzz/retryme)

A more intuitive [`node-retry`][node-retry] which behaves more like [`async.retry`][async-retry]. Utilizes [`Backo`][backo] under the hood for backoff.

Retryme also supports `async/await` now for retrying async attempt functions.

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

Retryme now supports `async/await` by providing `.async` function to retry async attempt functions.

A simple example of how to use it is as follows:

```js

// example of calling the method for async functions returning Promises.
const readFileAsync = require('util').promisify(require('fs').readFile);
const Retryme = require('retryme');

async function main() {
  const op = new Retryme({
    retries: 2,
    min: 50,
    max: 10000
  }, some_ignore_function_if_exists);

  // Wrap a simple file read with retries.
  try {
    const fileContent = await op.async(() => readFileAsync(__dirname + '/index.js'));
  } catch(err) {
    console.log('error after 2 attempts');
    console.error(err);
  }
}

// it supports async functions
async function foo(bad) {
  if (bad !== 'hola') return 'bar';
  throw Error('what happened');
}

async function main() {
  const op = new Retryme();
  try {
    const result = await op.async(() => foo('hello'));
  } catch(err) {
    console.error(err);
  }
}

// it also supports thenables
async function main() {
  await op.async(() => {
    return {
      then: (f, r) => {
        // real functionality happens here
      }
    };
  });
}

```

## test

`npm test`

[node-retry]: https://github.com/tim-kos/node-retry
[async-retry]: https://caolan.github.io/async/docs.html#retry
[backo]: https://github.com/segmentio/backo

