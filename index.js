const Backo = require('backo');
const once = require('one-time');
const failure = require('failure');
const debug = require('diagnostics')('retryme');
const noop = function () {};

function Retryme(opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = null;
  }
  this.ignore = fn || noop;
  this.opts = opts || {};
  this.backo = new Backo(this.opts);
  this.retries = typeof this.opts.retries === 'number'
    ? this.opts.retries
    : 5;
  this.errors = [];
}

Retryme.prototype.attempt = function (action, fn) {
  const self = this;

  debug('executing action function');
  action(once(function next(err) {
    if (!err || err && self.ignore(err)) return fn.apply(this, arguments);
    self.errors.push(err);
    if (!self.retries--) {
      debug('out of retries, erroring');
      return self._error(fn);
    }
    debug('retrying another attempt after backoff');
    setTimeout(() => self.attempt(action, fn), self.backo.duration());
  }));
};

Retryme.prototype.async = function (asyncfn) {
  return new Promise((fulfill, reject) => {
    debug('Start retries with awaiting async attempt function');

    this.attempt(
      next => {
        return asyncfn()
          .then(body => {
            next(null, body);
          }, err => {
            debug('error happens, gonna retry');

            next(err);
          });
      }, (error, body) => {
        if (error) {
          debug('out of retries, will error out.');

          return reject(error);
        }

        debug('retry succeeds');
        fulfill(body);
      });
  });
};

Retryme.prototype._error = function _error(fn) {
  const error = this.errors.pop();
  return fn(
    failure(error,
      this.errors.reduce((acc, err, idx) => {
        acc[`attempt#${idx}`] = err.message;
        return acc;
      }, {})
    )
  );
};

Retryme.operation =
Retryme.create =
Retryme.op = function operation(opts, fn) {
  return new Retryme(opts, fn);
};

module.exports = Retryme;

