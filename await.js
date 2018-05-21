const Retryme = require('./');
const debug = require('diagnostics')('retryme');

/**
 * Wrap up `retryme` with thenables to support async/await
 * @param {Object} opts Options for configuration
 * @param {Object} opts.retry configurations for retryme
 * @param {String} opts.message Description of retryable operations to assemble the logs
 * @param {Function} opts.attempt The real async function which will be retried
 * @param {Function} [opts.ignore] Optional ignore function for `retryme` to terminate retrying when it meets the condition
 *
 * @returns {Promise} A Promise instance represents the result of function execution after retries
 *
 * @public
 */
module.exports = function performRetryme(opts) {
  const { retry, attempt, ignore } = opts;

  return {
    then: (fulfill, reject) => {
      const operation = new Retryme(retry, ignore);

      debug('Start retries with awaiting async attempt function');

      operation.attempt(
        async next => {
          try {
            const body = await attempt;
            return next(null, body);
          } catch (err) {
            debug('error happens, gonna retry');
            return next(err);
          }
        }, (error, body) => {
          if (error) {
            debug('out of retries, will error out.');

            return reject(error);
          }

          debug('retry succeeds');
          fulfill(body);
        });
    }
  };
};

