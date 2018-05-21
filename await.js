const Retryme = require('./');
const debug = require('diagnostics')('retryme');

/**
 * Wrap up `retryme` with thenables to support async/await
 * @param {Object} retries configurations for retryme
 * @param {Function} attempt The real async function which will be retried
 * @param {Function} ignore Optional ignore function for `retryme` to terminate retrying when it meets the condition
 *
 * @returns {Promise} A Promise instance represents the result of function execution after retries
 *
 * @public
 */
module.exports = function awaitRetryme(retries, attempt, ignore) {
  return {
    then: (fulfill, reject) => {
      const operation = new Retryme(retries, ignore);

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

